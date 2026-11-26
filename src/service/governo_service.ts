
const API_GOVERNAMENTAL_URL =
    process.env.API_GOVERNAMENTAL_URL;

const MENSAGEM_API_INDISPONIVEL =
    "API Governo fora de serviço.";

function obterDetalhe(resultado: unknown): string | null {
    if (
        typeof resultado === "object" &&
        resultado !== null &&
        "detail" in resultado
    ) {
        const detalhe = resultado.detail;

        if (typeof detalhe === "string") {
            return detalhe;
        }

        if (detalhe !== undefined && detalhe !== null) {
            return JSON.stringify(detalhe);
        }
    }

    return null;
}

async function requisicaoGoverno(
    url: string,
    opcoes: RequestInit
): Promise<unknown> {
    let resposta: Response;

    try {
        resposta = await fetch(url, {
            ...opcoes,
            signal: AbortSignal.timeout(5000)
        });
    } catch (erro) {
        console.error("API GOVERNO INDISPONÍVEL:", erro);

        throw new Error(MENSAGEM_API_INDISPONIVEL);
    }

    let textoResposta: string;

    try {
        textoResposta = await resposta.text();
    } catch (erro) {
        console.error("ERRO AO LER RESPOSTA DA API GOVERNO:", erro);

        throw new Error(MENSAGEM_API_INDISPONIVEL);
    }

    let resultado: unknown;

    try {
        resultado = textoResposta
            ? JSON.parse(textoResposta)
            : {};
    } catch (erro) {
        console.error("RESPOSTA INVÁLIDA DA API GOVERNO:", {
            status: resposta.status,
            resposta: textoResposta,
            erro
        });

        throw new Error(MENSAGEM_API_INDISPONIVEL);
    }

    if (!resposta.ok) {
        console.error("ERRO HTTP API GOVERNO:", {
            status: resposta.status,
            resposta: resultado
        });

        if (resposta.status >= 500) {
            throw new Error(MENSAGEM_API_INDISPONIVEL);
        }

        throw new Error(
            obterDetalhe(resultado) ??
            "Falha na comunicação com a API governamental."
        );
    }

    return resultado;
}

function obterUrlGoverno(): string {
    if (!API_GOVERNAMENTAL_URL) {
        throw new Error(
            "A URL da API governamental não foi configurada."
        );
    }

    return API_GOVERNAMENTAL_URL;
}

export async function enviarVacinacaoAntirrabica(
    dados: {
        chave_idempotencia: string;
        microchip: string;
        identificacao_animal: string;
        data_vacinacao: string;
        identificacao_vacina: string;
        fabricante: string;
        lote: string;
        identificacao_veterinario: string;
    }
) {
    return await requisicaoGoverno(
        `${obterUrlGoverno()}/api/governo/vacinacoes-antirrabicas`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        }
    );
}

export async function cadastrarAnimalGoverno(dados: {
    microchip: string;
    nome: string;
    data_nascimento?: string | null;
    idade_estimada?: number | null;
    sexo?: string | null;
    cor?: string | null;
    peso_atual?: number | null;
    especie: string;
    raca?: string | null;
}) {
    return await requisicaoGoverno(
        `${obterUrlGoverno()}/api/governo/animais`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        }
    );
}

export async function atualizarAnimalGoverno(
    microchip: string,
    dados: {
        nome?: string;
        data_nascimento?: string | null;
        idade_estimada?: number | null;
        sexo?: string | null;
        cor?: string | null;
        peso_atual?: number | null;
        especie?: string;
        raca?: string | null;
    }
) {
    return await requisicaoGoverno(
        `${obterUrlGoverno()}/api/governo/animais/${encodeURIComponent(microchip)}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        }
    );
}

export async function consultarOperacaoPorProtocolo(
    protocolo: string
) {
    return await requisicaoGoverno(
        `${obterUrlGoverno()}/api/governo/operacoes/${encodeURIComponent(protocolo)}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            cache: "no-store"
        }
    );
}