"use client";

import React, { useState } from "react";
import RequireAuth from "@/lib/auth/RequireAuth";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useCultivos } from "@/lib/hooks/useCultivos";
import { enviarMensajeIA, procesarImagenes, convertirUrlABase64, prepararContextoCultivo } from "@/lib/services/chat";
import type { ImagenMensaje } from "@/types/chat";
import type { Cultivo } from "@/types/cultivo";

const SimuladorPage = () => {
    const { user } = useAuth();
    const { cultivos, loading: loadingCultivos } = useCultivos();

    // Tabs
    const [activeTab, setActiveTab] = useState<'doctor' | 'ambiente'>('doctor');

    // States for Doctor IA
    const [dragActive, setDragActive] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string; file?: File; id?: string; fromGallery?: boolean } | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [diagnosis, setDiagnosis] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cultivoSeleccionadoId, setCultivoSeleccionadoId] = useState<string>('');
    const [galleryImages, setGalleryImages] = useState<Cultivo['galeria']>([]);

    // States for Environment Simulator
    const [temp, setTemp] = useState(24);
    const [humidity, setHumidity] = useState(60);

    // Update gallery images when crop selection changes
    React.useEffect(() => {
        if (cultivoSeleccionadoId) {
            const cultivo = cultivos.find(c => c.id === cultivoSeleccionadoId);
            setGalleryImages(cultivo?.galeria || []);
        } else {
            setGalleryImages([]);
        }
    }, [cultivoSeleccionadoId, cultivos]);

    // Handle file upload
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const file = files[0];
            const url = URL.createObjectURL(file);
            setSelectedImage({ url, file, fromGallery: false });
            setDiagnosis(null);
            setError(null);
        }
    };

    // Handle drag and drop
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                const url = URL.createObjectURL(file);
                setSelectedImage({ url, file, fromGallery: false });
                setDiagnosis(null);
                setError(null);
            }
        }
    };

    // Handle gallery image selection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleGallerySelect = (img: any) => {
        setSelectedImage({
            url: img.url,
            id: img.id,
            fromGallery: true
        });
        setDiagnosis(null);
        setError(null);
        // Scroll to diagnosis area
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Run diagnosis
    const handleDiagnose = async () => {
        if (!selectedImage) return;

        setAnalyzing(true);
        setError(null);
        setDiagnosis(null);

        try {
            let processedImages: ImagenMensaje[] = [];

            if (selectedImage.fromGallery) {
                // Convert gallery URL to base64
                const base64 = await convertirUrlABase64(selectedImage.url);
                processedImages = [{
                    id: selectedImage.id || 'gallery_img',
                    name: 'gallery_image.jpg',
                    url: selectedImage.url,
                    base64: base64,
                    mimeType: 'image/jpeg', // Assumption for gallery images
                    size: 0,
                    uploadedAt: new Date().toISOString()
                }];
            } else if (selectedImage.file) {
                // Process uploaded file
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(selectedImage.file);
                processedImages = await procesarImagenes(dataTransfer.files);
            }

            // Prepare context (minimal or from selected crop)
            const cultivo = cultivos.find(c => c.id === cultivoSeleccionadoId);
            const contexto = cultivo ? prepararContextoCultivo(cultivo) : { id: 'simulador', nombre: 'Simulador' };

            // Send to AI
            const prompt = "Actúa como un agrónomo experto. Analiza esta imagen detalladamente para detectar plagas, deficiencias de nutrientes, enfermedades o problemas de salud en la planta. Proporciona un diagnóstico claro, posibles causas y recomendaciones de tratamiento paso a paso.";

            // We use enviarMensajeIA directly as we don't need the full chat flow state management here
            const response = await enviarMensajeIA(
                prompt,
                contexto,
                processedImages,
                undefined,
                user?.email
            );

            setDiagnosis(response);

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Error al procesar el diagnóstico');
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <RequireAuth>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Link href="/laboratorio" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <span className="text-3xl">🧪</span> Simulador & Diagnóstico
                                </h1>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex space-x-8 mt-6">
                            <button
                                onClick={() => setActiveTab('doctor')}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'doctor'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                🚑 Doctor IA
                            </button>
                            <button
                                onClick={() => setActiveTab('ambiente')}
                                className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ambiente'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                🌡️ Simulador de Ambiente
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">

                    {/* CONTENT: DOCTOR IA */}
                    {activeTab === 'doctor' && (
                        <div className="max-w-4xl mx-auto space-y-8">

                            {/* Main Diagnostic Area */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Diagnóstico Inteligente</h2>
                                <p className="text-gray-600 text-center mb-8">Sube una foto o selecciona de tu galería para identificar problemas.</p>

                                {!selectedImage ? (
                                    <div
                                        className={`
                                            border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer text-center
                                            ${dragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                                        `}
                                        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                                        onDragOver={(e) => { e.preventDefault(); }}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('file-upload')?.click()}
                                    >
                                        <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 transform transition-transform group-hover:scale-110">
                                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Sube tu foto aquí</h3>
                                        <p className="text-gray-500 mb-6">Arrastra y suelta o haz clic para explorar</p>
                                        <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition shadow-lg shadow-blue-200">
                                            Seleccionar Archivo
                                        </button>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileSelect}
                                        />
                                    </div>
                                ) : (
                                    <div className="relative rounded-2xl overflow-hidden border border-gray-200 bg-gray-50">
                                        <div className="aspect-video relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={selectedImage.url}
                                                alt="Preview"
                                                className="w-full h-full object-contain bg-black/5"
                                            />
                                            <button
                                                onClick={() => {
                                                    setSelectedImage(null);
                                                    setDiagnosis(null);
                                                }}
                                                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition"
                                                title="Eliminar imagen"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div className="p-6 bg-white border-t border-gray-100 flex justify-center">
                                            <button
                                                onClick={handleDiagnose}
                                                disabled={analyzing}
                                                className={`
                                                    flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg transition-all
                                                    ${analyzing ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-200 hover:-translate-y-0.5'}
                                                `}
                                            >
                                                {analyzing ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        Analizando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                        </svg>
                                                        Realizar Diagnóstico
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Result Area */}
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 flex items-center gap-3 animate-fade-in">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {error}
                                </div>
                            )}

                            {diagnosis && (
                                <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden animate-fade-in">
                                    <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 flex items-center gap-2">
                                        <span className="text-xl">📋</span>
                                        <h3 className="font-bold text-indigo-900">Resultado del Análisis</h3>
                                    </div>
                                    <div className="p-8 prose prose-indigo max-w-none">
                                        <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                                            {diagnosis}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Gallery Selection Section */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Seleccionar de mis Cultivos
                                </h3>

                                <div className="grid gap-6">
                                    {/* Crop Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cultivo</label>
                                        <select
                                            value={cultivoSeleccionadoId}
                                            onChange={(e) => setCultivoSeleccionadoId(e.target.value)}
                                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-3 px-4"
                                            disabled={loadingCultivos}
                                        >
                                            <option value="">-- Selecciona un cultivo --</option>
                                            {cultivos.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Gallery Grid */}
                                    {cultivoSeleccionadoId && (
                                        <div className="space-y-4">
                                            <p className="text-sm text-gray-500">
                                                {galleryImages && galleryImages.length > 0
                                                    ? `Mostrando ${galleryImages.length} fotos`
                                                    : 'No hay fotos en este cultivo'}
                                            </p>

                                            {galleryImages && galleryImages.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                                    {galleryImages.map((img) => (
                                                        <div
                                                            key={img.id}
                                                            onClick={() => handleGallerySelect(img)}
                                                            className="group aspect-square relative cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:ring-2 hover:ring-blue-500"
                                                        >
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={img.url}
                                                                alt={img.nombre || 'Foto cultivo'}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                                            />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                    <p className="text-gray-400 text-sm">Sube fotos en la sección de &quot;Galería&quot; de tu cultivo</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CONTENT: SIMULADOR AMBIENTE */}
                    {activeTab === 'ambiente' && (
                        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                            {/* Controls */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Condiciones Actuales</h2>

                                <div className="space-y-8">
                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="font-medium text-gray-700">Temperatura (°C)</label>
                                            <span className="font-bold text-blue-600">{temp}°C</span>
                                        </div>
                                        <input
                                            type="range" min="10" max="40" step="0.5"
                                            value={temp}
                                            onChange={(e) => setTemp(parseFloat(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>10°C</span>
                                            <span>40°C</span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-2">
                                            <label className="font-medium text-gray-700">Humedad Relativa (%)</label>
                                            <span className="font-bold text-blue-600">{humidity}%</span>
                                        </div>
                                        <input
                                            type="range" min="20" max="90" step="1"
                                            value={humidity}
                                            onChange={(e) => setHumidity(parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                                            <span>20%</span>
                                            <span>90%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Prediction Display */}
                            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg p-8 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

                                <h2 className="text-xl font-bold mb-6 relative z-10">Predicción IA</h2>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-xl">
                                        <span className="text-sm text-gray-300">VPD (Déficit de Presión)</span>
                                        <span className="text-xl font-mono font-bold text-emerald-400">1.2 kPa</span>
                                    </div>

                                    <div className="p-4 bg-white/10 rounded-xl">
                                        <span className="text-sm text-gray-300 block mb-2">Riesgo de Plagas</span>
                                        <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                                            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                                        </div>
                                        <span className="text-xs text-yellow-400">Moderado - Araña Roja activa</span>
                                    </div>

                                    <div className="p-4 bg-white/10 rounded-xl">
                                        <span className="text-sm text-gray-300 block mb-2">Riesgo de Moho (Botrytis)</span>
                                        <div className="w-full bg-gray-700 h-2 rounded-full mb-1">
                                            <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                                        </div>
                                        <span className="text-xs text-green-400">Bajo</span>
                                    </div>
                                </div>

                                <p className="text-xs text-gray-500 mt-6 relative z-10">
                                    * Simulación basada en modelos predictivos teóricos. Consulta siempre tus plantas reales.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </RequireAuth>
    );
};

export default SimuladorPage;
