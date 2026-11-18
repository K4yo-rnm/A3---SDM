
import { NextResponse } from "next/server";
import { vacinaService } from "@/service/vacina_services";

// GET - Consultar histórico de vacinação de um animal
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

        const vacinas = await vacinaService.consultarHistoricoAnimal(id);

        return NextResponse.json(
            vacinas,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar histórico de vacinação.";

        return NextResponse.json(
            { erro: mensagem },
            { status: mensagem.includes("não encontrado") ? 404 : 400 }
        );
    }
}
