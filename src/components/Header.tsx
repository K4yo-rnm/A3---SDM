
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
    title: string;
}

export default function Header({ title }: HeaderProps) {
    const router = useRouter();
    const [saindo, setSaindo] = useState(false);
    const [erro, setErro] = useState("");

    const currentDate = new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "America/Sao_Paulo",
    }).format(new Date());

    async function handleLogout() {
        setSaindo(true);
        setErro("");

        try {
            const resposta = await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });

            if (!resposta.ok) {
                throw new Error("Não foi possível encerrar a sessão.");
            }

            router.replace("/login");
            router.refresh();
        } catch {
            setErro("Erro ao sair. Tente novamente.");
            setSaindo(false);
        }
    }

    return (
        <header className="flex flex-col gap-4 border-b border-[#E7E5DF] bg-white px-8 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-xl font-bold text-[#343A40]">
                    {title}
                </h1>

                <p className="mt-1 text-sm text-[#6B7280]">
                    Sistema de Gestão Veterinária
                </p>
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium text-[#343A40]">
                        {currentDate}
                    </p>

                    <p className="text-xs text-[#6B7280]">
                        Área profissional
                    </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#718879] font-semibold text-white">
                    V
                </div>

                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={saindo}
                    className="rounded-lg border border-[#E7E5DF] px-4 py-2 text-sm font-medium text-[#343A40] transition hover:bg-[#FAF9F6] disabled:opacity-60"
                >
                    {saindo ? "Saindo..." : "Sair"}
                </button>
            </div>

            {erro && (
                <p className="text-sm text-red-600">
                    {erro}
                </p>
            )}
        </header>
    );
}


