import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function GET() {
    const envVars = {
        has_mongodb_uri: !!process.env.MONGODB_URI,
        mongodb_uri_prefix: process.env.MONGODB_URI ? process.env.MONGODB_URI.split(':')[0] : 'none',
        has_jwt_secret: !!process.env.JWT_SECRET,
        node_env: process.env.NODE_ENV,
    };

    const dbStatus = {
        readyState: mongoose.connection.readyState,
        readyStateName: getReadyStateName(mongoose.connection.readyState),
        dbName: mongoose.connection.name,
        host: mongoose.connection.host,
    };

    return NextResponse.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: envVars,
        database: dbStatus,
    });
}

function getReadyStateName(state: number) {
    switch (state) {
        case 0: return 'disconnected';
        case 1: return 'connected';
        case 2: return 'connecting';
        case 3: return 'disconnecting';
        default: return 'unknown';
    }
}
