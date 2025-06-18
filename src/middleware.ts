import { NextRequest, NextResponse, userAgent } from 'next/server'

export async function middleware(request: NextRequest) {
    const { device } = userAgent(request);
    const type = device.type ?? 'desktop';
    console.log("device");
    console.log(device);

    const response = NextResponse.next()
    response.headers.append('x-device-type', type)

    return response
}