import { NextResponse } from "next/server";
import { obterVeterinarioAutenticado } from "@/lib/auth";

export async function GET() {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Usuário não autenticado." },
                { status: 401 }
            );
        }

        return NextResponse.json({
            autenticado: true,
            veterinario,
        });
    } catch (erro) {
        console.error("Erro ao verificar autenticação:", erro);

        return NextResponse.json(
            { mensagem: "Erro interno ao verificar autenticação." },
            { status: 500 }
        );
    }
}