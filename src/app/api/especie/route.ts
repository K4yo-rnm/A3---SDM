
import { NextResponse } from "next/server";
import { especieService } from "@/service/especie_services";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Listar todas as espécies
export async function GET() {
    try {
        const especies = await especieService.listarTodas();

        return NextResponse.json(especies, { status: 200 });

    } catch (error) {
        console.error("Erro ao listar espécies:", error);

        return NextResponse.json(
            { erro: "Não foi possível listar as espécies." },
            { status: 500 }
        );
    }
}

// POST - Cadastrar uma nova espécie
export async function POST(request: Request) {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { erro: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const dados = await request.json();

        const especie = await especieService.cadastrar(dados);

        return NextResponse.json(
            {
                mensagem: "Espécie cadastrada com sucesso.",
                especie
            },
            { status: 201 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Não foi possível cadastrar a espécie.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 400 }
        );
    }
}
