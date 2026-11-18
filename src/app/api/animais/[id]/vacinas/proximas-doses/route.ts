
import { NextResponse } from "next/server";
import { vacinaService } from "@/service/vacina_services";

// GET - Consultar próximas doses previstas de um animal
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id || !id.trim()) {
            return NextResponse.json(
                { erro: "ID do animal inválido." },
                { status: 400 }
            );
        }

        const proximasDoses =
            await vacinaService.consultarProximasDoses(id);

        return NextResponse.json(
            proximasDoses,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar próximas doses.";

        const status = mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
