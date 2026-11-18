import { NextRequest, NextResponse } from "next/server";
import { especieService } from "@/service/especie_services";

type RouteContext = {
        params: Promise<{
        id: string;
    }>;
};

// GET - Consultar espécie por ID
export async function GET(
    request: NextRequest,
    { params }: RouteContext 
) {
    try {
        const { id } = await params;

        const especie = await especieService.consultarPorID(Number(id));

        return NextResponse.json(especie, { status: 200 });
    } catch (error) {
        const mensagem =
            error instanceof Error ? error.message : "Erro ao consultar espécie.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 400 }
        );
    }
}

// PUT - Atualizar espécie
export async function PUT(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { id } = await params;
        const dados = await request.json();

        const especie = await especieService.atualizar(
            Number(id),
            dados
        );

        return NextResponse.json(especie, { status: 200 });
    } catch (error) {
        const mensagem =
            error instanceof Error ? error.message : "Erro ao atualizar espécie.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 400 }
        );
    }
}

// DELETE - Inativar espécie (exclusão lógica)
export async function DELETE(
    request: NextRequest,
    { params }: RouteContext
) {
    try {
        const { id } = await params;

        const especie = await especieService.inativar(Number(id));

        return NextResponse.json(
            {
                mensagem: "Espécie inativada com sucesso.",
                especie
            },
            { status: 200 }
        );
    } catch (error) {
        const mensagem =
            error instanceof Error ? error.message : "Erro ao inativar espécie.";

        return NextResponse.json(
            { erro: mensagem },
            { status: 400 }
        );
    }
}