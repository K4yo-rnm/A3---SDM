
import { NextResponse } from "next/server";
import { vinculoMicrochipService } from "@/service/vinculo_microchip_service";

// GET - Consultar microchip pelo código
export async function GET(
    request: Request,
    { params }: { params: Promise<{ codigo: string }> }
) {
    try {
        const { codigo } = await params;

        if (!codigo || !codigo.trim()) {
            return NextResponse.json(
                { erro: "Código do microchip inválido." },
                { status: 400 }
            );
        }

        const vinculo =
            await vinculoMicrochipService.consultarPorCodigo(codigo);

        return NextResponse.json(vinculo, { status: 200 });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar microchip.";

        const status = mensagem.includes("não encontrado") ? 404 : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
