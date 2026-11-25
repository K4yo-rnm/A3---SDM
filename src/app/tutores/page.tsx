
"use client";

import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import NovoTutor from "@/components/Tutores/NovoTutor";
import ListaTutores from "@/components/Tutores/ListarTutores";
import EditarTutor from "@/components/Tutores/EditarTutor";

interface Endereco {
    id_endereco: number;
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string | null;
    bairro: string;
    cidade: string;
    uf: string;
    id_ibge_municipio: string | null;
}

interface Tutor {
    id_tutor: number;
    nome_completo: string;
    cpf: string;
    data_nascimento: string | null;
    email: string | null;
    telefone: string | null;
    situacao: "ATIVO" | "INATIVO";
    enderecos: Endereco[];
}

export default function TutoresPage() {
    const [tutores, setTutores] = useState<Tutor[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [tutorSelecionado, setTutorSelecionado] = useState<Tutor | null>(null);

    const carregarTutores = useCallback(async (mostrarCarregamento = true) => {
        if (mostrarCarregamento) {
            setCarregando(true);
        }

        setErro("");

        try {
            const resposta = await fetch("/api/tutores", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.erro ||
                    "Não foi possível carregar os tutores."
                );
            }

            setTutores(dados.dados);
        } catch (erro) {
            setErro(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao carregar os tutores."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const controlador = new AbortController();

        async function buscarTutores() {
            try {
                const resposta = await fetch("/api/tutores", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                    signal: controlador.signal,
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(
                        dados.mensagem ||
                        dados.erro ||
                        "Não foi possível carregar os tutores."
                    );
                }

                setTutores(dados.dados);
            } catch (erro) {
                if (erro instanceof Error && erro.name === "AbortError") {
                    return;
                }

                setErro(
                    erro instanceof Error
                        ? erro.message
                        : "Ocorreu um erro ao carregar os tutores."
                );
            } finally {
                if (!controlador.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        buscarTutores();

        return () => controlador.abort();
    }, []);

    const totalAtivos = tutores.filter(
        (tutor) => tutor.situacao === "ATIVO"
    ).length;

    const totalInativos = tutores.filter(
        (tutor) => tutor.situacao === "INATIVO"
    ).length;

    async function inativarTutor(tutor: Tutor) {
        try {
            const resposta = await fetch(`/api/tutores/${tutor.id_tutor}`, {
                method: "DELETE",
                credentials: "include",
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem || dados.erro || "Não foi possível inativar o tutor."
                );
            }

            await carregarTutores(false);

        } catch (error) {
            alert(
                error instanceof Error
                    ? error.message
                    : "Erro ao inativar tutor."
            );
        }
    }

    return (
        <AppLayout title="Tutores">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#343A40]">
                    Gerenciamento de tutores
                </h2>

                <p className="mt-2 text-sm text-[#6B7280]">
                    Consulte os responsáveis cadastrados e seus dados de contato.
                </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">Total de tutores</p>

                    <p className="mt-2 text-2xl font-bold text-[#343A40]">
                        {tutores.length}
                    </p>
                </div>

                <div className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">Tutores ativos</p>

                    <p className="mt-2 text-2xl font-bold text-[#5D7165]">
                        {totalAtivos}
                    </p>
                </div>

                <div className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">Tutores inativos</p>

                    <p className="mt-2 text-2xl font-bold text-[#6B7280]">
                        {totalInativos}
                    </p>
                </div>
            </div>
            
            {mostrarFormulario && (
                <NovoTutor
                    onClose={() => setMostrarFormulario(false)}
                />
            )}
            {tutorSelecionado && (
                <EditarTutor
                    key={tutorSelecionado.id_tutor}
                    tutor={tutorSelecionado}
                    onClose={() => setTutorSelecionado(null)}
                    onAtualizado={() => carregarTutores(false)}
                />
            )}
            <section className="overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">

                <div className="flex flex-col gap-3 border-b border-[#E7E5DF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-[#343A40]">
                            Tutores cadastrados
                        </h3>

                        <p className="mt-1 text-sm text-[#6B7280]">
                            Relação de responsáveis registrados na clínica.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setMostrarFormulario(true)}
                            className="rounded-lg bg-[#718879] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5D7165]"
                        >
                            + Novo tutor
                        </button>
                    
                        <button
                            type="button"
                            onClick={() => carregarTutores()}
                            disabled={carregando}
                            className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm font-medium text-[#343A40] transition hover:bg-[#FAF9F6] disabled:opacity-50"
                        >
                            {carregando ? "Atualizando..." : "Atualizar lista"}
                        </button>
                    </div>
                </div>

                {erro && (
                    <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {erro}
                    </div>
                )}

                {carregando ? (
                    <div className="p-10 text-center text-sm text-[#6B7280]">
                        Carregando tutores...
                    </div>
                ) : !erro && tutores.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-medium text-[#343A40]">
                            Nenhum tutor cadastrado.
                        </p>

                        <p className="mt-2 text-sm text-[#6B7280]">
                            Os tutores cadastrados aparecerão nesta lista.
                        </p>
                    </div>
                ) : (
                    !erro && (
                                <ListaTutores
                                    tutores={tutores}
                                    onEditar={(tutor) => setTutorSelecionado(tutor)}
                                    onInativar={inativarTutor}
                                />
                    )
                )}
            </section>
        </AppLayout>
    );
}    