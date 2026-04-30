"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { signUp } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (isLogin) {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
      }
    } else {
      try {
        await signUp(formData);
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });
        if (result?.error) {
          setError("Account created but failed to login automatically");
        } else {
          const role = formData.get("role") as string;
          if (role === "coach") {
            router.push("/coach/dashboard");
          } else {
            router.push("/onboarding");
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
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
                className="w-full p-2 rounded-md border border-border bg-muted text-foreground"
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
              className="w-full p-2 rounded-md border border-border bg-muted text-foreground"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full p-2 rounded-md border border-border bg-muted text-foreground"
              placeholder="••••••••"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">I am a...</label>
              <select name="role" className="w-full p-2 rounded-md border border-border bg-muted text-foreground">
                <option value="player">Player</option>
                <option value="coach">Coach</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:opacity-90 transition-colors"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        {isLogin && (
          <div className="space-y-3 pt-4 border-t border-border">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Demo Access</p>
            <div className="grid grid-cols-3 gap-2">
              <button 
                onClick={() => signIn("credentials", { email: "player@example.com", password: "password123", callbackUrl: "/dashboard" })}
                className="text-[10px] font-black py-2 px-1 bg-primary text-primary-foreground border border-primary rounded-lg hover:opacity-90 transition-colors"
              >
                Player
              </button>
              <button 
                onClick={() => signIn("credentials", { email: "coach@example.com", password: "password123", callbackUrl: "/coach/dashboard" })}
                className="text-[10px] font-black py-2 px-1 bg-primary text-primary-foreground border border-primary rounded-lg hover:opacity-90 transition-colors"
              >
                Coach
              </button>
              <button 
                onClick={() => signIn("credentials", { email: "admin@example.com", password: "password123", callbackUrl: "/admin" })}
                className="text-[10px] font-black py-2 px-1 bg-primary text-primary-foreground border border-primary rounded-lg hover:opacity-90 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-4">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:underline text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
