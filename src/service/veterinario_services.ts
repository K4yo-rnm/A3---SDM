
import { veterinarioRepository } from "@/repository/veterinario_repository";

export class VeterinarioService {

    // Validar CPF
    validarCPF(cpf: string): boolean {
        cpf = cpf.replace(/\D/g, "");

        if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
            return false;
        }

        let soma = 0;

        for (let i = 0; i < 9; i++) {
            soma += Number(cpf[i]) * (10 - i);
        }

        let resto = (soma * 10) % 11;

        if (resto === 10) {
            resto = 0;
        }

        if (resto !== Number(cpf[9])) {
            return false;
        }

        soma = 0;

        for (let i = 0; i < 10; i++) {
            soma += Number(cpf[i]) * (11 - i);
        }

        resto = (soma * 10) % 11;

        if (resto === 10) {
            resto = 0;
        }

        return resto === Number(cpf[10]);
    }

    // Cadastrar veterinário
    async cadastrarVeterinario(dados: {
        cpf: string;
        num_cmrv: string;
        uf_cmrv: string;
        email: string;
        telefone: string;
        hash_sevha: string;
    }) {

        if (!dados.cpf || !dados.num_cmrv || !dados.uf_cmrv ||
            !dados.email || !dados.telefone || !dados.hash_sevha) {
            throw new Error("Todos os campos obrigatórios devem ser preenchidos.");
        }

        const cpf = dados.cpf.replace(/\D/g, "");

        if (!this.validarCPF(cpf)) {
            throw new Error("CPF inválido.");
        }

        const email = dados.email.trim().toLowerCase();

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("E-mail inválido.");
        }

        const uf = dados.uf_cmrv.trim().toUpperCase();

        if (!/^[A-Z]{2}$/.test(uf)) {
            throw new Error("UF do CRMV inválida.");
        }

        const veterinarioCPF = await veterinarioRepository.buscarPorCPF(cpf);

        if (veterinarioCPF) {
            throw new Error("Já existe um veterinário cadastrado com este CPF.");
        }

        const veterinarioEmail = await veterinarioRepository.buscarPorEmail(email);

        if (veterinarioEmail) {
            throw new Error("Já existe um veterinário cadastrado com este e-mail.");
        }

        return await veterinarioRepository.criar({
            ...dados,
            cpf,
            email,
            uf_cmrv: uf,
            senha_confirmada: false,
            situacao: "ATIVO"
        });
    }

    // Consultar veterinário por ID
    async consultarPorID(id: number) {

        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID do veterinário inválido.");
        }

        const veterinario = await veterinarioRepository.buscarPorID(id);

        if (!veterinario) {
            throw new Error("Veterinário não encontrado.");
        }

        return veterinario;
    }

    // Listar veterinários
    async listarTodos() {
        return await veterinarioRepository.buscarTodos();
    }

    // Atualizar veterinário
    async atualizarVeterinario(id: number, dados: {
        cpf?: string;
        num_cmrv?: string;
        uf_cmrv?: string;
        email?: string;
        telefone?: string;
        hash_sevha?: string;
        senha_confirmada?: boolean;
        data_confirmacao?: Date | null;
        situacao?: string;
        ultimo_acesso?: Date | null;
    }) {

        const veterinario = await this.consultarPorID(id);

        if (!veterinario) {
            throw new Error ("Veterinario não encontrado")
        }

        if (dados.cpf !== undefined) {
            const cpf = dados.cpf.replace(/\D/g, "");

            if (!this.validarCPF(cpf)) {
                throw new Error("CPF inválido.");
            }

            const existente = await veterinarioRepository.buscarPorCPF(cpf);

            if (existente && existente.id_veterinario !== id) {
                throw new Error("Este CPF já está cadastrado para outro veterinário.");
            }

            dados.cpf = cpf;
        }

        if (dados.email !== undefined) {
            const email = dados.email.trim().toLowerCase();

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                throw new Error("E-mail inválido.");
            }

            const existente = await veterinarioRepository.buscarPorEmail(email);

            if (existente && existente.id_veterinario !== id) {
                throw new Error("Este e-mail já está cadastrado para outro veterinário.");
            }

            dados.email = email;
        }

        if (dados.uf_cmrv !== undefined) {
            dados.uf_cmrv = dados.uf_cmrv.trim().toUpperCase();

            if (!/^[A-Z]{2}$/.test(dados.uf_cmrv)) {
                throw new Error("UF do CRMV inválida.");
            }
        }

        if (dados.hash_sevha !== undefined && !dados.hash_sevha.trim()) {
            throw new Error("O hash da senha não pode ficar vazio.");
        }

        return await veterinarioRepository.atualizarVeterinario(id, dados);
    }

    // Inativar veterinário
    async inativarVeterinario(id: number) {

        const veterinario = await this.consultarPorID(id);

        if (veterinario.situacao === "INATIVO") {
            throw new Error("Este veterinário já está inativo.");
        }

        return await veterinarioRepository.inativarVeterinario(id);
    }
}

export const veterinarioService = new VeterinarioService();
