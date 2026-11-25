import { NextResponse } from "next/server";
import { validarTokenConfirmacao } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const token = url.searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { erro: "Token de confirmação não informado." },
                { status: 400 }
            );
        }

        const confirmacao = await validarTokenConfirmacao(token);

        if (!confirmacao) {
            return NextResponse.json(
                { erro: "Token inválido ou expirado." },
                { status: 400 }
            );
        }

        const veterinario = await prisma.veterinario.findUnique({
            where: {
                id_veterinario: confirmacao.id_veterinario,
            },
        });

        if (!veterinario) {
            return NextResponse.json(
                { erro: "Veterinário não encontrado." },
                { status: 404 }
            );
        }

        if (veterinario.senha_confirmada) {
            return NextResponse.json({
                mensagem: "A senha já foi confirmada.",
            });
        }

        await prisma.veterinario.update({
            where: {
                id_veterinario: confirmacao.id_veterinario,
            },
            data: {
                senha_confirmada: true,
                data_confirmacao: new Date(),
            },
        });

        return NextResponse.json({
            mensagem: "Senha confirmada com sucesso.",
        });
    } catch (erro) {
        console.error("Erro ao confirmar senha:", erro);

        return NextResponse.json(
            { erro: "Erro interno ao confirmar senha." },
            { status: 500 }
        );
    }
}