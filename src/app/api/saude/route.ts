
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({
        status: "Online",
        situacao: "API privada da clinica funcionando",
        timestamp: new Date().toISOString(),
    });
    
}