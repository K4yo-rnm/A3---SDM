
import { NextRequest, NextResponse } from "next/server";
import { vinculoMicrochipService } from "@/service/vinculo_microchip_service";

// GET - Consultar vínculo pelo ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idVinculo = Number(id);

        if (!Number.isInteger(idVinculo) || idVinculo <= 0) {
            return NextResponse.json(
                { erro: "ID do vínculo inválido." },
                { status: 400 }
            );
        }

        const vinculo = await vinculoMicrochipService.consultarPorID(idVinculo);

        return NextResponse.json(vinculo, { status: 200 });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar vínculo.";

        const status = mensagem.includes("não encontrado") ? 404 : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}

// PUT - Substituir microchip
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idVinculo = Number(id);

        if (!Number.isInteger(idVinculo) || idVinculo <= 0) {
            return NextResponse.json(
                { erro: "ID do vínculo inválido." },
                { status: 400 }
            );
        }

        const dados = await request.json();

        if (
            typeof dados.codigo_microchip !== "string" ||
            !dados.codigo_microchip.trim()
        ) {
            return NextResponse.json(
                { erro: "O código do novo microchip é obrigatório." },
                { status: 400 }
            );
        }

        const idVeterinario = Number(dados.id_veterinario);

        if (!Number.isInteger(idVeterinario) || idVeterinario <= 0) {
            return NextResponse.json(
                { erro: "ID do veterinário inválido." },
                { status: 400 }
            );
        }

        if (
            typeof dados.motivo_substituicao !== "string" ||
            !dados.motivo_substituicao.trim()
        ) {
            return NextResponse.json(
                { erro: "O motivo da substituição é obrigatório." },
                { status: 400 }
            );
        }

        const vinculo = await vinculoMicrochipService.substituirMicrochip(
            idVinculo,
            {
                codigo_microchip: dados.codigo_microchip.trim(),
                id_veterinario: idVeterinario,
                motivo_substituicao: dados.motivo_substituicao.trim(),
                observacoes: dados.observacoes ?? null
            }
        );

        return NextResponse.json(
            {
                mensagem: "Microchip substituído com sucesso.",
                vinculo
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao substituir microchip.";

        const status = mensagem.includes("não encontrado") ? 404 : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}

// DELETE - Desvincular microchip
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idVinculo = Number(id);

        if (!Number.isInteger(idVinculo) || idVinculo <= 0) {
            return NextResponse.json(
                { erro: "ID do vínculo inválido." },
                { status: 400 }
            );
        }

        const dados = await request.json().catch(() => ({}));

        const resultado = await vinculoMicrochipService.desvincularMicrochip(
            idVinculo,
            dados.motivo
        );

        return NextResponse.json(
            {
                mensagem: "Microchip desvinculado com sucesso.",
                resultado
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao desvincular microchip.";

        const status = mensagem.includes("não encontrado") ? 404 : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
