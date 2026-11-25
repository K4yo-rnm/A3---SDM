import { NextResponse } from "next/server";

export async function POST() {
    const resposta = NextResponse.json({
        mensagem: "Logout realizado com sucesso.",
    });

    resposta.cookies.set("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
    });

    return resposta;
}