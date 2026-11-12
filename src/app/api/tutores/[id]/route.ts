import { NextRequest, NextResponse } from "next/server";
import { tutorService } from "@/service/tutor_services";

type ContextRota = {
    params: Promise<{ id: string }>;
};

//GET consultar por id
export async function GET(
    request: NextRequest,
    { params }: ContextRota
) {
    try {
        //recuperar ID da rota
        const { id } = await params;

        //Consultar tutor pelo service
        const tutor = await tutorService.consultarPorID(Number(id));

        //retornar tutor encontrado
        return NextResponse.json({
            mensagem: "Tutor encontrado com sucesso",
            dados: tutor,
        });

    } catch (error) {
        const mensagem_erro = error instanceof Error
            ? error.message
            : "Erro interno ao Consultar tutor"
        
        if (mensagem_erro === "Tutor não encontrado") {
            return NextResponse.json(
                { erro: mensagem_erro },
                { status: 404 }
            );
        }

        //ID não encontrado
        if (mensagem_erro.includes("inválido")) {
            return NextResponse.json(
                { erro: mensagem_erro },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { erro: "Não foi possivél consultar tutor" },
            { status: 500 }
        );
    }
}
