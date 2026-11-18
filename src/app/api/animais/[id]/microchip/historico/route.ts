
import { NextResponse } from "next/server";
import { vinculoMicrochipService } from "@/service/vinculo_microchip_service";

// GET - Consultar histórico de microchips de um animal
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

        const historico =
            await vinculoMicrochipService.consultarHistoricoAnimal(id);

        return NextResponse.json(historico, { status: 200 });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar histórico de microchips.";

        const status = mensagem.includes("não encontrado") ? 404 : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
