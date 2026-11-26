
import { NextRequest, NextResponse } from "next/server";
import { vinculoMicrochipService } from "@/service/vinculo_microchip_service";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// POST - Vincular microchip a um animal
export async function POST(
    request: NextRequest,
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

        const dados = await request.json();

        const codigoMicrochip = dados.codigo_microchip;

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

        const vinculo = await vinculoMicrochipService.vincularMicrochip({
            id_animal: id,
            codigo_microchip: codigoMicrochip.trim(),
            id_tutor: Number(dados.id_tutor),
            id_veterinario: veterinario.id_veterinario
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
            : mensagem.includes("já foi utilizado") ||
                mensagem.includes("já possui um microchip ativo")
                ? 409
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