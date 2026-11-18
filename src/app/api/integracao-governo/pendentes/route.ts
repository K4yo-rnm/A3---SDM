
import { NextResponse } from "next/server";
import { integracaoGovernoService } from "@/service/integracao_governo_service";

// GET - Listar operações de integração pendentes
export async function GET() {
    try {
        const pendentes =
            await integracaoGovernoService.listarPendentes();

        return NextResponse.json(
            pendentes,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao listar integrações pendentes.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 500 }
        );
    }
}
