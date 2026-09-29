import { NextRequest, NextResponse } from "next/server";

const TARGET_API_BASE = process.env.NEXT_PUBLIC_REMOTE_API || "https://api.shahidur.dev/api";

async function proxyRequest(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path } = await params;
    const pathStr = (path || []).join("/");
    const search = req.nextUrl.search || "";
    const targetUrl = `${TARGET_API_BASE}/${pathStr}${search}`;

    const headers = new Headers();
    // Forward relevant headers
    const auth = req.headers.get("authorization");
    if (auth) {
      headers.set("authorization", auth);
    }
    const contentType = req.headers.get("content-type");
    if (contentType) {
      headers.set("content-type", contentType);
    }

    let body: BodyInit | null = null;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body = await req.text();
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      cache: "no-store",
    });

    const resContentType = response.headers.get("content-type") || "";
    const data = resContentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy Error";
    console.error("Backend Proxy Error:", message);
    return NextResponse.json(
      { error: `Proxy failed to connect to backend: ${message}` },
      { status: 502 }
    );
  }
}

export async function GET(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

export async function POST(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(req, context);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
