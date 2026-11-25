
import { NextRequest, NextResponse } from "next/server";
import { veterinarioService } from "@/service/veterinario_services";
import { gerarTokenConfirmacao, obterVeterinarioAutenticado } from "@/lib/auth";

// POST - Cadastrar um veterinário
export async function POST(request: NextRequest) {
    try {
        const dados = await request.json();

        const veterinario = await veterinarioService.cadastrarVeterinario(dados);

        const tokenConfirmacao = await gerarTokenConfirmacao(
            veterinario.id_veterinario
        );

        const urlBase = process.env.APP_URL;

        if (!urlBase) {
            throw new Error("A variável APP_URL não está configurada.");
        }

        const linkConfirmacao =
            `${urlBase.replace(/\/$/, "")}/api/auth/confirmar?token=${tokenConfirmacao}`;

        // Remove o hash da senha antes de retornar a resposta
        const veterinarioSeguro = Object.fromEntries(
            Object.entries(veterinario).filter(
                ([campo]) => campo !== "hash_senha"
            )
        );

        return NextResponse.json(
            {
                mensagem: "Veterinário cadastrado com sucesso. Confirme sua senha pelo link disponibilizado.",
                veterinario: veterinarioSeguro,
                linkConfirmacao
            },
            { status: 201 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro interno ao cadastrar veterinário.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 400 }
        );
    }
}

// GET - Listar todos os veterinários
export async function GET() {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const veterinarios = await veterinarioService.listarTodos();

        // Remove o hash da senha de todos os registros
        const veterinariosSeguros = veterinarios.map((veterinario) =>
            Object.fromEntries(
                Object.entries(veterinario).filter(
                    ([campo]) => campo !== "hash_senha"
                )
            )
        );

        return NextResponse.json(
            veterinariosSeguros,
            { status: 200 }
        );

    } catch (error) {
        console.error("Erro ao listar veterinários:", error);

        return NextResponse.json(
            { erro: "Erro interno ao consultar veterinários." },
            { status: 500 }
        );
    }
}
