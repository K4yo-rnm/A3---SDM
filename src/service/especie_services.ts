'use service'

import { especieRepository } from "@/repository/especie_repository";

export class EspecieService {

    async cadastrar(dados: {
        nome: string;
        descricao?: string | null;
        situacao: string;
    }) {
        // Validar se o nome foi informado
        if (!dados.nome || !dados.nome.trim()) {
            throw new Error("O nome da espécie é obrigatório.");
        }

        // Preparar dados antes de enviar ao Repository
        const dadosTratados = {
            nome: dados.nome.trim(),
            descricao: dados.descricao?.trim() || null,
            situacao: dados.situacao
        };

        return await especieRepository.cadastrar(dadosTratados);
    }

    async atualizar(id: number, dados: {
        nome?: string;
        descricao?: string | null;
        situacao?: string;
    }) {
        if (!id || id <= 0) {
            throw new Error("ID da espécie inválido.");
        }

        if (dados.nome !== undefined && !dados.nome.trim()) {
            throw new Error("O nome da espécie não pode ficar vazio.");
        }

        const dadosTratados = {
            ...dados,
            nome: dados.nome?.trim(),
            descricao: dados.descricao?.trim() || dados.descricao
        };

        return await especieRepository.atualizar(id, dadosTratados);
    }

    async inativar(id: number) {
        if (!id || id <= 0) {
            throw new Error("ID da espécie inválido.");
        }

        return await especieRepository.inativar(id);
    }

    async consultarPorID(id: number) {
        if (!id || id <= 0) {
            throw new Error("ID da espécie inválido.");
        }

        const especie = await especieRepository.buscarPorID(id);

        if (!especie) {
            throw new Error("Espécie não encontrada.");
        }

        return especie;
    }

    async listarTodas() {
        return await especieRepository.listarTodas();
    }
}

export const especieService = new EspecieService();
