
"use client";

import { useState } from "react";

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

interface ListaTutoresProps {
    tutores: Tutor[];
    onEditar: (tutor: Tutor) => void;
    onInativar: (tutor: Tutor) => void;
}

export default function ListaTutores({
    tutores,
    onEditar,
    onInativar,
}: ListaTutoresProps) {
    const [pesquisa, setPesquisa] = useState("");

    function formatarCPF(cpf: string) {
        const numero = cpf.replace(/\D/g, "");

        if (numero.length !== 11) return cpf;

        return numero.replace(
            /^(\d{3})(\d{3})(\d{3})(\d{2})$/,
            "$1.$2.$3-$4"
        );
    }

    function formatarTelefone(telefone: string | null) {
        if (!telefone) return "Não informado";

        const numero = telefone.replace(/\D/g, "");

        if (numero.length === 11) {
            return numero.replace(
                /^(\d{2})(\d{5})(\d{4})$/,
                "($1) $2-$3"
            );
        }

        if (numero.length === 10) {
            return numero.replace(
                /^(\d{2})(\d{4})(\d{4})$/,
                "($1) $2-$3"
            );
        }

        return telefone;
    }

    function enderecoPrincipal(tutor: Tutor) {
        const endereco = tutor.enderecos?.[0];

        if (!endereco) return "Endereço não informado";

        return `${endereco.logradouro}, ${endereco.numero} - ${endereco.bairro}, ${endereco.cidade}/${endereco.uf}`;
    }

    
    const tutoresFiltrados = tutores.filter((tutor) =>
        tutor.nome_completo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(pesquisa.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase()) ||
        tutor.cpf.replace(/\D/g, "").includes(pesquisa.replace(/\D/g, "")) && pesquisa.replace(/\D/g, "").length > 0
    );

    return (
        <>
            <div className="border-b border-[#E7E5DF] p-4">
                <input
                    type="text"
                    value={pesquisa}
                    onChange={(event) => setPesquisa(event.target.value)}
                    placeholder="Pesquisar tutor por nome ou CPF..."
                    className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none transition focus:border-[#718879]"
                />

                <p className="mt-2 text-xs text-[#6B7280]">
                    {tutoresFiltrados.length} tutor(es) encontrado(s)
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-212.5 text-left text-sm">
                    <thead className="bg-[#FAF9F6] text-xs uppercase text-[#6B7280]">
                        <tr>
                            <th className="px-6 py-4 font-semibold">Tutor</th>
                            <th className="px-6 py-4 font-semibold">CPF</th>
                            <th className="px-6 py-4 font-semibold">Telefone</th>
                            <th className="px-6 py-4 font-semibold">Endereço</th>
                            <th className="px-6 py-4 font-semibold">Situação</th>
                            <th className="px-6 py-4 font-semibold">Ações</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[#E7E5DF]">
                        {tutoresFiltrados.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-6 py-10 text-center text-sm text-[#6B7280]"
                                >
                                    Nenhum tutor encontrado.
                                </td>
                            </tr>
                        ) : (
                            tutoresFiltrados.map((tutor) => (
                                <tr
                                    key={tutor.id_tutor}
                                    className="transition hover:bg-[#FAF9F6]"
                                >
                                    <td className="px-6 py-4">
                                        <p className="font-medium text-[#343A40]">
                                            {tutor.nome_completo}
                                        </p>

                                        <p className="mt-1 text-xs text-[#6B7280]">
                                            {tutor.email || "E-mail não informado"}
                                        </p>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-[#343A40]">
                                        {formatarCPF(tutor.cpf)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4 text-[#343A40]">
                                        {formatarTelefone(tutor.telefone)}
                                    </td>

                                    <td className="max-w-xs px-6 py-4 text-[#6B7280]">
                                        {enderecoPrincipal(tutor)}
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span
                                            className={`rounded-full px-3 py-1 text-xs font-medium ${tutor.situacao === "ATIVO"
                                                    ? "bg-[#E8F0EA] text-[#5D7165]"
                                                    : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            {tutor.situacao}
                                        </span>
                                    </td>

                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onEditar(tutor)}
                                                className="rounded-lg border border-[#E7E5DF] px-3 py-2 text-xs font-medium text-[#343A40] transition hover:bg-[#FAF9F6]"
                                            >
                                                Editar
                                            </button>

                                            {tutor.situacao === "ATIVO" && (
                                                <button
                                                    type="button"
                                                    onClick={() => onInativar(tutor)}
                                                    className="rounded-lg border border-red-200 px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                                >
                                                    Inativar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}
