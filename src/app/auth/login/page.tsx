import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Link href="/">
            <span
              className="text-2xl font-light tracking-[0.15em] text-[#F5F0E8] uppercase"
              style={{ fontFamily: "Cormorant Garamond, Georgia, serif" }}
            >
              Stratum
            </span>
          </Link>
          <p className="text-xs text-[#4A4640] font-body mt-2 tracking-wider uppercase">
            Sign in to continue
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-[#161616] border border-[#1F1F1F] rounded-[6px] p-7 h-64 animate-pulse" />
          }
        >
          <LoginForm />
        </Suspense>

        <p className="text-center text-xs text-[#4A4640] font-body mt-5">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-[#8A8578] hover:text-[#F5F0E8] transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
