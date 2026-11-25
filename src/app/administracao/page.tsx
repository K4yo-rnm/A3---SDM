"use client";

import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import Veterinario from "@/components/Adm/Veterianrio";
import Integracoes from "@/components/Adm/Integracoes";

const abas = [
    ["veterinarios", "Veterinários"],
    ["integracoes", "Integrações governamentais"],
] as const;

export default function AdministracaoPage() {
    const [aba, setAba] = useState<"veterinarios" | "integracoes">("veterinarios");

    return (
        <AppLayout title="Administração">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#343A40]">
                    Administração do sistema
                </h2>
                <p className="mt-2 text-sm text-[#6B7280]">
                    Gerencie os profissionais e acompanhe as integrações governamentais.
                </p>
            </div>

            <div className="mb-6 flex flex-wrap gap-3">
                {abas.map(([id, nome]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setAba(id)}
                        className={`rounded-lg px-5 py-3 text-sm font-medium transition ${aba === id
                                ? "bg-[#718879] text-white"
                                : "border border-[#E7E5DF] bg-white text-[#343A40] hover:bg-[#FAF9F6]"
                            }`}
                    >
                        {nome}
                    </button>
                ))}
            </div>

            {aba === "veterinarios" ? <Veterinario /> : <Integracoes />}
        </AppLayout>
    );
}



