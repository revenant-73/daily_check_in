"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { signUp } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
      const formData = new FormData(e.currentTarget);
    const email = (formData.get("email") as string).trim().toLowerCase();
    const password = formData.get("password") as string;

    if (isLogin) {
      setLoading(true);
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
      } else {
        router.push("/dashboard");
      }
    } else {
      setLoading(true);
      try {
        await signUp(formData);
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("Account created but failed to login automatically");
          setLoading(false);
        } else {
          router.push("/onboarding");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 dark">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-lg border border-border">
        <div className="flex flex-col items-center text-center">
          <Logo className="mb-6 scale-110" />
          <h1 className="text-3xl font-bold text-foreground">{isLogin ? "Welcome Back" : "Create Account"}</h1>
          <p className="text-muted-foreground mt-2">
            {isLogin ? "Sign in to your account" : "Join a team and start tracking"}
          </p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Full Name</label>
              <input
                name="name"
                type="text"
                required
                disabled={loading}
                className="min-h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-foreground disabled:opacity-50"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
            <input
              name="email"
              type="email"
              required
              disabled={loading}
              className="min-h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-foreground disabled:opacity-50"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <input
              name="password"
              type="password"
              required
              disabled={loading}
              className="min-h-11 w-full rounded-md border border-border bg-muted px-3 py-2 text-foreground disabled:opacity-50"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : (isLogin ? "Sign In" : "Sign Up")}
          </button>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="min-h-11 rounded-lg px-3 text-sm text-primary hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
