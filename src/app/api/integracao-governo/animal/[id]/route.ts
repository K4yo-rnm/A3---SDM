
import { NextRequest, NextResponse } from "next/server";
import { integracaoGovernoService } from "@/service/integracao_governo_service";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Consultar integrações de um animal
export async function GET(
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

        if (!id || !id.trim()) {
            return NextResponse.json(
                { erro: "ID do animal inválido." },
                { status: 400 }
            );
        }

        const integracoes =
            await integracaoGovernoService.consultarPorAnimal(id);

        return NextResponse.json(
            integracoes,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar integrações do animal.";

        const status = mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
