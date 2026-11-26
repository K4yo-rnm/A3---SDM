"use client";

import { useState, type FormEvent } from "react";

interface NovoTutorProps {
    onClose: () => void;
}

export default function NovoTutor({ onClose }: NovoTutorProps) {

    const [cep, setCep] = useState("");
    const [buscandoCep, setBuscandoCep] = useState(false);
    const [erroCep, setErroCep] = useState("");
    const [cepValidado, setCepValidado] = useState("");
    const [salvando, setSalvando] = useState(false);
    const [erroCadastro, setErroCadastro] = useState("");

    const [endereco, setEndereco] = useState({
        logradouro: "",
        complemento: "",
        bairro: "",
        cidade: "",
        uf: "",
        id_ibge_municipio: "",
    });

    async function buscarCep() {
        const cepLimpo = cep.replace(/\D/g, "");

        setErroCep("");
        setCepValidado("");

        if (cepLimpo.length !== 8) {
            setErroCep("CEP inválido");
            return;
        }

        setBuscandoCep(true);

        try {
            const resposta = await fetch(`/api/cep/${cepLimpo}`, {
                method: "GET",
                cache: "no-store",
            });

            const dados = await resposta.json();

            if (!resposta.ok || dados.erro || !dados.endereco) {
                throw new Error("CEP inválido");
            }

            setEndereco({
                logradouro: dados.endereco.logradouro || "",
                complemento: dados.endereco.complemento || "",
                bairro: dados.endereco.bairro || "",
                cidade: dados.endereco.cidade || "",
                uf: dados.endereco.uf || "",
                id_ibge_municipio: dados.endereco.codigo_ibge || "",
            });

            setCepValidado(cepLimpo);

        } catch (erro) {
            setErroCep(
                erro instanceof Error && erro.message === "CEP inválido"
                    ? "CEP inválido"
                    : "Erro ao consultar o CEP. Tente novamente."
            );
        } finally {
            setBuscandoCep(false);
        }
    }

    async function cadastrarTutor(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const cepLimpo = cep.replace(/\D/g, "");

        if (cepLimpo.length !== 8 || cepValidado !== cepLimpo) {
            setErroCep("CEP inválido");
            return;
        }

        setErroCadastro("");
        setSalvando(true);

        const formulario = new FormData(event.currentTarget);

        const payload = {
            nome_completo: String(formulario.get("nome_completo") || "").trim(),
            cpf: String(formulario.get("cpf") || "").replace(/\D/g, ""),
            data_nascimento: formulario.get("data_nascimento") || undefined,
            email: String(formulario.get("email") || "").trim() || undefined,
            telefone: String(formulario.get("telefone") || "").trim() || undefined,

            enderecos: [
                {
                    cep: String(formulario.get("cep") || "").replace(/\D/g, ""),
                    logradouro: String(formulario.get("logradouro") || "").trim(),
                    numero: String(formulario.get("numero") || "").trim(),
                    complemento: String(formulario.get("complemento") || "").trim() || undefined,
                    bairro: String(formulario.get("bairro") || "").trim(),
                    cidade: String(formulario.get("cidade") || "").trim(),
                    uf: String(formulario.get("uf") || "").trim().toUpperCase(),
                    id_ibge_municipio: endereco.id_ibge_municipio || undefined,
                },
            ],
        };

        try {
            const resposta = await fetch("/api/tutores", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(payload),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                throw new Error(dados.erro || "Não foi possível cadastrar o tutor.");
            }

            window.location.reload();

        } catch (erro) {
            setErroCadastro(
                erro instanceof Error
                    ? erro.message
                    : "Erro ao cadastrar tutor."
            );
        } finally {
            setSalvando(false);
        }
    }

    return (
        <section className="mb-6 rounded-xl border border-[#E7E5DF] bg-white p-6">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-[#343A40]">
                        Cadastrar novo tutor
                    </h3>
                    <p className="mt-1 text-sm text-[#6B7280]">
                        Preencha os dados pessoais e o endereço do responsável.
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

            <form onSubmit={cadastrarTutor} className="space-y-6">
                {erroCadastro && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                        {erroCadastro}
                    </p>
                )}
                <div>
                    <h4 className="mb-4 text-sm font-semibold text-[#5D7165]">
                        Dados pessoais
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                            <label className="mb-1 block text-sm font-medium">
                                Nome completo *
                            </label>
                            <input
                                name="nome_completo"
                                type="text"
                                required
                                placeholder="Nome completo do tutor"
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">CPF *</label>
                            <input
                                name="cpf"
                                type="text"
                                required
                                maxLength={14}
                                placeholder="000.000.000-00"
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Data de nascimento
                            </label>
                            <input
                                name="data_nascimento"
                                type="date"
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">E-mail</label>
                            <input
                                name="email"
                                type="email"
                                placeholder="exemplo@email.com"
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Telefone</label>
                            <input
                                name="telefone"
                                type="tel"
                                placeholder="(00) 00000-0000"
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-t border-[#E7E5DF] pt-6">
                    <h4 className="mb-4 text-sm font-semibold text-[#5D7165]">
                        Endereço
                    </h4>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

                        <div>
                            <label className="mb-1 block text-sm font-medium">CEP *</label>

                            <div className="flex gap-2">
                                <input
                                    name="cep"
                                    type="text"
                                    required
                                    maxLength={9}
                                    placeholder="00000-000"
                                    value={cep}
                                    onChange={(e) => {
                                        setCep(e.target.value);
                                        setCepValidado("");
                                        setErroCep("");
                                    }}
                                    onBlur={() => {
                                        if (cep.replace(/\D/g, "").length === 8) {
                                            buscarCep();
                                        }
                                    }}
                                    className="min-w-0 flex-1 rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                                />

                                <button
                                    type="button"
                                    onClick={buscarCep}
                                    disabled={buscandoCep}
                                    className="rounded-lg bg-[#718879] px-3 py-2 text-sm font-medium text-white hover:bg-[#5D7165] disabled:opacity-60"
                                >
                                    {buscandoCep ? "Buscando..." : "Buscar"}
                                </button>
                            </div>

                            {erroCep && (
                                <p className="mt-2 text-xs text-red-600">{erroCep}</p>
                            )}
                        </div>


                        <div className="lg:col-span-2">
                            <label className="mb-1 block text-sm font-medium">
                                Logradouro *
                            </label>
                            <input
                                name="logradouro"
                                type="text"
                                required
                                placeholder="Rua, avenida..."
                                value={endereco.logradouro}
                                onChange={(e) =>
                                    setEndereco({ ...endereco, logradouro: e.target.value })
                                }
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Número *</label>
                            <input
                                name="numero"
                                type="text"
                                required
                                placeholder="Número"
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">
                                Complemento
                            </label>
                            <input
                                name="complemento"
                                type="text"
                                placeholder="Apartamento, bloco..."
                                value={endereco.complemento}
                                onChange={(e) =>
                                    setEndereco({ ...endereco, complemento: e.target.value })
                                }
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Bairro *</label>
                            <input
                                name="bairro"
                                type="text"
                                required
                                placeholder="Bairro"
                                value={endereco.bairro}
                                onChange={(e) =>
                                    setEndereco({ ...endereco, bairro: e.target.value })
                                }
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">Cidade *</label>
                            <input
                                name="cidade"
                                type="text"
                                required
                                placeholder="Cidade"
                                value={endereco.cidade}
                                onChange={(e) =>
                                    setEndereco({ ...endereco, cidade: e.target.value })
                                }
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none focus:border-[#718879]"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-sm font-medium">UF *</label>
                            <input
                                name="uf"
                                type="text"
                                required
                                maxLength={2}
                                placeholder="RJ"
                                value={endereco.uf}
                                onChange={(e) =>
                                    setEndereco({
                                        ...endereco,
                                        uf: e.target.value.toUpperCase(),
                                    })
                                }
                                className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm uppercase outline-none focus:border-[#718879]"
                            />
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-[#6B7280]">
                        * Campos obrigatórios.
                    </p>
                </div>

                <div className="flex justify-end gap-3 border-t border-[#E7E5DF] pt-5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-[#E7E5DF] px-5 py-2.5 text-sm font-medium text-[#343A40] hover:bg-[#FAF9F6]"
                    >
                        Cancelar
                    </button>

                    <button
                        type="submit"
                        disabled={salvando || buscandoCep}
                        className="rounded-lg bg-[#718879] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#5D7165] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {salvando ? "Cadastrando..." : "Cadastrar tutor"}
                    </button>
                </div>
            </form>
        </section>
    );
}
