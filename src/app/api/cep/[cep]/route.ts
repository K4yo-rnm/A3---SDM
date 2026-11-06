import { NextRequest, NextResponse } from "next/server";

interface ViaCep {
    cep: string;
    logradouro: string;
    complemento: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
    erro?: boolean;
}

export async function GET(
    request: NextRequest,
    context: {params: Promise<{cep: string}>}
) {
    try {
        const { cep } = await context.params;

        const cep_limpo = cep.replace(/\D/g, "");

        // Validar
        if (cep_limpo.length !== 8) {
            return NextResponse.json(
                { erro: "O CEP dve conter 8 digitos" },
                {status: 400}
            )
        }

        //Consulta
        const resposta = await fetch(
            `https://viacep.com.br/ws/${ cep_limpo }/json/`,
            { signal: AbortSignal.timeout(5000) }
        );

        if (!resposta.ok) {
            return NextResponse.json(
                { erro: "Não foi possivél completar a busca" },
                {status: 502}
            )
        }

        const dados: ViaCep = await resposta.json()

        if (dados.erro) {
            return NextResponse.json(
                {erro: "CEP não encontrado"},
                {status: 404}
            );
        }

        const resultado = {
            mensagem: "CEP consultado com sucesso",
            endereco: {
                cep: dados.cep,
                logradouro: dados.logradouro,
                complemento: dados.complemento,
                bairro: dados.bairro,
                cidade: dados.localidade,
                uf: dados.uf,
                codigo_ibge: dados.ibge,
            },
        };

        return new Response(JSON.stringify(resultado, null, 2), {
            headers: {
                'Content-Type': "application/json",
            },
        });

    } catch (error) {
        if (error instanceof Error && error.name === "TimeoutError") {
            return NextResponse.json(
                { erro: "Consulta de CEP atingiu limite de Tempo" },
                { status: 504 }
            );
        }
        
        return NextResponse.json(
            { erro: "Consulta de CEP indisponivél no momento" },
            { status: 502 }
        );

    }
}