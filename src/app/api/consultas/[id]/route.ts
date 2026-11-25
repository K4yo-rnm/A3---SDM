
import { NextRequest, NextResponse } from "next/server";
import { consultaService } from "@/service/consulta_services";
import { obterVeterinarioAutenticado } from "@/lib/auth";

// GET - Consultar consulta por ID
export async function GET(
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
        const idConsulta = Number(id);

        if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
            return NextResponse.json(
                { erro: "ID da consulta inválido." },
                { status: 400 }
            );
        }

        const consulta = await consultaService.consultarPorID(idConsulta);

        return NextResponse.json(
            consulta,
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao consultar atendimento.";

        const status = mensagem.includes("não encontrada") ||
            mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}

// PUT - Atualizar consulta
export async function PUT(
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
        const idConsulta = Number(id);

        if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
            return NextResponse.json(
                { erro: "ID da consulta inválido." },
                { status: 400 }
            );
        }

        const dados = await request.json();

        if (dados.data_hora !== undefined) {
            const dataHora = new Date(dados.data_hora);

            if (Number.isNaN(dataHora.getTime())) {
                return NextResponse.json(
                    { erro: "Data e hora da consulta inválidas." },
                    { status: 400 }
                );
            }

            dados.data_hora = dataHora;
        }

        if (dados.id_veterinario !== undefined) {
            dados.id_veterinario = Number(dados.id_veterinario);
        }

        const consulta = await consultaService.atualizarConsulta(
            idConsulta,
            dados
        );

        return NextResponse.json(
            {
                mensagem: "Consulta atualizada com sucesso.",
                consulta
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao atualizar consulta.";

        const status = mensagem.includes("não encontrada") ||
            mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}

// DELETE - Cancelar consulta
export async function DELETE(
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
        const idConsulta = Number(id);

        if (!Number.isInteger(idConsulta) || idConsulta <= 0) {
            return NextResponse.json(
                { erro: "ID da consulta inválido." },
                { status: 400 }
            );
        }

        const resultado = await consultaService.cancelarConsulta(idConsulta);

        return NextResponse.json(
            {
                mensagem: "Consulta cancelada com sucesso.",
                resultado
            },
            { status: 200 }
        );

    } catch (error) {
        const mensagem = error instanceof Error
            ? error.message
            : "Erro ao cancelar consulta.";

        const status = mensagem.includes("não encontrada") ||
            mensagem.includes("não encontrado")
            ? 404
            : 400;

        return NextResponse.json(
            { erro: mensagem },
            { status }
        );
    }
}
