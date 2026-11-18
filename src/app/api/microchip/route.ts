
import { NextResponse } from "next/server";
import { vinculoMicrochipService } from "@/service/vinculo_microchip_service";

// GET - Listar todos os vínculos de microchip
export async function GET() {
    try {
        const vinculos = await vinculoMicrochipService.listarTodos();

        return NextResponse.json(vinculos, { status: 200 });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao listar vínculos de microchip.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 500 }
        );
    }
}
