
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
    children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const [autenticado, setAutenticado] = useState(false);
    const [verificando, setVerificando] = useState(true);

    useEffect(() => {
        async function verificarSessao() {
            try {
                const resposta = await fetch("/api/auth/me", {
                    method: "GET",
                    credentials: "include",
                    cache: "no-store",
                });

                if (!resposta.ok) {
                    router.replace("/login");
                    return;
                }

                const dados = await resposta.json();

                if (dados.autenticado) {
                    setAutenticado(true);
                } else {
                    router.replace("/login");
                }
            } catch {
                router.replace("/login");
            } finally {
                setVerificando(false);
            }
        }

        verificarSessao();
    }, [router]);

    if (verificando) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6]">
                <p className="text-sm text-[#6B7280]">
                    Verificando autenticação...
                </p>
            </main>
        );
    }

    if (!autenticado) {
        return null;
    }

    return <>{children}</>;
}
