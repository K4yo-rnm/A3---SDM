
import { NextRequest, NextResponse } from "next/server";
import { vacinaService } from "@/service/vacina_services";

// POST - Processar automaticamente integrações pendentes
export async function POST(request: NextRequest) {
    try {
        const segredoConfigurado = process.env.CRON_SECRET;

        if (!segredoConfigurado) {
            return NextResponse.json(
                { erro: "Segredo do processamento não configurado." },
                { status: 500 }
            );
        }

        const autorizacao = request.headers.get("authorization");

        if (autorizacao !== `Bearer ${segredoConfigurado}`) {
            return NextResponse.json(
                { erro: "Acesso não autorizado." },
                { status: 401 }
            );
        }

        const resultado =
            await vacinaService.processarIntegracoesPendentes();

        return NextResponse.json(
            {
                mensagem: "Processamento das integrações concluído.",
                ...resultado
            },
            { status: 200 }
        );

    } catch (error) {
        console.error(
            "Erro no processamento automático das integrações:",
            error
        );

        return NextResponse.json(
            { erro: "Falha ao processar integrações pendentes." },
            { status: 500 }
        );
    }
}
