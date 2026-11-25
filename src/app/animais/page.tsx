

"use client";

import { useCallback, useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import NovoAnimal from "@/components/Animais/NovoAnimal";
import ListarAnimal from "@/components/Animais/ListarAnimal";
import EditarAnimal from "@/components/Animais/EditarAnimal";

interface Animal {
    id_animal: string;
    nome: string;
    data_nascimento: string | null;
    idade_estimada: number | null;
    sexo: string | null;
    cor: string | null;
    peso_atual: number | null;
    situacao: "ATIVO" | "INATIVO";
    id_tutor: number;
    id_especie: number;
    id_raca: number | null;
    tutor: { nome_completo: string };
    especie: { nome: string };
    raca: { nome: string } | null;
    vinculos_microchip: {
        codigo_microchip: string;
        situacao: string;
    }[];
}

export default function AnimaisPage() {
    const [animais, setAnimais] = useState<Animal[]>([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState("");
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [animalSelecionado, setAnimalSelecionado] = useState<Animal | null>(null);

    const carregarAnimais = useCallback(async (mostrarCarregamento = true) => {
        if (mostrarCarregamento) {
            setCarregando(true);
        }

        setErro("");

        try {
            const resposta = await fetch("/api/animais", {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.erro ||
                    "Não foi possível carregar os animais."
                );
            }

            setAnimais(Array.isArray(dados) ? dados : []);
        } catch (erro) {
            setErro(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao carregar os animais."
            );
        } finally {
            setCarregando(false);
        }
    }, []);

    useEffect(() => {
        const controlador = new AbortController();

        async function buscarAnimais() {
            try {
                const resposta = await fetch("/api/animais", {
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
                        "Não foi possível carregar os animais."
                    );
                }

                setAnimais(Array.isArray(dados) ? dados : []);
            } catch (erro) {
                if (erro instanceof Error && erro.name === "AbortError") {
                    return;
                }

                setErro(
                    erro instanceof Error
                        ? erro.message
                        : "Ocorreu um erro ao carregar os animais."
                );
            } finally {
                if (!controlador.signal.aborted) {
                    setCarregando(false);
                }
            }
        }

        buscarAnimais();

        return () => controlador.abort();
    }, []);

    const totalAtivos = animais.filter(
        (animal) => animal.situacao === "ATIVO"
    ).length;

    const totalInativos = animais.filter(
        (animal) => animal.situacao === "INATIVO"
    ).length;

    async function inativarAnimal(animal: Animal) {
        try {
            const resposta = await fetch(`/api/animais/${animal.id_animal}`, {
                method: "DELETE",
                credentials: "include",
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.erro ||
                    "Não foi possível inativar o animal."
                );
            }

            await carregarAnimais(false);

        } catch (erro) {
            alert(
                erro instanceof Error
                    ? erro.message
                    : "Erro ao inativar animal."
            );
        }
    }

    return (
        <AppLayout title="Animais">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#343A40]">
                    Gerenciamento de animais
                </h2>

                <p className="mt-2 text-sm text-[#6B7280]">
                    Consulte os animais cadastrados na clínica e suas informações.
                </p>
            </div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">
                        Total de animais
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#343A40]">
                        {animais.length}
                    </p>
                </div>

                <div className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">
                        Animais ativos
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#5D7165]">
                        {totalAtivos}
                    </p>
                </div>

                <div className="rounded-xl border border-[#E7E5DF] bg-white p-5">
                    <p className="text-sm text-[#6B7280]">
                        Animais inativos
                    </p>

                    <p className="mt-2 text-2xl font-bold text-[#6B7280]">
                        {totalInativos}
                    </p>
                </div>
            </div>

            {mostrarFormulario && (
                <NovoAnimal
                    onClose={() => setMostrarFormulario(false)}
                    onCadastrado={() => carregarAnimais(false)}
                />
            )}

            {animalSelecionado && (
                <EditarAnimal
                    key={animalSelecionado.id_animal}
                    animal={animalSelecionado}
                    onClose={() => setAnimalSelecionado(null)}
                    onAtualizado={() => carregarAnimais(false)}
                />
            )}

            <section className="overflow-hidden rounded-xl border border-[#E7E5DF] bg-white">
                <div className="flex flex-col gap-3 border-b border-[#E7E5DF] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-[#343A40]">
                            Animais cadastrados
                        </h3>

                        <p className="mt-1 text-sm text-[#6B7280]">
                            Relação de animais registrados na clínica.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => setMostrarFormulario(true)}
                            className="rounded-lg bg-[#718879] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#5D7165]"
                        >
                            + Novo animal
                        </button>

                        <button
                            type="button"
                            onClick={() => carregarAnimais()}
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
                        Carregando animais...
                    </div>
                ) : !erro && animais.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-medium text-[#343A40]">
                            Nenhum animal cadastrado.
                        </p>

                        <p className="mt-2 text-sm text-[#6B7280]">
                            Os animais cadastrados aparecerão nesta lista.
                        </p>
                    </div>
                ) : (
                    !erro && (
                        <ListarAnimal
                            animais={animais}
                            onEditar={(animal) => setAnimalSelecionado(animal)}
                            onInativar={inativarAnimal}
                        />
                    )
                )}
            </section>
        </AppLayout>
    );
}


