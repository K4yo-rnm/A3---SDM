
import { NextRequest, NextResponse } from "next/server";
import { integracaoGovernoService } from "@/service/integracao_governo_service";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Consultar integrações de uma vacina
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const veterinario = await obterVeterinarioAutenticado();
        
                if (!veterinario) {
                    return NextResponse.json(
                        { erro: "Acesso não autorizado. Faça login." },
                        { status: 401 }
                    );
                }
        const { id } = await params;
        const idVacina = Number(id);

        if (!Number.isInteger(idVacina) || idVacina <= 0) {
            return NextResponse.json(
                { erro: "ID da vacina inválido." },
                { status: 400 }
            );
        }

        const integracoes =
            await integracaoGovernoService.consultarPorVacina(idVacina);

        return NextResponse.json(
            integracoes,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar integrações da vacina.";

        const status = mensagem.includes("não encontrada") ||
            mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
