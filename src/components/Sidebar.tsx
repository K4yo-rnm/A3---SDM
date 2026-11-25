
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const menuItems = [
    { label: "Dashboard", icon: "▦", href: "/" },
    { label: "Tutores", icon: "♙", href: "/tutores" },
    { label: "Animais", icon: "♡", href: "/animais" },
    { label: "Atendimentos", icon: "✚", href: "/atendimentos" },
    { label: "Administração", icon: "⚙", href: "/administracao" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`flex min-h-screen flex-col border-r border-[#E7E5DF] bg-white px-4 py-6 transition-all duration-300 ${collapsed ? "w-20" : "w-64"
                }`}
        >
            <div className="mb-8 flex items-center justify-between">
                {!collapsed && (
                    <div>
                        <h1 className="text-lg font-bold text-[#5D7165]">
                            Clínica Veterinária
                        </h1>
                        <p className="mt-1 text-xs text-[#6B7280]">
                            Sistema de Gestão
                        </p>
                    </div>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-lg px-3 py-2 text-lg text-[#5D7165] hover:bg-[#FAF9F6]"
                    aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
                    title={collapsed ? "Expandir menu" : "Recolher menu"}
                >
                    {collapsed ? "☰" : "←"}
                </button>
            </div>

            <nav className="flex flex-col gap-2">
                {menuItems.map((item) => {
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            title={collapsed ? item.label : undefined}
                            className={`flex items-center gap-3 rounded-lg px-3 py-3 text-left text-sm font-medium transition-colors ${active
                                    ? "bg-[#718879] text-white"
                                    : "text-[#343A40] hover:bg-[#FAF9F6]"
                                } ${collapsed ? "justify-center" : ""}`}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto border-t border-[#E7E5DF] pt-5">
                {!collapsed && (
                    <>
                        <p className="text-xs text-[#6B7280]">
                            Sistema de Gestão Veterinária
                        </p>
                        <p className="mt-1 text-xs text-[#6B7280]">
                            Versão 1.0
                        </p>
                    </>
                )}
            </div>
        </aside>
    );
}


