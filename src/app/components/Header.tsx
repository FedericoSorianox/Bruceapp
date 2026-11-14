'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthProvider';

export default function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname === '/login') return null;

  const isHomePage = pathname === '/';

  const navLinks = [
    { name: 'Mis Cultivos', href: '/cultivo', icon: '🌿', match: (p: string) => p.startsWith('/cultivo') },
    { name: 'Bitácora', href: '/notas', icon: '📓', match: (p: string) => p.startsWith('/notas') },
    { name: 'Simulador & Doctor IA', href: '/laboratorio/simulador', icon: '🌡️', match: (p: string) => p === '/laboratorio/simulador' },
    { name: 'Alertas IA', href: '/laboratorio/recomendaciones', icon: '⚡', match: (p: string) => p === '/laboratorio/recomendaciones' },
    { name: 'Academia', href: '/laboratorio/academia', icon: '🎓', match: (p: string) => p === '/laboratorio/academia' },
    { name: 'Laboratorio', href: '/laboratorio', icon: '🔬', match: (p: string) => p === '/laboratorio' },
  ];

  const solidHeader = scrolled || !isHomePage;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solidHeader
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-2.5'
          : 'bg-slate-900/40 backdrop-blur-sm py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href={user ? '/cultivo' : '/'} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              🌱
            </div>
            <div className="flex flex-col">
              <span
                className={`text-lg font-extrabold tracking-tight leading-none transition-colors ${
                  solidHeader ? 'text-slate-900' : 'text-white'
                }`}
              >
                Canop<span className="text-emerald-500">IA</span>
              </span>
              <span
                className={`text-[10px] font-medium tracking-wider uppercase ${
                  solidHeader ? 'text-slate-400' : 'text-emerald-200/80'
                }`}
              >
                Smart Grow OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = link.match(pathname);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    active
                      ? solidHeader
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs'
                        : 'bg-white/20 text-white backdrop-blur-md'
                      : solidHeader
                        ? 'text-slate-600 hover:text-emerald-600 hover:bg-slate-50'
                        : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-base">{link.icon}</span>
                  <span>{link.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/cultivo"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    solidHeader
                      ? 'bg-slate-50 border-slate-200 text-slate-700 hover:border-emerald-300'
                      : 'bg-white/10 border-white/20 text-white'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate max-w-[140px]">{user.email}</span>
                </Link>
                <button
                  onClick={logout}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                    solidHeader
                      ? 'border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                      : 'border-white/20 text-white hover:bg-white/15'
                  }`}
                >
                  Salir
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 rounded-xl text-sm font-bold bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-500 transition-all"
              >
                Acceder al Panel
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-xl ${
                solidHeader ? 'text-slate-800 hover:bg-slate-100' : 'text-white hover:bg-white/10'
              }`}
              aria-label="Abrir menú"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-5 space-y-2 shadow-xl">
          {navLinks.map((link) => {
            const active = link.match(pathname);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold ${
                  active
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </Link>
            );
          })}
          <div className="pt-3 mt-2 border-t border-slate-100">
            {user ? (
              <div className="flex items-center justify-between px-2">
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 bg-red-50"
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center py-2.5 rounded-xl font-bold bg-emerald-600 text-white text-sm"
              >
                Acceder al Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
