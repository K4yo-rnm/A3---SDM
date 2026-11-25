
import type { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/AuthGuard";

interface AppLayoutProps {
    title: string;
    children: ReactNode;
}

export default function AppLayout({
    title,
    children,
}: AppLayoutProps) {
    return (
        <AuthGuard>
            <main className="flex min-h-screen bg-[#FAF9F6]">
                <Sidebar />

                <div className="min-w-0 flex-1">
                    <Header title={title} />

                    <section className="p-8">
                        {children}
                    </section>
                </div>
            </main>
        </AuthGuard>
    );
}

