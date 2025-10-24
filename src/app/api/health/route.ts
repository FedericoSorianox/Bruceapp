import { NextResponse } from 'next/server';

/**
 * Health Check Endpoint
 * Usado por CI/CD para verificar que el servidor está listo
 */
export async function GET() {
    try {
        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch {
        return NextResponse.json(
            { status: 'error', error: 'Server not ready' },
            { status: 500 }
        );
    }
}
