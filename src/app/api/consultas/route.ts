
import { NextRequest, NextResponse } from "next/server";
import { consultaService } from "@/service/consulta_services";

// POST - Registrar uma consulta
export async function POST(request: NextRequest) {
    try {
        const dados = await request.json();

        if (!dados.data_hora) {
            return NextResponse.json(
                { erro: "A data e hora da consulta são obrigatórias." },
                { status: 400 }
            );
        }

        const dataHora = new Date(dados.data_hora);

        if (Number.isNaN(dataHora.getTime())) {
            return NextResponse.json(
                { erro: "Data e hora da consulta inválidas." },
                { status: 400 }
            );
        }

        const consulta = await consultaService.cadastrarConsulta({
            ...dados,
            id_animal: dados.id_animal,
            id_veterinario: Number(dados.id_veterinario),
            data_hora: dataHora
        });

        return NextResponse.json(
            {
                mensagem: "Consulta registrada com sucesso.",
                consulta
            },
            { status: 201 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro interno ao registrar consulta.";

        return NextResponse.json(
            { erro: mensagem },
            { status: mensagem.includes("não encontrado") ? 404 : 400 }
        );
    }
}

// GET - Listar todas as consultas
export async function GET() {
    try {
        const consultas = await consultaService.listarTodas();

        return NextResponse.json(
            consultas,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro interno ao listar consultas.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 500 }
        );
    }
}
