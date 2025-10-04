import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromCookies } from '@/lib/auth/storage';

/**
 * 🔍 ENDPOINT DE DEBUG PARA COOKIES
 * Permite ver exactamente qué cookies está recibiendo el servidor
 */

export async function GET(request: NextRequest) {
  try {
    // Obtener todas las cookies del request
    const cookies = request.headers.get('cookie');
    
    // Intentar extraer el token usando nuestra función
    const token = getTokenFromCookies(request);
    
    return NextResponse.json({
      success: true,
      debug: {
        cookiesPresent: !!cookies,
        cookiesRaw: cookies,
        tokenExtracted: !!token,
        tokenLength: token ? token.length : 0,
        tokenPreview: token ? token.substring(0, 50) + '...' : null
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      debug: {
        cookiesPresent: false,
        error: String(error)
      }
    });
  }
}
