import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return proxyRequest(request, params.path, 'DELETE');
}

async function proxyRequest(
  request: NextRequest,
  pathArray: string[],
  method: string
) {
  const path = pathArray.join('/');
  const url = `${API_BASE_URL}/${path}${request.nextUrl.search}`;

  console.log(`[Proxy] ${method} ${url}`);

  try {
    const headers: Record<string, string> = {};

    // Copy relevant headers
    request.headers.forEach((value, key) => {
      if (
        key.toLowerCase() === 'authorization' ||
        key.toLowerCase() === 'content-type'
      ) {
        headers[key] = value;
      }
    });

    const body = method !== 'GET' && method !== 'DELETE'
      ? await request.text()
      : undefined;

    const response = await fetch(url, {
      method,
      headers,
      body,
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      },
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      { detail: 'Proxy error: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    );
  }
}
