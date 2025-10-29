import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/hooks/useAuth";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-[lightslategrey] text-gray-900">
        <Navbar />
        <main className="p-6">
          <Component {...pageProps} />
        </main>
      </div>
    </AuthProvider>
  );
}
