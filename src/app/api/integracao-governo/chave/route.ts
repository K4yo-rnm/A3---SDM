
import { NextRequest, NextResponse } from "next/server";
import { integracaoGovernoService } from "@/service/integracao_governo_service";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Consultar integração pela chave de idempotência
export async function GET(request: NextRequest) {
    try {
        const veterinario = await obterVeterinarioAutenticado();
        
                if (!veterinario) {
                    return NextResponse.json(
                        { erro: "Acesso não autorizado. Faça login." },
                        { status: 401 }
                    );
                }
        const chave = request.nextUrl.searchParams.get("chave");

        if (!chave || !chave.trim()) {
            return NextResponse.json(
                { erro: "A chave de idempotência é obrigatória." },
                { status: 400 }
            );
        }

        const integracao =
            await integracaoGovernoService.consultarPorChave(chave);

        return NextResponse.json(integracao, { status: 200 });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar integração.";

        const status = mensagem.includes("não encontrada")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
