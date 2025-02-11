// app/dashboard/unternehmen/verify-billing/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function VerifyBilling() {
    const [status, setStatus] = useState("Verifiziere...");
    const searchParams = useSearchParams();
    const router = useRouter();
    const { data: session } = useSession();
    const token = searchParams.get("token");
    // Ref um zu tracken ob die Verifizierung bereits läuft
    const isVerifying = useRef(false);

    useEffect(() => {
        if (!token) {
            setStatus("Ungültiger Token.");
            return;
        }

        async function verifyBilling() {
            // Verhindere doppelte Ausführung
            if (isVerifying.current) return;
            isVerifying.current = true;

            try {
                // Wenn User eingeloggt ist, ausloggen
                if (session?.user) {
                    await signOut({ redirect: false });
                }

                const res = await fetch("/api/billing/verify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });

                if (res.ok) {
                    setStatus("Erfolgreich verifiziert! Sie werden zum Login weitergeleitet...");
                    setTimeout(() => router.push("/auth/login"), 3000);
                } else {
                    const error = await res.json();
                    setStatus(error.message || "Fehler bei der Verifizierung.");
                }
            } catch (error) {
                setStatus("Netzwerkfehler. Bitte erneut versuchen.");
            }
        }

        verifyBilling();
    }, [token, router, session]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                        Rechnungsempfänger Verifizierung
                    </h2>
                    <div className="mt-4">
                        <p className="text-lg text-gray-700">
                            {status}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}