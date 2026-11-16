"use client";

import React, { useState, useEffect } from "react";
import RequireAuth from "@/lib/auth/RequireAuth";
import Link from "next/link";
import {
  METADATA_CORPUS_BUGBEE,
  PRINCIPIOS_CARDINALES_BUGBEE,
  PERFILES_SUSTRATO_KB,
  obtenerApuntesPersonalizadosBugbee,
  guardarApuntesPersonalizadosBugbee,
} from "@/lib/knowledge/agronomicKnowledgeBase";

/**
 * Página Laboratorio - Centro de Inteligencia y Base de Conocimiento Dr. Bruce Bugbee (USU)
 */
const LaboratorioPage = () => {
  const [apuntesCustom, setApuntesCustom] = useState("");
  const [openAiKeyInput, setOpenAiKeyInput] = useState("");
  const [guardadoOk, setGuardadoOk] = useState(false);
  const [guardandoDB, setGuardandoDB] = useState(false);
  const [iaActivaServer, setIaActivaServer] = useState<boolean | null>(null);
  const [mostrarCorpus, setMostrarCorpus] = useState(false);

  useEffect(() => {
    const local = obtenerApuntesPersonalizadosBugbee();
    if (local) setApuntesCustom(local);

    fetch("/api/conocimiento")
      .then((r) => r.json())
      .then((data) => {
        if (data?.apuntesPersonalizadosDB) {
          setApuntesCustom(data.apuntesPersonalizadosDB);
          guardarApuntesPersonalizadosBugbee(data.apuntesPersonalizadosDB);
        }
        if (typeof data?.iaActivaEnServidor === "boolean") {
          setIaActivaServer(data.iaActivaEnServidor);
        }
      })
      .catch(() => {});
  }, []);

  const handleGuardarApuntes = async () => {
    setGuardandoDB(true);
    guardarApuntesPersonalizadosBugbee(apuntesCustom);
    try {
      const res = await fetch("/api/conocimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contenido: apuntesCustom,
          ...(openAiKeyInput.trim() ? { openAiApiKey: openAiKeyInput.trim() } : {}),
        }),
      });
      const data = await res.json();
      if (typeof data?.iaActivaEnServidor === "boolean") {
        setIaActivaServer(data.iaActivaEnServidor);
      }
      if (openAiKeyInput.trim()) {
        setOpenAiKeyInput("");
      }
    } catch {
      // Fallback en localStorage ya guardado
    } finally {
      setGuardandoDB(false);
      setGuardadoOk(true);
      setTimeout(() => setGuardadoOk(false), 3000);
    }
  };

    return (
      <RequireAuth>
        <div className="min-h-screen bg-gray-50 pb-16" data-testid="laboratorio-page">
          {/* Hero Section */}
          <section className="bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-800 py-16 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <div className="inline-flex items-center justify-center px-3.5 py-1.5 bg-white/10 rounded-full mb-6 backdrop-blur-sm border border-white/20">
                  <span className="text-emerald-300 mr-2">🎓</span>
                  <span className="text-xs sm:text-sm font-semibold text-blue-100 uppercase tracking-wider">
                    Utah State University · Dr. Bruce Bugbee Corpus
                  </span>
                </div>
                <h1 className="mb-6 text-4xl font-bold sm:text-6xl tracking-tight">
                  Laboratorio{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                    CanopIA
                  </span>
                </h1>

                <p className="mx-auto mb-8 max-w-3xl text-lg sm:text-xl text-blue-100/90 font-light">
                  Motor agronómico fundamentado 100% en{" "}
                  <strong className="font-semibold text-white">
                    &ldquo;The Science and Technology of Medical Cannabis Cultivation&rdquo;
                  </strong>{" "}
                  del Dr. Bruce Bugbee (Utah State University).
                </p>
              </div>
            </div>
          </section>

          {/* Dashboard Grid */}
          <section className="py-12 -mt-10 relative z-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Tarjeta 1: Academia / Guía */}
                <Link
                  href="/laboratorio/academia"
                  className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 block cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                  <div className="p-8 relative">
                    <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                      Academia de Cultivo
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Guía paso a paso por etapas fenológicas con parámetros fisiológicos de luz, VPD y
                      nutrición continua.
                    </p>

                    <div className="flex items-center text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Comenzar guía</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Tarjeta 2: Simulador IA */}
                <Link
                  href="/laboratorio/simulador"
                  className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 block cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                  <div className="p-8 relative">
                    <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                        />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      Simulador VPD & Doctor IA
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Diagnóstico clínico basado en fisiología vegetal (USU) y cálculo de diferencial
                      térmico foliar bajo LED/HPS.
                    </p>

                    <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Acceder al lab</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>

                {/* Tarjeta 3: Recomendaciones */}
                <Link
                  href="/laboratorio/recomendaciones"
                  className="group relative bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 transform hover:-translate-y-1 block cursor-pointer"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>

                  <div className="p-8 relative">
                    <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600 shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                      Auditoría & Alertas USU
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Auditoría en tiempo real de tus salas activas según los 9 Parámetros Cardinales
                      de Bruce Bugbee (0 tokens).
                    </p>

                    <div className="flex items-center text-purple-600 font-semibold group-hover:translate-x-2 transition-transform">
                      <span>Ver insights</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              </div>

              {/* SECCIÓN CENTRAL: GESTOR DE LA BASE DE CONOCIMIENTO DE BRUCE BUGBEE (USU) */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
                <div className="h-2 w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600" />
                <div className="p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                    <div>
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                            <span>📚 Fuente Primaria RAG (MongoDB + Corpus JSON)</span>
                          </span>
                          {iaActivaServer !== null && (
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${iaActivaServer
                                  ? "bg-teal-50 text-teal-800 border-teal-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                                }`}
                            >
                              <span>{iaActivaServer ? "🟢 OpenAI RAG Activo en Servidor" : "🟡 Webhook n8n + KB Activo"}</span>
                            </span>
                          )}
                        </div>
                        <h2 className="text-2xl font-extrabold text-slate-900">
                          Base de Conocimiento: Dr. Bruce Bugbee (USU) + Athena Ag
                        </h2>
                        <p className="text-sm text-slate-600 mt-1">
                          {METADATA_CORPUS_BUGBEE.fuentePrincipal} · Archivo base:{" "}
                          <code className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-mono">
                            src/lib/knowledge/bruceBugbeeCorpus.json
                          </code>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setMostrarCorpus(!mostrarCorpus)}
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors self-start md:self-auto cursor-pointer"
                      >
                        {mostrarCorpus
                          ? "Ocultar Tablas y Principios USU"
                          : "🔍 Ver Tablas pH/EC y 9 Parámetros Cardinales"}
                      </button>
                    </div>

                    {mostrarCorpus && (
                      <div className="space-y-6 animate-fadeIn">
                        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
                          <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
                            🔬 Principios Científicos de Bruce Bugbee Integrados en el Motor
                          </h3>
                          <ul className="space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {PRINCIPIOS_CARDINALES_BUGBEE.map((principio, idx) => (
                              <li key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200/80">
                                {principio}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.values(PERFILES_SUSTRATO_KB).map((perfil) => (
                            <div
                              key={perfil.id}
                              className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                            >
                              <div className="text-sm font-extrabold text-slate-900">{perfil.nombre}</div>
                              <p className="text-xs text-slate-600">{perfil.descripcion}</p>
                              <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                                pH Propagación/Vege: {perfil.phPorEtapa.vegetacion_temprana} · pH Flora:{" "}
                                {perfil.phPorEtapa.floracion_temprana} | EC Constant Feed:{" "}
                                {perfil.ecPorEtapa.vegetacion_temprana} – {perfil.ecPorEtapa.floracion_temprana} mS/cm
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Editor para que el usuario agregue sus propios apuntes/reglas del curso */}
                    <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200/80 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-extrabold text-emerald-950">
                            ✍️ Tus Apuntes y Reglas Adicionales de Bruce Bugbee
                          </h3>
                          <p className="text-xs text-emerald-800/80">
                            Todo lo que escribas aquí se inyecta automáticamente en el Asistente IA y en
                            el Doctor IA de todas tus salas.
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={guardandoDB}
                          onClick={handleGuardarApuntes}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer self-start sm:self-auto disabled:opacity-50"
                        >
                          {guardandoDB
                            ? "Guardando en MongoDB..."
                            : guardadoOk
                              ? "✓ Guardado en MongoDB (Producción)"
                              : "💾 Guardar en Base de Datos de Conocimiento"}
                        </button>
                      </div>

                      <textarea
                        rows={3}
                        value={apuntesCustom}
                        onChange={(e) => setApuntesCustom(e.target.value)}
                        placeholder="Ej: En mis salas usamos mezcla 50% turba + 50% vermiculita con 1.5 g/L de Wollastonita y fertilizante Athena Pro Line a 2.2 mS/cm..."
                        className="w-full rounded-xl border border-emerald-200 bg-white p-3.5 text-sm text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />

                      <div className="pt-2 border-t border-emerald-200/60 flex flex-col sm:flex-row sm:items-center gap-3">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-emerald-950 mb-1">
                            🔑 API Key de OpenAI para Producción (MongoDB · Opcional si no está en variables del servidor)
                          </label>
                          <input
                            type="password"
                            value={openAiKeyInput}
                            onChange={(e) => setOpenAiKeyInput(e.target.value)}
                            placeholder={
                              iaActivaServer
                                ? "✓ API Key de OpenAI ya configurada y activa en el servidor (pega otra para reemplazarla)"
                                : "Pega aquí tu sk-proj-... y haz clic en Guardar para activar el LLM en producción"
                            }
                            className="w-full rounded-xl border border-emerald-200 bg-white px-3.5 py-2 text-xs text-slate-800 focus:border-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          </section>
        </div>
      </RequireAuth>
    );
  };

  export default LaboratorioPage;
