
import { NextResponse } from "next/server";
import { integracaoGovernoService } from "@/service/integracao_governo_service";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Listar operações de integração pendentes
export async function GET() {
    try {
        const veterinario = await obterVeterinarioAutenticado();
        
                if (!veterinario) {
                    return NextResponse.json(
                        { erro: "Acesso não autorizado. Faça login." },
                        { status: 401 }
                    );
                }
        const pendentes =
            await integracaoGovernoService.listarPendentes();

        return NextResponse.json(
            pendentes,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao listar integrações pendentes.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 500 }
        );
    }
}
