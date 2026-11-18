
import { NextRequest, NextResponse } from "next/server";
import { vinculoMicrochipService } from "@/service/vinculo_microchip_service";

// POST - Vincular microchip a um animal
export async function POST(
    request: NextRequest,
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

        const dados = await request.json();

        const codigoMicrochip = dados.codigo_microchip;
        const idVeterinario = Number(dados.id_veterinario);

        if (
            !codigoMicrochip ||
            typeof codigoMicrochip !== "string" ||
            !codigoMicrochip.trim()
        ) {
            return NextResponse.json(
                { erro: "O código do microchip é obrigatório." },
                { status: 400 }
            );
        }

        if (
            !Number.isInteger(idVeterinario) ||
            idVeterinario <= 0
        ) {
            return NextResponse.json(
                { erro: "ID do veterinário inválido." },
                { status: 400 }
            );
        }

        const vinculo = await vinculoMicrochipService.vincularMicrochip({
            id_animal: id,
            codigo_microchip: codigoMicrochip.trim(),
            id_veterinario: idVeterinario
        });

        return NextResponse.json(
            {
                mensagem: "Microchip vinculado com sucesso.",
                vinculo
            },
            { status: 201 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro interno ao vincular microchip.";

        const status = mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}

// GET - Consultar microchip ativo de um animal
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

        const vinculo =
            await vinculoMicrochipService.consultarAtivoPorAnimal(id);

        return NextResponse.json(vinculo, { status: 200 });

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar microchip do animal.";

        const status = mensagem.includes("não encontrado") ? 404 : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}