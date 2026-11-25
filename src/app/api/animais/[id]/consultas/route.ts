
import { NextResponse } from "next/server";
import { consultaService } from "@/service/consulta_services";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Consultar histórico de consultas de um animal
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
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

        const consultas = await consultaService.consultarHistoricoAnimal(id);

        return NextResponse.json(
            consultas,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar histórico de consultas.";

        return NextResponse.json(
            { erro: mensagem },
            { status: mensagem.includes("não encontrado") ? 404 : 400 }
        );
    }
}
