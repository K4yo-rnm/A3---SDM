'use service'


import { racaRepository } from "@/repository/raca_repository";
import { especieRepository } from "@/repository/especie_repository";

export class RacaService {

    async cadastrar(dados: {
        nome: string;
        descricao?: string | null;
        situacao: string;
        id_especie: number;
    }) {
        if (!dados.nome || !dados.nome.trim()) {
            throw new Error("O nome da raça é obrigatório.");
        }

        if (!dados.id_especie || dados.id_especie <= 0) {
            throw new Error("Uma espécie válida deve ser informada.");
        }

        const especie = await especieRepository.buscarPorID(dados.id_especie);

        if (!especie) {
            throw new Error("Espécie não encontrada.");
        }

        if (especie.situacao !== "ATIVO") {
            throw new Error("Não é possível cadastrar raça para uma espécie inativa.");
        }

        const dadosTratados = {
            nome: dados.nome.trim(),
            descricao: dados.descricao?.trim() || null,
            situacao: dados.situacao,
            id_especie: dados.id_especie
        };

        const racaExistente = await racaRepository.buscarPorNomeEEspecie(
            dadosTratados.nome,
            dados.id_especie
        );

        if (racaExistente) {
            throw new Error("Já existe uma raça com esse nome para esta espécie.");
        }

        return await racaRepository.cadastrar(dadosTratados);
    }

    async atualizar(id: number, dados: {
        nome?: string;
        descricao?: string | null;
        situacao?: string;
        id_especie?: number;
    }) {
        if (!id || id <= 0) {
            throw new Error("ID da raça inválido.");
        }

        if (dados.nome !== undefined && !dados.nome.trim()) {
            throw new Error("O nome da raça não pode ficar vazio.");
        }

        if (dados.id_especie !== undefined) {
            if (dados.id_especie <= 0) {
                throw new Error("Espécie inválida.");
            }

            const especie = await especieRepository.buscarPorID(dados.id_especie);

            if (!especie) {
                throw new Error("Espécie não encontrada.");
            }

            if (especie.situacao !== "ATIVO") {
                throw new Error("Não é possível associar a raça a uma espécie inativa.");
            }
        }

        const dadosTratados = {
            ...dados,
            nome: dados.nome?.trim(),
            descricao: dados.descricao?.trim() || dados.descricao
        };

        return await racaRepository.atualizar(id, dadosTratados);
    }

    async inativar(id: number) {
        if (!id || id <= 0) {
            throw new Error("ID da raça inválido.");
        }

        return await racaRepository.inativar(id);
    }

    async consultarPorID(id: number) {
        if (!id || id <= 0) {
            throw new Error("ID da raça inválido.");
        }

        const raca = await racaRepository.buscarPorID(id);

        if (!raca) {
            throw new Error("Raça não encontrada.");
        }

        return raca;
    }

    async listarTodas() {
        return await racaRepository.listarTodas();
    }
}

export const racaService = new RacaService();
