
import { NextRequest, NextResponse } from "next/server";
import { obterVeterinarioAutenticado } from "@/lib/auth";
import { consultarOperacaoPorProtocolo } from "@/service/governo_service";

type Contexto = {
    params: Promise<{ protocolo: string }>;
};

export async function GET(
    _request: NextRequest,
    { params }: Contexto
) {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { erro: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }

        const { protocolo } = await params;

        if (!protocolo?.trim()) {
            return NextResponse.json(
                { erro: "O protocolo é obrigatório." },
                { status: 400 }
            );
        }

        const operacao = await consultarOperacaoPorProtocolo(
            protocolo.trim()
        );

        return NextResponse.json(operacao, { status: 200 });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar protocolo governamental.";

        const status = mensagem.toLowerCase().includes("não encontrado")
            ? 404
            : mensagem.toLowerCase().includes("timeout")
                ? 504
                : 502;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
