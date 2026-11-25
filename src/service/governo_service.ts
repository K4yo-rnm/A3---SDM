
const API_GOVERNAMENTAL_URL =
    process.env.API_GOVERNAMENTAL_URL;

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
    if (!API_GOVERNAMENTAL_URL) {
        throw new Error(
            "A URL da API governamental não foi configurada."
        );
    }

    const resposta = await fetch(
        `${API_GOVERNAMENTAL_URL}/api/governo/vacinacoes-antirrabicas`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados),
            signal: AbortSignal.timeout(5000)
        }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            resultado.detail ??
            "Falha na comunicação com a API governamental."
        );
    }   

    return resultado;
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
    if (!API_GOVERNAMENTAL_URL) {
        throw new Error("A URL da API governamental não foi configurada.");
    }

    const resposta = await fetch(
        `${API_GOVERNAMENTAL_URL}/api/governo/animais`,
        {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
            signal: AbortSignal.timeout(5000)
        }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
        console.error("ERRO API GOVERNO:", {
            status: resposta.status,
            resposta: resultado
        });

        const detalhe = resultado.detail;

        throw new Error(
            typeof detalhe === "string"
                ? detalhe
                : JSON.stringify(detalhe ?? resultado)
        );
    }

    return resultado;
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
    if (!API_GOVERNAMENTAL_URL) {
        throw new Error("A URL da API governamental não foi configurada.");
    }

    const resposta = await fetch(
        `${API_GOVERNAMENTAL_URL}/api/governo/animais/${encodeURIComponent(microchip)}`,
        {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados),
            signal: AbortSignal.timeout(5000)
        }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
        throw new Error(
            resultado.detail ?? "Falha ao atualizar animal na API governamental."
        );
    }

    return resultado;
}

export async function consultarOperacaoPorProtocolo(protocolo: string) {
    if (!API_GOVERNAMENTAL_URL) {
        throw new Error("A URL da API governamental não foi configurada.");
    }

    const resposta = await fetch(
        `${API_GOVERNAMENTAL_URL}/api/governo/operacoes/${encodeURIComponent(protocolo)}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
            cache: "no-store",
            signal: AbortSignal.timeout(5000)
        }
    );

    const resultado = await resposta.json();

    if (!resposta.ok) {
        const detalhe = resultado.detail;

        throw new Error(
            typeof detalhe === "string"
                ? detalhe
                : JSON.stringify(detalhe ?? "Falha ao consultar protocolo.")
        );
    }

    return resultado;
}


