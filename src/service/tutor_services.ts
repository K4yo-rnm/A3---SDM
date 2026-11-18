'use service'

import { tutorRepository } from "@/repository/tutor_repository"

export class TutorService {

    // Validar CPF
    private validarCPF(cpf: string): boolean {
        const numero = cpf.replace(/\D/g, "");

        if (numero.length !== 11) {
            return false;
        }

        if (/^(\d)\1{10}$/.test(numero)) {
            return false
        }

        let soma = 0;

        for (let i = 0; i < 9; i++) {
            soma += Number(numero[i]) * (10 - i);
        }

        let resto = (soma * 10) % 11;
        const digito1 = resto === 10 ? 0 : resto;

        if (digito1 !== Number(numero[9])) {
            return false;
        }

        soma = 0;

        for (let i = 0; i < 10; i++) {
            soma += Number(numero[i]) * (11 - i);
        }

        resto = (soma * 10) % 11;
        const digito2 = resto === 10 ? 0 : resto;

        return digito2 === Number(numero[10]);
    }

    async cadastrar_tutor(dados: {
        nome_completo: string;
        cpf: string;
        data_nascimento?: Date | string | null;
        email?: string | null;
        telefone?: string | null;
        enderecos: {
            cep: string;
            logradouro: string;
            numero: string;
            complemento?: string | null;
            bairro: string;
            cidade: string;
            uf: string;
            id_ibge_municipio?: string | null;
        }[];
    }) {
        //validar nome Completo
        if (!dados.nome_completo || !dados.nome_completo.trim()) {
            throw new Error("Nome Completo é Obrigatório")
        }

        //Verificar endereco
        // 4. Verificar se existe pelo menos um endereço
        if (!Array.isArray(dados.enderecos) || dados.enderecos.length === 0) {
            throw new Error("O tutor precisa ter pelo menos um endereço.");
        }

        // 5. Validar os dados de cada endereço
        for (const [indice, endereco] of dados.enderecos.entries()) {

            // Campos obrigatórios
            const camposObrigatorios = [
                "cep",
                "logradouro",
                "numero",
                "bairro",
                "cidade",
                "uf"
            ] as const;

            for (const campo of camposObrigatorios) {
                if (
                    typeof endereco[campo] !== "string" ||
                    !endereco[campo].trim()
                ) {
                    throw new Error(
                        `O campo ${campo} é obrigatório no endereço ${indice + 1}.`
                    );
                }
            }

            // Validar CEP: deve possuir 8 números
            const cep = endereco.cep.replace(/\D/g, "");

            if (!/^\d{8}$/.test(cep)) {
                throw new Error(`CEP inválido no endereço ${indice + 1}.`);
            }

            // Validar UF: deve possuir 2 letras
            if (!/^[A-Za-z]{2}$/.test(endereco.uf.trim())) {
                throw new Error(`UF inválida no endereço ${indice + 1}.`);
            }

            // Validar código IBGE, caso informado
            if (
                endereco.id_ibge_municipio &&
                !/^\d{7}$/.test(endereco.id_ibge_municipio)
            ) {
                throw new Error(`Código IBGE inválido no endereço ${indice + 1}.`);
            }
        }

        //Normalizar CPF
        const cpf = dados.cpf.replace(/\D/g, "");

        if (!this.validarCPF(cpf)) {
            throw new Error("CPF invalido");
        }

        //verificar Tutor Duplicado
        const tutorExistente = await tutorRepository.buscaPorCPF(cpf)

        if (tutorExistente) {
            throw new Error("Tutor Já Cadastrado")
        }

        //Converter Data de Nascimento para Date
        const data_nascimento = dados.data_nascimento
            ? new Date(String(dados.data_nascimento))
            : null
        
        //Validar data de nascimento
        if (data_nascimento && Number.isNaN(data_nascimento.getTime())) {
            throw new Error("Data de Nascimento Invalida.") 
        }

        // Cadastrar Tutor
        return await tutorRepository.criar({
            ...dados,
            cpf,
            data_nascimento: data_nascimento,
        });

    }

    async consultarPorID(id: number) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Identificador de tutor inválido");
        }

        const tutor = await tutorRepository.bucarPorID(id);

        if (!tutor) {
            throw new Error("Tutor não encontrado");
        }

        return tutor;
    }

    async consultarTodos() {
        return await tutorRepository.bucarTodos();
    }

    // Atualizar tutor
    async atualizarTutor(id: number, dados: {
            nome_completo?: string;
            cpf?: string;
            data_nascimento?: Date | string | null;
            email?: string | null;
            telefone?: string | null;
            enderecos?: {
                cep: string;
                logradouro: string;
                numero: string;
                complemento?: string | null;
                bairro: string;
                cidade: string;
                uf: string;
                id_ibge_municipio?: string | null;
            }[];
        }) {
            if (!Number.isInteger(id) || id <= 0) {
                throw new Error("ID do tutor inválido.");
            }

            const tutor = await tutorRepository.bucarPorID(id);

            if (!tutor) {
                throw new Error("Tutor não encontrado.");
            }

            if (
                dados.nome_completo !== undefined &&
                !dados.nome_completo.trim()
            ) {
                throw new Error("O nome do tutor não pode ficar vazio.");
            }

            if (dados.cpf !== undefined) {
                const cpf = dados.cpf.replace(/\D/g, "");

                if (!this.validarCPF(cpf)) {
                    throw new Error("CPF inválido.");
                }

                const tutorExistente = await tutorRepository.buscaPorCPF(cpf);

                if (tutorExistente && tutorExistente.id_tutor !== id) {
                    throw new Error("Este CPF já está cadastrado.");
                }

                dados.cpf = cpf;
            }

            if (
                dados.data_nascimento !== undefined &&
                dados.data_nascimento !== null
            ) {
                const data = new Date(dados.data_nascimento);

                if (Number.isNaN(data.getTime())) {
                    throw new Error("Data de nascimento inválida.");
                }

                dados.data_nascimento = data;
            }

            return await tutorRepository.atualizarTutor(id, {
                ...dados,
                data_nascimento: dados.data_nascimento as Date | null | undefined
            });
        }

    // Inativar tutor (exclusão lógica)
    async inativarTutor(id: number) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID do tutor inválido.");
        }

        const tutor = await tutorRepository.bucarPorID(id);

        if (!tutor) {
            throw new Error("Tutor não encontrado.");
        }

        if (tutor.situacao === "INATIVO") {
            throw new Error("Este tutor já está inativo.");
        }

        return await tutorRepository.inativarTutor(id);
    }
    
    //Não chamar
    async deletarTutor(id: number) {
        if (!Number.isInteger(id) || id <= 0) {
            throw new Error("Identificador invalido")
        }

        //Verificar Tutor por ID
        const tutor_existe = await tutorRepository.bucarPorID(id)

        if (!tutor_existe) {
            throw new Error("Tutor não existe no bando de dados")
        }

        return await tutorRepository.deletarPorId(id)
    }
}

export const tutorService = new TutorService();