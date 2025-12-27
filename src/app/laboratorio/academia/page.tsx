"use client";

import React, { useState, useMemo } from "react";
import RequireAuth from "@/lib/auth/RequireAuth";
import Link from "next/link";
import { useCultivos } from "@/lib/hooks/useCultivos";

// Definition of the detailed content structure
// Definition of the detailed content structure
// interface StageDetail {
//     steps: { title: string; desc: string }[];
//     params: { temp: string; humidity: string; light: string; ec?: string; ph?: string };
//     checklist: string[];
// }

const AcademiaPage = () => {
    const { cultivos, loading } = useCultivos();
    const [selectedCropId, setSelectedCropId] = useState<string>('');

    // State for the modal
    const [selectedStage, setSelectedStage] = useState<typeof stages[0] | null>(null);

    const selectedCrop = useMemo(() =>
        cultivos.find(c => c.id === selectedCropId),
        [cultivos, selectedCropId]);

    // Calculate days since start
    const daysSinceStart = useMemo(() => {
        if (!selectedCrop?.fechaComienzo) return 0;
        const start = new Date(selectedCrop.fechaComienzo);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - start.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }, [selectedCrop]);

    // Determine current stage logic (Simplified for demo)
    const currentStageId = useMemo(() => {
        if (!selectedCrop) return null;
        if (selectedCrop.fechaInicioFloracion && new Date(selectedCrop.fechaInicioFloracion) <= new Date()) {
            return 'floracion';
        }
        if (daysSinceStart < 10) return 'germinacion';
        if (daysSinceStart < 60) return 'vegetacion'; // Generic threshold
        return 'floracion';
    }, [selectedCrop, daysSinceStart]);

    const stages = [
        {
            id: "germinacion",
            title: "1. Germinación",
            subtitle: "Los primeros días de vida",
            description: "Aprende a despertar tus semillas y darles el mejor comienzo posible.",
            color: "bg-green-100 text-green-700",
            icon: "🌱",
            days: "Días 1-7",
            guide: {
                steps: [
                    { title: "Hidratación (12-24h)", desc: "Sumerge las semillas en un vaso de agua mineral (pH ~6.0) y guárdalo en un lugar oscuro y cálido (20-25°C). Espera a que se hundan." },
                    { title: "Método Servilleta", desc: "Coloca las semillas entre servilletas de papel húmedas (no empapadas) dentro de un tupper o entre dos platos para mantener la humedad." },
                    { title: "Plantación", desc: "Cuando la raicilla (radícula) tenga 1-2 cm, plántala con la raíz hacia abajo en un sustrato ligero o jiffy, a 5mm de profundidad." },
                ],
                params: {
                    temp: "22 - 26 °C",
                    humidity: "70 - 90%",
                    light: "Oscuridad (hasta brotar) / Luz tenue"
                },
                checklist: [
                    "Verificar pH del agua de hidratación",
                    "Asegurar oscuridad total durante hidratación",
                    "Mantener servilletas siempre húmedas",
                    "Plantar con delicadeza (raíz abajo)"
                ]
            }
        },
        {
            id: "vegetacion",
            title: "2. Vegetación",
            subtitle: "Crecimiento explosivo",
            description: "Maximiza el desarrollo de hojas y tallos fuertes para una gran producción.",
            color: "bg-emerald-100 text-emerald-700",
            icon: "🌿",
            days: "Semanas 2-8",
            guide: {
                steps: [
                    { title: "Trasplante y Enraizamiento", desc: "Una vez la plántula tenga 3-4 nudos, trasplanta a su maceta final o intermedia. Usa estimulador de raíces las primeras semanas." },
                    { title: "Gestión Lumínica", desc: "Ciclo 18/6 (18h luz / 6h oscuridad). Mantén las luces a la distancia recomendada por el fabricante para evitar espigamiento." },
                    { title: "Poda y Entrenamiento", desc: "A partir del 4º-5º nudo puedes aplicar poda Apical o FIM para multiplicar puntas. Usa LST (Low Stress Training) para abrir la estructura." },
                ],
                params: {
                    temp: "22 - 28 °C",
                    humidity: "50 - 70%",
                    light: "18h LUZ / 6h OSCURIDAD",
                    ec: "0.8 - 1.2 mS",
                    ph: "5.8 - 6.2"
                },
                checklist: [
                    "Aplicar preventivos de plagas (Neem, etc.)",
                    "Revisar altura de las luces semanalmente",
                    "Medir pH/EC en cada riego",
                    "Realizar podas solo si la planta está sana"
                ]
            }
        },
        {
            id: "pre-floracion",
            title: "3. Pre-Floración",
            subtitle: "Preparando el cambio",
            description: "Identificación de sexo y transición lumínica crítica.",
            color: "bg-yellow-100 text-yellow-700",
            icon: "⚡",
            days: "Semana 8-9",
            guide: {
                steps: [
                    { title: "Cambio de Fotoperiodo", desc: "Cambia el ciclo de luz a 12/12. Esto indica a la planta que el verano ha terminado y debe florecer." },
                    { title: "El Estirón (Stretch)", desc: "La planta puede duplicar o triplicar su tamaño en estas 2 semanas. Mantén el nitrógeno pero empieza a introducir abono de floración." },
                    { title: "Sexado", desc: "Verifica que no haya machos (bolitas) si usas semillas regulares. Las hembras mostrarán los primeros pistilos blancos." },
                ],
                params: {
                    temp: "20 - 26 °C",
                    humidity: "50 - 60%",
                    light: "12h LUZ / 12h OSCURIDAD"
                },
                checklist: [
                    "Verificar fugas de luz en el periodo oscuro",
                    "Colocar malla SCROG si es necesario",
                    "Revisar sexado de plantas diariamente",
                    "Ajustar ventilación para humedad decreciente"
                ]
            }
        },
        {
            id: "floracion",
            title: "4. Floración",
            subtitle: "Producción de frutos",
            description: "Engorde de cogollos, resina y maduración.",
            color: "bg-purple-100 text-purple-700",
            icon: "🌸",
            days: "Semanas 9-16",
            guide: {
                steps: [
                    { title: "Engorde", desc: "Semanas 3-6 de flora. Aumenta fósforo y potasio (PK). Los cogollos comienzan a formarse y unirse." },
                    { title: "Resina y Terpenos", desc: "Semanas finales. Baja la temperatura si puedes para estimular resina/colores. Evita estrés por calor." },
                    { title: "Lavado de Raíces", desc: "Aproximadamente 2 semanas antes del corte, riega solo con agua para eliminar exceso de sales y mejorar el sabor." },
                ],
                params: {
                    temp: "18 - 26 °C",
                    humidity: "40 - 50% (¡CRÍTICO!)",
                    light: "12h LUZ / 12h OSCURIDAD",
                    ec: "1.2 - 2.0+ mS",
                    ph: "6.0 - 6.5"
                },
                checklist: [
                    "Revisar cogollos en busca de moho/botrytis",
                    "Dejar de aplicar foliares (humedad en flor)",
                    "Observar tricomas con lupa/microscopio",
                    "Planificar fecha de corte"
                ]
            }
        },
        {
            id: "cosecha",
            title: "5. Cosecha & Curado",
            subtitle: "El arte final",
            description: "Corte, secado y curado para el mejor sabor y potencia.",
            color: "bg-amber-100 text-amber-700",
            icon: "✂️",
            days: "Final",
            guide: {
                steps: [
                    { title: "Corte / Manicurado", desc: "Corta la planta (entera o por ramas). Quita las hojas grandes. Puedes manicurar en fresco o en seco." },
                    { title: "Secado", desc: "Cuelga las ramas boca abajo en lugar oscuro, ventilado (sin aire directo) y fresco (18-20°C / 50% HR). Tarda 10-15 días. La rama debe crujir, no doblarse." },
                    { title: "Curado", desc: "Mete los cogollos en frascos de cristal. Abre 5-10 min al día durante las primeras 3 semanas para renovar aire." },
                ],
                params: {
                    temp: "18 - 20 °C (Secado)",
                    humidity: "50 - 55% (Secado) / 62% (Curado)",
                    light: "OSCURIDAD ABSOLUTA"
                },
                checklist: [
                    "Limpiar zona de secado",
                    "Tener tijeras desinfectadas listas",
                    "Comprobar humedad de frascos con higrómetro",
                    "Paciencia: el curado mejora todo"
                ]
            }
        }
    ];

    return (
        <RequireAuth>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/laboratorio" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <h1 className="text-2xl font-bold text-gray-900">Academia de Cultivo</h1>
                            </div>

                            {/* Crop Selector Context */}
                            <div className="flex items-center gap-3 bg-gray-100 px-4 py-2 rounded-xl">
                                <span className="text-sm text-gray-500 font-medium">Personalizar para:</span>
                                <select
                                    value={selectedCropId}
                                    onChange={e => setSelectedCropId(e.target.value)}
                                    className="bg-transparent text-sm font-bold text-gray-900 outline-none cursor-pointer min-w-[150px]"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {!loading && cultivos.map(c => (
                                        <option key={c.id} value={c.id}>{c.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dynamic Context Header */}
                {selectedCrop && (
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg animate-in slide-in-from-top-2 duration-300">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                                <div>
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        🌱 {selectedCrop.nombre}
                                    </h2>
                                    <p className="text-green-100 text-sm mt-1">
                                        Edad: <span className="font-semibold text-white">{daysSinceStart} días</span>
                                        {' '}| Fase probable: <span className="font-semibold text-white uppercase">{currentStageId}</span>
                                    </p>
                                </div>
                                {/* Dynamic Tip */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 max-w-md border border-white/20">
                                    <p className="text-xs font-medium text-green-50 mb-1">💡 Tip para hoy:</p>
                                    <p className="text-sm font-medium">
                                        {currentStageId === 'vegetacion'
                                            ? 'Asegúrate de mantener la humedad alta (~65%) para potenciar el crecimiento foliar.'
                                            : currentStageId === 'floracion'
                                                ? 'Reduce la humedad al 45% para evitar hongos en los cogollos.'
                                                : 'Mantén el sustrato húmedo pero no empapado.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Timeline Grid */}
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid gap-8 md:grid-cols-1 max-w-3xl mx-auto relative">

                        {/* Vertical Line for Desktop */}
                        <div className="hidden md:block absolute left-8 top-0 bottom-0 w-1 bg-gray-200 rounded-full"></div>

                        {stages.map((stage) => {
                            const isActive = selectedCrop ? stage.id === currentStageId : false;

                            return (
                                <div
                                    key={stage.id}
                                    className={`relative flex items-start gap-6 group transition-all duration-500 ${isActive ? 'opacity-100' : selectedCrop ? 'opacity-60 hover:opacity-100' : 'opacity-100'}`}
                                >
                                    {/* Icon Marker */}
                                    <div className={`
                   relative z-10 flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-all duration-300
                   ${isActive ? 'ring-4 ring-green-500 ring-offset-2 scale-110' : ''}
                   ${stage.color} group-hover:scale-110
                `}>
                                        {stage.icon}
                                    </div>

                                    {/* Content Card */}
                                    <div className={`
                   flex-1 bg-white p-6 rounded-2xl shadow-sm border transition-all duration-300 relative
                   ${isActive ? 'border-green-500 shadow-green-100 shadow-lg scale-[1.02]' : 'border-gray-100 hover:shadow-lg hover:border-green-200'}
                `}>
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                                {stage.title}
                                                {isActive && <span className="bg-green-600 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Estás aquí</span>}
                                            </h3>
                                            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-wider">
                                                {stage.days}
                                            </span>
                                        </div>
                                        <h4 className="text-sm font-medium text-green-600 mb-3">{stage.subtitle}</h4>
                                        <p className="text-gray-600 mb-4">{stage.description}</p>

                                        <button
                                            onClick={() => setSelectedStage(stage)}
                                            className="text-green-600 font-bold text-sm flex items-center group-hover:translate-x-1 transition-transform border border-green-200 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100"
                                        >
                                            Ver Guía & Checklist
                                            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Detailed Guide Modal */}
                {selectedStage && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 slide-in-from-bottom-5 duration-300">

                            {/* Modal Header */}
                            <div className={`p-6 ${selectedStage.color} bg-opacity-10 border-b border-gray-100 flex justify-between items-start`}>
                                <div className="flex items-center gap-4">
                                    <span className={`text-4xl p-3 rounded-2xl bg-white shadow-sm`}>{selectedStage.icon}</span>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedStage.title}</h2>
                                        <p className="text-gray-600 font-medium">{selectedStage.subtitle}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedStage(null)}
                                    className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors shadow-sm"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Modal Content - Scrollable */}
                            <div className="overflow-y-auto p-6 space-y-8 custom-scrollbar">

                                {/* 1. Paso a Paso */}
                                <section>
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">1</span>
                                        Instrucciones Paso a Paso
                                    </h3>
                                    <div className="space-y-4 pl-4 border-l-2 border-blue-100 ml-4">
                                        {selectedStage.guide.steps.map((step, idx) => (
                                            <div key={idx} className="relative pl-6 pb-2">
                                                <span className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-blue-200 border-2 border-white"></span>
                                                <h4 className="font-bold text-gray-800 text-base mb-1">{step.title}</h4>
                                                <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* 2. Parámetros */}
                                    <section className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">2</span>
                                            Parámetros Ideales
                                        </h3>
                                        <ul className="space-y-3">
                                            <li className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                                <span className="text-gray-500">🌡️ Temperatura</span>
                                                <span className="font-bold text-gray-800">{selectedStage.guide.params.temp}</span>
                                            </li>
                                            <li className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                                <span className="text-gray-500">💧 Humedad</span>
                                                <span className="font-bold text-gray-800">{selectedStage.guide.params.humidity}</span>
                                            </li>
                                            <li className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                                <span className="text-gray-500">☀️ Luz</span>
                                                <span className="font-bold text-gray-800 text-right max-w-[50%]">{selectedStage.guide.params.light}</span>
                                            </li>
                                            {selectedStage.guide.params.ec && (
                                                <li className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                                    <span className="text-gray-500">⚡ EC</span>
                                                    <span className="font-bold text-gray-800">{selectedStage.guide.params.ec}</span>
                                                </li>
                                            )}
                                            {selectedStage.guide.params.ph && (
                                                <li className="flex justify-between items-center text-sm border-b border-gray-200 pb-2">
                                                    <span className="text-gray-500">🧪 pH</span>
                                                    <span className="font-bold text-gray-800">{selectedStage.guide.params.ph}</span>
                                                </li>
                                            )}
                                        </ul>
                                    </section>

                                    {/* 3. Checklist */}
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-sm">3</span>
                                            Checklist de Etapa
                                        </h3>
                                        <div className="space-y-3 bg-green-50/50 p-4 rounded-2xl border border-green-100">
                                            {selectedStage.guide.checklist.map((item, idx) => (
                                                <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                                                    <input type="checkbox" className="mt-1 w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer" />
                                                    <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{item}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setSelectedStage(null)}
                                    className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors"
                                >
                                    Entendido, cerrar
                                </button>
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </RequireAuth>
    );
};

export default AcademiaPage;
