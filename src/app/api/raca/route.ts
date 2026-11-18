
import { NextResponse } from "next/server";
import { racaService } from "@/service/raca_services";

// GET - Listar todas as raças
export async function GET() {
    try {
        const racas = await racaService.listarTodas();

        return NextResponse.json(racas, { status: 200 });

    } catch (error) {
        console.error("Erro ao listar raças:", error);

        return NextResponse.json(
            { erro: "Não foi possível listar as raças." },
            { status: 500 }
        );
    }
}

// POST - Cadastrar uma nova raça
export async function POST(request: Request) {
    try {
        const dados = await request.json();

        const raca = await racaService.cadastrar(dados);

        return NextResponse.json(
            {
                mensagem: "Raça cadastrada com sucesso.",
                raca
            },
            { status: 201 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Não foi possível cadastrar a raça.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 400 }
        );
    }
}

