
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(false);

    async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        setErro("");
        setCarregando(true);

        try {
            const resposta = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    senha,
                }),
            });

            const dados = await resposta.json();

            if (!resposta.ok) {
                setErro(dados.mensagem || "Não foi possível realizar o login.");
                return;
            }

            router.push("/");
            router.refresh();

        } catch {
            setErro("Não foi possível conectar ao servidor.");

        } finally {
            setCarregando(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#FAF9F6] px-4 py-8">
            <section className="w-full max-w-md rounded-2xl border border-[#E7E5DF] bg-white p-8 shadow-sm">
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#718879] text-2xl font-bold text-white">
                        CV
                    </div>

                    <h1 className="text-2xl font-bold text-[#343A40]">
                        Clínica Veterinária
                    </h1>

                    <p className="mt-2 text-sm text-[#6B7280]">
                        Sistema de Gestão Veterinária
                    </p>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-[#343A40]">
                        Bem-vindo!
                    </h2>

                    <p className="mt-1 text-sm text-[#6B7280]">
                        Entre com suas credenciais para acessar o sistema.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-2 block text-sm font-medium text-[#343A40]"
                        >
                            E-mail
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="seu@email.com"
                            required
                            className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none transition focus:border-[#718879] focus:ring-2 focus:ring-[#718879]/20"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="senha"
                            className="mb-2 block text-sm font-medium text-[#343A40]"
                        >
                            Senha
                        </label>

                        <input
                            id="senha"
                            type="password"
                            value={senha}
                            onChange={(event) => setSenha(event.target.value)}
                            placeholder="Digite sua senha"
                            required
                            className="w-full rounded-lg border border-[#E7E5DF] px-4 py-3 text-sm outline-none transition focus:border-[#718879] focus:ring-2 focus:ring-[#718879]/20"
                        />
                    </div>

                    {erro && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            {erro}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={carregando}
                        className="w-full rounded-lg bg-[#718879] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#5D7165] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {carregando ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-[#6B7280]">
                    Acesso exclusivo para veterinários autorizados.
                </p>
            </section>
        </main>
    );
}

