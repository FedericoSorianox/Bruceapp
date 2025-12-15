import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    intensity?: "low" | "medium" | "high";
}

/**
 * GlassCard - Un componente contenedor con efecto glassmorphism
 * Proporciona un fondo translúcido con desenfoque para una estética moderna y premium.
 */
export const GlassCard: React.FC<GlassCardProps> = ({
    children,
    className = "",
    intensity = "medium",
    ...props
}) => {
    const intensityMap = {
        low: "bg-white/40 backdrop-blur-sm border-white/20",
        medium: "bg-white/60 backdrop-blur-md border-white/30",
        high: "bg-white/80 backdrop-blur-lg border-white/40",
    };

    return (
        <div
            className={`rounded-2xl border shadow-lg ${intensityMap[intensity]} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};
