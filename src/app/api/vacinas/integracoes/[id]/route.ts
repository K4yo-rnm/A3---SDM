
import { NextResponse } from "next/server";
import { integracaoGovernoRepository } from "@/repository/integracao_governo_repository";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Consultar situação de uma integração governamental
export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verificar autenticação
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }

        // Obter e validar o ID
        const { id } = await params;
        const idIntegracao = Number(id);

        if (!Number.isInteger(idIntegracao) || idIntegracao <= 0) {
            return NextResponse.json(
                { erro: "ID de integração inválido." },
                { status: 400 }
            );
        }

        // Consultar integração no banco da clínica
        const integracao =
            await integracaoGovernoRepository.buscarPorID(
                idIntegracao
            );

        if (!integracao) {
            return NextResponse.json(
                { erro: "Integração governamental não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                mensagem: "Integração consultada com sucesso.",
                integracao
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Erro ao consultar integração:", error);

        return NextResponse.json(
            { erro: "Erro interno ao consultar integração." },
            { status: 500 }
        );
    }
}
