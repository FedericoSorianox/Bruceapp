"use client";

import React, { useState, useMemo } from "react";
import RequireAuth from "@/lib/auth/RequireAuth";
import Link from "next/link";
import { useCultivos } from "@/lib/hooks/useCultivos";
import type { Cultivo } from "@/types/cultivo";

const RecomendacionesPage = () => {
    const { cultivos, loading } = useCultivos();
    const [selectedCropId, setSelectedCropId] = useState<string>('all');

    const selectedCrop = useMemo(() =>
        cultivos.find(c => c.id === selectedCropId),
        [cultivos, selectedCropId]);

    // Static recommendations for demo purposes (would be nice to filter these too eventually)
    const recommendations = [
        {
            id: 1,
            type: 'urgent',
            title: 'Ajuste de pH Urgente',
            message: 'Las últimas lecturas sugieren un bloqueo de nutrientes. Baja el pH a 5.8 para mejor absorción de Magnesio.',
            cultivo: 'Indoor #1',
            action: 'Ver Tabla'
        },
        {
            id: 2,
            type: 'warning',
            title: 'Temperatura Nocturna',
            message: 'La diferencia térmica día/noche es mayor a 10°C. Esto puede causar estiramiento excesivo en pre-floración.',
            cultivo: 'Exterior 2024',
            action: 'Ajustar'
        }
    ];

    // Helper to determine phase
    const isFlowering = selectedCrop?.fechaInicioFloracion && new Date(selectedCrop.fechaInicioFloracion) <= new Date();

    return (
        <RequireAuth>
            <div className="min-h-screen bg-gray-50 pb-20">
                {/* Header */}
                <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <Link href="/laboratorio" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </Link>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Recomendaciones IA</h1>
                                    <p className="text-sm text-gray-500">
                                        {selectedCrop ? `Analizando: ${selectedCrop.nombre}` : 'Insights generales'}
                                    </p>
                                </div>
                            </div>

                            {/* Context Action Button */}
                            {selectedCrop && (
                                <Link
                                    href={`/cultivo/${selectedCrop.id}`}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg font-semibold hover:bg-indigo-100 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Ver Galería & Dashboard
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Sidebar / Filter */}
                        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
                            <h3 className="font-bold text-gray-900 uppercase text-xs tracking-wider mb-2">Filtrar por Cultivo</h3>
                            <div className="flex flex-col gap-2">
                                <button
                                    onClick={() => setSelectedCropId('all')}
                                    className={`text-left px-4 py-3 rounded-xl font-medium transition-colors border ${selectedCropId === 'all' ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
                                >
                                    Todos los cultivos
                                </button>
                                {!loading && cultivos.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCropId(c.id)}
                                        className={`text-left px-4 py-3 rounded-xl font-medium transition-colors border ${selectedCropId === c.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'}`}
                                    >
                                        {c.nombre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 space-y-8">

                            {/* COMPARISON CARD - Only if a crop is selected */}
                            {selectedCrop && (
                                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white">
                                        <h3 className="font-bold text-lg flex items-center gap-2">
                                            <span className="text-2xl">⚖️</span> Comparativa de Estado
                                        </h3>
                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full uppercase tracking-wider font-semibold">
                                            Fase: {isFlowering ? 'Floración 🌸' : 'Vegetación 🌱'}
                                        </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-gray-50 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">Parámetro</th>
                                                    <th className="px-6 py-3 font-semibold text-blue-700 uppercase tracking-wider">Tu Cultivo</th>
                                                    <th className="px-6 py-3 font-semibold text-green-700 uppercase tracking-wider">Ideal IA</th>
                                                    <th className="px-6 py-3 font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* pH Row */}
                                                <tr className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">pH Agua</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">{selectedCrop.phObjetivo || '---'}</td>
                                                    <td className="px-6 py-4 text-green-600 font-medium">5.8 - 6.2</td>
                                                    <td className="px-6 py-4">
                                                        {!selectedCrop.phObjetivo ? <span className="text-gray-400">Sin datos</span> :
                                                            (selectedCrop.phObjetivo < 5.8 || selectedCrop.phObjetivo > 6.5)
                                                                ? <span className="text-red-500 font-bold text-xs bg-red-50 px-2 py-1 rounded-full">Desviado</span>
                                                                : <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded-full">Óptimo</span>}
                                                    </td>
                                                </tr>
                                                {/* EC Row */}
                                                <tr className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">EC (ppm)</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">{selectedCrop.ecObjetivo || '---'}</td>
                                                    <td className="px-6 py-4 text-green-600 font-medium">{isFlowering ? '1.2 - 2.0' : '0.8 - 1.2'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-400">-</span>
                                                    </td>
                                                </tr>
                                                {/* Temp Row */}
                                                <tr className="hover:bg-gray-50/50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">Temperatura</td>
                                                    <td className="px-6 py-4 font-bold text-gray-800">
                                                        {isFlowering ? selectedCrop.tempObjetivoFloracion : selectedCrop.tempObjetivoVegetacion || '---'} °C
                                                    </td>
                                                    <td className="px-6 py-4 text-green-600 font-medium">24.0 °C</td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-gray-400 text-xs text-center border px-2 py-1 rounded bg-gray-50">Verificar</span>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-xs text-gray-500 flex justify-between items-center">
                                        <span>* Basado en los objetivos configurados en la edición del cultivo.</span>
                                        <Link href={`/cultivo/${selectedCrop.id}`} className="text-blue-600 hover:underline">
                                            Actualizar datos →
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {/* Recommendations Feed */}
                            <h3 className="font-bold text-gray-900 text-lg">
                                {selectedCrop ? 'Alertas Específicas' : 'Alertas Recientes'}
                            </h3>

                            <div className="space-y-4">
                                {recommendations.map(rec => (
                                    <div key={rec.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start gap-5 hover:shadow-md transition-shadow">
                                        <div className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-xl
                      ${rec.type === 'urgent' ? 'bg-red-100 text-red-600' : ''}
                      ${rec.type === 'warning' ? 'bg-yellow-100 text-yellow-600' : ''}
                    `}>
                                            {rec.type === 'urgent' ? '🚨' : '⚠️'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-lg font-bold text-gray-900">{rec.title}</h3>
                                                <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded">
                                                    {rec.cultivo}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-4">{rec.message}</p>
                                            <button className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors">
                                                {rec.action} →
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </RequireAuth>
    );
};

export default RecomendacionesPage;
