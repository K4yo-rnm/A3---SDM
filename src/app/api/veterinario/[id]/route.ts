
import { NextRequest, NextResponse } from "next/server";
import { veterinarioService } from "@/service/veterinario_services";

// Remove o hash da senha antes de retornar os dados
function removerHash(veterinario: object) {
    return Object.fromEntries(
        Object.entries(veterinario).filter(
            ([campo]) => campo !== "hash_sevha"
        )
    );
}

// GET - Consultar veterinário por ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumerico = Number(id);

        if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
            return NextResponse.json(
                { erro: "ID do veterinário inválido." },
                { status: 400 }
            );
        }

        const veterinario = await veterinarioService.consultarPorID(idNumerico);

        return NextResponse.json(
            removerHash(veterinario),
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar veterinário.";

        return NextResponse.json(
            { erro: mensagem },
            { status: mensagem.includes("não encontrado") ? 404 : 400 }
        );
    }
}

// PUT - Atualizar veterinário
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumerico = Number(id);

        if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
            return NextResponse.json(
                { erro: "ID do veterinário inválido." },
                { status: 400 }
            );
        }

        const dados = await request.json();

        // Impede alteração direta do hash pela rota de atualização
        delete dados.hash_sevha;
        delete dados.senha_confirmada;
        delete dados.data_confirmacao;

        const veterinario = await veterinarioService.atualizarVeterinario(
            idNumerico,
            dados
        );

        return NextResponse.json(
            {
                mensagem: "Veterinário atualizado com sucesso.",
                veterinario: removerHash(veterinario)
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao atualizar veterinário.";

        return NextResponse.json(
            { erro: mensagem },
            { status: mensagem.includes("não encontrado") ? 404 : 400 }
        );
    }
}

// DELETE - Inativar veterinário
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const idNumerico = Number(id);

        if (!Number.isInteger(idNumerico) || idNumerico <= 0) {
            return NextResponse.json(
                { erro: "ID do veterinário inválido." },
                { status: 400 }
            );
        }

        await veterinarioService.inativarVeterinario(idNumerico);

        return NextResponse.json(
            { mensagem: "Veterinário inativado com sucesso." },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao inativar veterinário.";

        return NextResponse.json(
            { erro: mensagem },
            { status: mensagem.includes("não encontrado") ? 404 : 400 }
        );
    }
}
