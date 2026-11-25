
import { NextRequest, NextResponse } from "next/server";
import { obterVeterinarioAutenticado } from "@/lib/auth";
import { vacinaService } from "@/service/vacina_services";

export async function POST(
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
        const idIntegracao = Number(id);

        if (!Number.isInteger(idIntegracao) || idIntegracao <= 0) {
            return NextResponse.json(
                { erro: "ID da integração inválido." },
                { status: 400 }
            );
        }

        const resultado = await vacinaService.reenviarIntegracao(idIntegracao);

        if (!resultado) {
            return NextResponse.json(
                { erro: "Integração não encontrada." },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                mensagem: resultado.situacao_operacao === "CONFIRMADA"
                    ? "Integração reenviada e confirmada com sucesso."
                    : "Nova tentativa realizada. A integração continua pendente.",
                integracao: resultado
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao reenviar integração.";

        const status = mensagem.includes("não encontrada")
            ? 404
            : mensagem.includes("já foi confirmada") ||
              mensagem.includes("Somente integrações pendentes")
                ? 409
                : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
