
import { NextResponse } from "next/server";
import { vinculoMicrochipService } from "@/service/vinculo_microchip_service";
import { obterVeterinarioAutenticado } from "@/lib/auth";

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { erro: "Não autorizado." },
                { status: 401 }
            );
        }

        const { id } = await params;

        if (!id?.trim()) {
            return NextResponse.json(
                { erro: "ID do animal inválido." },
                { status: 400 }
            );
        }

        // Localiza o microchip atualmente ativo do animal.
        const vinculo = await vinculoMicrochipService.consultarAtivoPorAnimal(id);

        if (!vinculo) {
            return NextResponse.json(
                { erro: "O animal não possui microchip ativo para substituir." },
                { status: 404 }
            );
        }

        const corpo = await request.json();

        const novoMicrochip = await vinculoMicrochipService.substituirMicrochip(
            vinculo.id_vinculo_microchip,
            {
                codigo_microchip: corpo.codigo_microchip,
                id_veterinario: veterinario.id_veterinario,
                motivo_substituicao: corpo.motivo_substituicao,
                observacoes: corpo.observacoes
            }
        );

        return NextResponse.json(novoMicrochip, { status: 201 });

    } catch (erro) {
        const mensagem = erro instanceof Error
            ? erro.message
            : "Erro ao substituir microchip.";

        const status = mensagem.includes("não encontrado")
            ? 404
            : mensagem.includes("já foi utilizado") ||
              mensagem.includes("Somente um microchip ativo")
                ? 409
                : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
