
import { NextResponse } from "next/server";
import { vacinaService } from "@/service/vacina_services";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// POST - Reenviar integração governamental pendente
export async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Verificar autenticação do veterinário
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }

        // Obter e validar o ID da integração
        const { id } = await params;
        const idIntegracao = Number(id);

        if (!Number.isInteger(idIntegracao) || idIntegracao <= 0) {
            return NextResponse.json(
                { erro: "ID de integração inválido." },
                { status: 400 }
            );
        }

        // Solicitar o reenvio
        const integracao = await vacinaService.reenviarIntegracao(
            idIntegracao
        );

        return NextResponse.json(
            {
                mensagem: "Processamento da integração concluído.",
                integracao
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro interno ao reenviar integração.";

        const status = mensagem.includes("não encontrada")
            ? 404
            : mensagem.includes("já foi confirmada") ||
              mensagem.includes("Somente integrações pendentes")
                ? 409
                : 500;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
