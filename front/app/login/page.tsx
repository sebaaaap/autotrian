"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, User, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(username, password);
        } catch (err: any) {
            setError(err.message || 'Usuario o contraseña incorrectos');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d11] relative overflow-hidden p-6 text-slate-100">
            {/* Background Glows and Accents */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#eb1914]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#eb1914]/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#eb1914_1px,transparent_1px)] [background-size:32px_32px] opacity-10 -z-10" />

            {/* Dino Mascot */}
            <video
                autoPlay
                muted
                loop
                playsInline
                className="fixed bottom-0 right-0 w-[180px] sm:w-[220px] md:w-[280px] h-auto object-contain pointer-events-none z-0 opacity-90"
                style={{ transform: 'translateX(15%) translateY(8%)' }}
            >
                <source src="/dino.webm" type="video/webm" />
            </video>

            <div className="w-full max-w-md relative z-10">
                {/* Logo y Título */}
                <div className="text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="inline-flex items-center justify-center p-4 mb-4">
                        <img
                            src="/logoaouto.png"
                            alt="Logo Autotrian"
                            className="max-h-28 w-auto object-contain drop-shadow-[0_10px_20px_rgba(235,25,20,0.35)]"
                        />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1 uppercase">
                        VKI
                    </h1>
                    <p className="text-xs text-slate-400 font-medium tracking-wide uppercase">
                        Sistema de Punto de Venta e Inventario
                    </p>
                </div>

                {/* Card de Login */}
                <div className="bg-[#16161c]/90 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/80 border border-[#2b2b36] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-white">Iniciar Sesión</h2>
                            <p className="text-sm text-slate-400 mt-1">
                                Ingrese sus credenciales para continuar
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error Alert */}
                            {error && (
                                <div className="flex items-start gap-3 p-4 bg-[#eb1914]/10 border border-[#eb1914]/30 rounded-xl text-red-300 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <AlertCircle size={20} className="shrink-0 mt-0.5 text-[#eb1914]" />
                                    <div className="text-sm font-medium">{error}</div>
                                </div>
                            )}

                            {/* Username */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Usuario
                                </label>
                                <div className="relative">
                                    <User
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#0e0e12] border-2 border-[#2b2b36] focus:border-[#eb1914] focus:ring-4 focus:ring-[#eb1914]/15 outline-none transition-all text-white font-medium placeholder:text-slate-500"
                                        placeholder="Ingrese su usuario"
                                        required
                                        autoFocus
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                                    Contraseña
                                </label>
                                <div className="relative">
                                    <Lock
                                        size={18}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                                    />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-[#0e0e12] border-2 border-[#2b2b36] focus:border-[#eb1914] focus:ring-4 focus:ring-[#eb1914]/15 outline-none transition-all text-white font-medium placeholder:text-slate-500"
                                        placeholder="Ingrese su contraseña"
                                        required
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
                                        title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                                    >
                                        {showPassword ? (
                                            <EyeOff size={18} />
                                        ) : (
                                            <Eye size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-gradient-to-r from-[#eb1914] to-[#b5100c] hover:from-[#ff221c] hover:to-[#c9120e] text-white font-bold rounded-xl shadow-lg shadow-[#eb1914]/30 hover:shadow-xl hover:shadow-[#eb1914]/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        <span>Iniciando sesión...</span>
                                    </>
                                ) : (
                                    <>
                                        <Lock size={20} />
                                        <span>Ingresar al Sistema</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-xs text-slate-500 animate-in fade-in duration-500 delay-200">
                    <p>© 2026 VKI. Sistema de Gestión Empresarial.</p>
                    <p className="mt-1.5 font-semibold text-slate-500">Powered by VankaiLabs</p>
                </div>
            </div>
        </div>
    );
}

