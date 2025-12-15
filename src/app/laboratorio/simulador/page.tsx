"use client";

import React, { useState } from "react";
import RequireAuth from "@/lib/auth/RequireAuth";
import Link from "next/link";

const SimuladorPage = () => {
    const [activeTab, setActiveTab] = useState<'doctor' | 'ambiente'>('doctor');

    // States for Environment Simulator
    const [temp, setTemp] = useState(24);
    const [humidity, setHumidity] = useState(60);

    // States for Doctor IA
    const [dragActive, setDragActive] = useState(false);

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
                        <div className="max-w-3xl mx-auto">
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Diagnóstico Inteligente</h2>
                                    <p className="text-gray-600">Sube una foto clara de la hoja o planta afectada. Nuestra IA analizará plagas, carencias o excesos.</p>
                                </div>

                                <div
                                    className={`
                    border-2 border-dashed rounded-2xl p-12 transition-colors cursor-pointer
                    ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
                  `}
                                    onDragEnter={() => setDragActive(true)}
                                    onDragLeave={() => setDragActive(false)}
                                >
                                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Arrastra tu foto aquí</h3>
                                    <p className="text-sm text-gray-500 mb-4">o haz clic para seleccionar</p>
                                    <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                                        Seleccionar Foto
                                    </button>
                                </div>

                                <div className="mt-8 text-left bg-yellow-50 p-4 rounded-lg border border-yellow-100 flex gap-3">
                                    <span className="text-2xl">💡</span>
                                    <div>
                                        <h4 className="font-semibold text-yellow-900 text-sm">Consejo para mejor precisión</h4>
                                        <p className="text-xs text-yellow-800">Asegúrate de tener buena iluminación y que la zona afectada esté enfocada. Evita fotos borrosas.</p>
                                    </div>
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
