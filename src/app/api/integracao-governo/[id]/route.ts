
import { NextRequest, NextResponse } from "next/server";
import { integracaoGovernoService } from "@/service/integracao_governo_service";

// GET - Consultar integração pelo ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idIntegracao = Number(id);

        if (!Number.isInteger(idIntegracao) || idIntegracao <= 0) {
            return NextResponse.json(
                { erro: "ID da integração inválido." },
                { status: 400 }
            );
        }

        const integracao =
            await integracaoGovernoService.consultarPorID(idIntegracao);

        return NextResponse.json(
            integracao,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar integração governamental.";

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
