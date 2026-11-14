'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import RequireAuth from '@/lib/auth/RequireAuth';
import { useCultivos } from '@/lib/hooks/useCultivos';
import { useAuth } from '@/lib/auth/AuthProvider';
import { obtenerComentarios, crearComentario, actualizarComentario, eliminarComentario } from '@/lib/services/comentarios';
import type { ComentarioCultivo, TipoComentario, PrioridadComentario } from '@/types/chat';

export default function NotasPage() {
  return (
    <RequireAuth>
      <BitacoraGlobalContent />
    </RequireAuth>
  );
}

function BitacoraGlobalContent() {
  const { user } = useAuth();
  const { cultivos } = useCultivos();
  const [comentarios, setComentarios] = useState<ComentarioCultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [cultivoFiltro, setCultivoFiltro] = useState<string>('todos');
  const [mostrarForm, setMostrarForm] = useState(false);

  // Estado nuevo comentario
  const [cultivoIdForm, setCultivoIdForm] = useState('');
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [tipo, setTipo] = useState<TipoComentario>('observacion');
  const [prioridad, setPrioridad] = useState<PrioridadComentario>('media');
  const [guardando, setGuardando] = useState(false);

  const cargarBitacora = useCallback(async () => {
    try {
      setLoading(true);
      const data = await obtenerComentarios({ _sort: 'fecha', _order: 'desc', _limit: 100 });
      setComentarios(data);
    } catch (e) {
      console.error('Error cargando bitácora:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarBitacora();
  }, [cargarBitacora]);

  const cultivoMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (const c of cultivos) m[c.id] = c.nombre;
    return m;
  }, [cultivos]);

  const filtrados = useMemo(() => {
    return comentarios.filter((c) => {
      if (cultivoFiltro !== 'todos' && c.cultivoId !== cultivoFiltro) return false;
      if (!busqueda.trim()) return true;
      const q = busqueda.toLowerCase();
      return (
        c.titulo.toLowerCase().includes(q) ||
        c.contenido.toLowerCase().includes(q) ||
        (c.tags && c.tags.some((t) => t.toLowerCase().includes(q)))
      );
    });
  }, [comentarios, cultivoFiltro, busqueda]);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCultivoId = cultivoIdForm || cultivos[0]?.id;
    if (!targetCultivoId || !titulo.trim() || !contenido.trim()) return;

    setGuardando(true);
    try {
      const nuevo = await crearComentario({
        cultivoId: targetCultivoId,
        titulo: titulo.trim(),
        contenido: contenido.trim(),
        autor: user?.email || 'Cultivador',
        tipo,
        prioridad,
        activo: true,
        tags: [],
        imagenes: [],
      });
      setComentarios((prev) => [nuevo, ...prev]);
      setTitulo('');
      setContenido('');
      setMostrarForm(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleResuelto = async (comentario: ComentarioCultivo) => {
    const actualizado = await actualizarComentario(comentario.id, {
      resuelto: !comentario.resuelto,
    });
    setComentarios((prev) => prev.map((c) => (c.id === comentario.id ? actualizado : c)));
  };

  const handleEliminar = async (id: string) => {
    if (!confirm('¿Eliminar esta nota de la bitácora?')) return;
    await eliminarComentario(id);
    setComentarios((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <main className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Bitácora Global de Cultivo</h1>
            <p className="text-slate-600 text-sm">
              Todas tus observaciones, mediciones y seguimiento de incidencias en un solo lugar.
            </p>
          </div>
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-sm transition-all self-start sm:self-auto"
          >
            {mostrarForm ? 'Cancelar' : '+ Nueva Nota en Bitácora'}
          </button>
        </div>

        {mostrarForm && (
          <form
            onSubmit={handleCrear}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 animate-fadeIn"
          >
            <h3 className="text-lg font-bold text-slate-900">Registrar Nueva Observación</h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Cultivo *</label>
                <select
                  value={cultivoIdForm || cultivos[0]?.id || ''}
                  onChange={(e) => setCultivoIdForm(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                >
                  {cultivos.map((c) => (
                    <option key={c.id} value={c.id}>
                      🌿 {c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Categoría</label>
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value as TipoComentario)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm capitalize"
                >
                  {['observacion', 'fertilizacion', 'riego', 'plagas', 'enfermedad', 'problema', 'solucion', 'cosecha', 'mantenimiento'].map(
                    (t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Prioridad</label>
                <select
                  value={prioridad}
                  onChange={(e) => setPrioridad(e.target.value as PrioridadComentario)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm capitalize"
                >
                  {['baja', 'media', 'alta', 'critica'].map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Título *</label>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                placeholder="Ej: Medición de drenaje Semana 3 Flora"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Detalle *</label>
              <textarea
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                required
                rows={3}
                placeholder="Describe qué observaste o qué ajuste aplicaste..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setMostrarForm(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardando}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
              >
                {guardando ? 'Guardando...' : 'Guardar en Bitácora'}
              </button>
            </div>
          </form>
        )}

        {/* Filtros */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar en la bitácora..."
            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm"
          />
          <select
            value={cultivoFiltro}
            onChange={(e) => setCultivoFiltro(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-700"
          >
            <option value="todos">Todas las salas ({comentarios.length})</option>
            {cultivos.map((c) => (
              <option key={c.id} value={c.id}>
                🌿 {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
            Cargando bitácora...
          </div>
        ) : filtrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="text-4xl mb-2">📓</div>
            <h3 className="text-lg font-bold text-slate-800">Sin entradas en la bitácora</h3>
            <p className="text-sm text-slate-500 mt-1">
              Registra observaciones de tus cultivos para llevar trazabilidad completa.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtrados.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      🌿 {cultivoMap[item.cultivoId] || 'Cultivo'}
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 capitalize">
                      {item.tipo}
                    </span>
                    {item.resuelto && (
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700">
                        ✓ Resuelto
                      </span>
                    )}
                    <span className="text-xs text-slate-400">
                      {new Date(item.fecha).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{item.titulo}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.contenido}</p>
                </div>

                <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0">
                  <Link
                    href={`/cultivo/${item.cultivoId}`}
                    className="text-xs font-bold text-emerald-600 hover:underline"
                  >
                    Ver Sala →
                  </Link>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleResuelto(item)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      {item.resuelto ? 'Reabrir' : '✓ Resolver'}
                    </button>
                    <button
                      onClick={() => handleEliminar(item.id)}
                      className="px-2.5 py-1 rounded-lg border border-red-200 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
