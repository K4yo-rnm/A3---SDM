
"use client";

import { FormEvent, useState } from "react";

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

interface EditarTutorProps {
    tutor: Tutor;
    onClose: () => void;
    onAtualizado: () => void;
}

export default function EditarTutor({
    tutor,
    onClose,
    onAtualizado,
}: EditarTutorProps) {
    const enderecoAtual = tutor.enderecos?.[0];

    const [cep, setCep] = useState(enderecoAtual?.cep || "");
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [cepValidado, setCepValidado] = useState("");
    const [erro, setErro] = useState("");

    const [endereco, setEndereco] = useState({
        logradouro: enderecoAtual?.logradouro || "",
        numero: enderecoAtual?.numero || "",
        complemento: enderecoAtual?.complemento || "",
        bairro: enderecoAtual?.bairro || "",
        cidade: enderecoAtual?.cidade || "",
        uf: enderecoAtual?.uf || "",
        id_ibge_municipio: enderecoAtual?.id_ibge_municipio || "",
    });


    async function buscarCep() {
        const cepLimpo = cep.replace(/\D/g, "");

        setCepValidado("");

        if (cepLimpo.length !== 8) {
            setErro("Informe um CEP válido com 8 números.");
            return;
        }

        setBuscandoCep(true);
        setErro("");

        try {
            const resposta = await fetch(`/api/cep/${cepLimpo}`, {
                method: "GET",
                credentials: "include",
            });

            const dados = await resposta.json();

            console.log("Resposta da API CEP:", dados);

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.erro ||
                    "Não foi possível consultar o CEP."
                );
            }

            if (dados.erro || !dados.endereco) {
                throw new Error("CEP inválido.");
            }

            const dadosEndereco = dados.endereco;

            setEndereco((anterior) => ({
                ...anterior,
                logradouro: dadosEndereco.logradouro || "",
                bairro: dadosEndereco.bairro || "",
                cidade: dadosEndereco.cidade || "",
                uf: dadosEndereco.uf || "",
                id_ibge_municipio: dadosEndereco.codigo_ibge || "",
            }));

            setCepValidado(cepLimpo);

        } catch (erro) {
            setCepValidado("");
            setErro(
                erro instanceof Error
                    ? erro.message
                    : "Erro ao consultar o CEP."
            );
        } finally {
            setBuscandoCep(false);
        }
    }


    async function atualizarTutor(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro("");

        const cepLimpo = cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8 || cepValidado !== cepLimpo) {
            setErro("CEP inválido. Consulte um CEP válido antes de salvar.");
            return;
        }

        const formulario = new FormData(event.currentTarget);

        setSalvando(true);

        const payload = {
            nome_completo: String(
                formulario.get("nome_completo") || ""
            ).trim(),

            cpf: String(
                formulario.get("cpf") || ""
            ).replace(/\D/g, ""),

            data_nascimento:
                formulario.get("data_nascimento") || null,

            email: String(
                formulario.get("email") || ""
            ).trim() || null,

            telefone: String(
                formulario.get("telefone") || ""
            ).trim() || null,

            enderecos: [{
                cep: cepLimpo,
                logradouro: endereco.logradouro.trim(),
                numero: endereco.numero.trim(),
                complemento: endereco.complemento.trim() || null,
                bairro: endereco.bairro.trim(),
                cidade: endereco.cidade.trim(),
                uf: endereco.uf.trim().toUpperCase(),
                id_ibge_municipio: endereco.id_ibge_municipio || null,
            }],
        };

        try {
            const resposta = await fetch(
                `/api/tutores/${tutor.id_tutor}`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                    body: JSON.stringify(payload),
                }
            );

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(
                    dados.mensagem ||
                    dados.erro ||
                    "Não foi possível atualizar o tutor."
                );
            }

            onAtualizado();
            onClose();

        } catch (erro) {
            setErro(
                erro instanceof Error
                    ? erro.message
                    : "Ocorreu um erro ao atualizar o tutor."
            );
        } finally {
            setSalvando(false);
        }
    }

    function atualizarEndereco(
        campo: keyof typeof endereco,
        valor: string
    ) {
        setEndereco((anterior) => ({
            ...anterior,
            [campo]: valor,
        }));
    }

    return (
        <div className="mb-6 rounded-xl border border-[#E7E5DF] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-[#343A40]">
                        Editar tutor
                    </h3>

                    <p className="mt-1 text-sm text-[#6B7280]">
                        Atualize os dados de {tutor.nome_completo}.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg px-3 py-2 text-sm text-[#6B7280] hover:bg-[#FAF9F6]"
                >
                    Fechar
                </button>
            </div>

            <form onSubmit={atualizarTutor}>
                <h4 className="mb-4 text-sm font-semibold text-[#343A40]">
                    Dados pessoais
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            Nome completo *
                        </label>

                        <input
                            name="nome_completo"
                            defaultValue={tutor.nome_completo}
                            required
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            CPF *
                        </label>

                        <input
                            name="cpf"
                            defaultValue={tutor.cpf}
                            required
                            maxLength={14}
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            Data de nascimento
                        </label>

                        <input
                            name="data_nascimento"
                            type="date"
                            defaultValue={
                                tutor.data_nascimento
                                    ? tutor.data_nascimento.slice(0, 10)
                                    : ""
                            }
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            E-mail
                        </label>

                        <input
                            name="email"
                            type="email"
                            defaultValue={tutor.email || ""}
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            Telefone
                        </label>

                        <input
                            name="telefone"
                            defaultValue={tutor.telefone || ""}
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>
                </div>

                <div className="my-6 border-t border-[#E7E5DF]" />

                <h4 className="mb-4 text-sm font-semibold text-[#343A40]">
                    Endereço
                </h4>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            CEP *
                        </label>

                        <div className="flex gap-2">
                            <input
                                value={cep}
                                onChange={(event) =>
                                    setCep(event.target.value)
                                }
                                onBlur={() => {
                                    if (cep.replace(/\D/g, "").length === 8) {
                                        buscarCep();
                                    }
                                }}
                                maxLength={8}
                                required
                                className="min-w-0 flex-1 rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                            />

                            <button
                                type="button"
                                onClick={buscarCep}
                                disabled={buscandoCep}
                                className="rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm text-[#343A40] hover:bg-[#FAF9F6] disabled:opacity-50"
                            >
                                {buscandoCep ? "Buscando..." : "Buscar"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            Logradouro *
                        </label>

                        <input
                            value={endereco.logradouro}
                            onChange={(event) =>
                                atualizarEndereco("logradouro", event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            Número *
                        </label>

                        <input
                            value={endereco.numero}
                            onChange={(event) =>
                                atualizarEndereco("numero", event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            Complemento
                        </label>

                        <input
                            value={endereco.complemento}
                            onChange={(event) =>
                                atualizarEndereco("complemento", event.target.value)
                            }
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            Bairro *
                        </label>

                        <input
                            value={endereco.bairro}
                            onChange={(event) =>
                                atualizarEndereco("bairro", event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            Cidade *
                        </label>

                        <input
                            value={endereco.cidade}
                            onChange={(event) =>
                                atualizarEndereco("cidade", event.target.value)
                            }
                            required
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm outline-none focus:border-[#718879]"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-[#343A40]">
                            UF *
                        </label>

                        <input
                            value={endereco.uf}
                            onChange={(event) =>
                                atualizarEndereco("uf", event.target.value.toUpperCase())
                            }
                            maxLength={2}
                            required
                            className="w-full rounded-lg border border-[#E7E5DF] px-3 py-2 text-sm uppercase outline-none focus:border-[#718879]"
                        />
                    </div>
                </div>

                {erro && (
                    <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {erro}
                    </div>
                )}

                <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm font-medium text-[#343A40] hover:bg-[#FAF9F6]"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={salvando || buscandoCep}
                        className="rounded-lg bg-[#718879] px-5 py-2 text-sm font-medium text-white transition hover:bg-[#5D7165] disabled:opacity-50"
                    >
                        {salvando ? "Salvando..." : "Salvar alterações"}
                    </button>
                </div>
            </form>
        </div>
    );
}
