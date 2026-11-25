import { NextResponse, NextRequest } from "next/server";
import { tutorService } from "@/service/tutor_services";
import { obterVeterinarioAutenticado } from "@/lib/auth";

export async function GET() {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        const tutores = await tutorService.consultarTodos();

        return NextResponse.json(
            {
                mensagem: "Tutores listados com sucesso.",
                total: tutores.length,
                dados: tutores
            },
            { status: 200 }
        );
    } catch (erro) {
        console.error("ERRO AO LISTAR TUTORES:", erro);

        return NextResponse.json(
            { erro: "Não foi possível listar os tutores." },
            { status: 500 }
        );
    }
}

//POST Cadastrar Tutor
export async function POST(request: NextRequest) {
    try {
        const veterinario = await obterVeterinarioAutenticado();

        if (!veterinario) {
            return NextResponse.json(
                { mensagem: "Acesso não autorizado. Faça login." },
                { status: 401 }
            );
        }
        //Recebe os dados
        const dados = await request.json();

        //Encaminha os dados para service
        const tutor = await tutorService.cadastrar_tutor(dados);

        //Retornar Tutor Cadastrado
        return NextResponse.json({
            mensage: "Tutor cadastrado com sucesso",
            dados: tutor
        },
            { status: 201 }
        );

        
    } catch (erro) {
        console.error("ERRO DETALHADO AO CADASTRAR TUTOR:", erro);

        const mensagem_erro = erro instanceof Error
            ? erro.message
            : "Erro ao Cadastrar Tutor"
        
        //CPF duplicado gera conflito
        if (mensagem_erro.includes("Tutor Já Cadastrado")) {
            return NextResponse.json(
                { erro: mensagem_erro },
                { status: 409 }
            );
        }
        
        //Erro de validação vai retornar uma requisição invalida
        if (
            mensagem_erro.includes("Obrigatório") ||
            mensagem_erro.includes("invalido") ||
            mensagem_erro.includes("endereço")
        ) {
            return NextResponse.json(
                { erro: mensagem_erro },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { erro: "Não foi possivel cadastrar tutor" },
            { status: 500 }
        );
    }
}

