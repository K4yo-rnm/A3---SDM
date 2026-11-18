
import { prisma } from "@/lib/prisma";

export class ConsultaRepository {

    // Buscar consulta pelo ID
    async buscarPorID(id: number) {
        return await prisma.consulta.findUnique({
            where: {
                id_consulta: id
            },
            include: {
                animal: true,
                veterinario: true
            }
        });
    }

    // Buscar histórico de consultas de um animal
    async buscarPorAnimal(id_animal: string) {
        return await prisma.consulta.findMany({
            where: {
                id_animal: id_animal
            },
            include: {
                veterinario: true
            },
            orderBy: {
                data_hora: "desc"
            }
        });
    }

    // Listar todas as consultas
    async buscarTodos() {
        return await prisma.consulta.findMany({
            include: {
                animal: true,
                veterinario: true
            },
            orderBy: {
                data_hora: "desc"
            }
        });
    }

    // Registrar consulta
    async criar(dados: {
        id_animal: string;
        id_veterinario: number;
        data_hora: Date;
        motivo_atendimento: string;
        anamnese?: string | null;
        sintomas?: string | null;
        diagnostico?: string | null;
        tratamento_prescrito?: string | null;
        prescricao_medicamentos?: string | null;
        peso_registrado?: number | null;
        temperatura?: number | null;
        observacoes?: string | null;
        situacao?: string;
    }) {
        return await prisma.consulta.create({
            data: {
                data_hora: dados.data_hora,
                motivo_atendimento: dados.motivo_atendimento,
                anamnese: dados.anamnese,
                sintomas: dados.sintomas,
                diagnostico: dados.diagnostico,
                tratamento_prescrito: dados.tratamento_prescrito,
                prescricao_medicamentos: dados.prescricao_medicamentos,
                peso_registrado: dados.peso_registrado,
                temperatura: dados.temperatura,
                observacoes: dados.observacoes,
                situacao: dados.situacao ?? "AGENDADA",

                animal: {
                    connect: {
                        id_animal: dados.id_animal
                    }
                },

                veterinario: {
                    connect: {
                        id_veterinario: dados.id_veterinario
                    }
                }
            }
        });
    }

    // Atualizar consulta
    async atualizarConsulta(id: number, dados: {
        data_hora?: Date;
        motivo_atendimento?: string;
        anamnese?: string | null;
        sintomas?: string | null;
        diagnostico?: string | null;
        tratamento_prescrito?: string | null;
        prescricao_medicamentos?: string | null;
        peso_registrado?: number | null;
        temperatura?: number | null;
        observacoes?: string | null;
        situacao?: string;
    }) {
        return await prisma.consulta.update({
            where: {
                id_consulta: id
            },
            data: dados
        });
    }

    // Cancelar consulta
    async inativarConsulta(id: number) {
        return await prisma.consulta.update({
            where: {
                id_consulta: id
            },
            data: {
                situacao: "CANCELADA"
            }
        });
    }
}

export const consultaRepository = new ConsultaRepository()
