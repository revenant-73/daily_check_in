"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { signUp } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 bg-card p-8 rounded-2xl shadow-lg border border-border">
        <div className="text-center">
          <h1 className="text-3xl font-bold">{isLogin ? "Welcome Back" : "Create Account"}</h1>
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
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                name="name"
                type="text"
                required
                className="w-full p-2 rounded-md border border-input bg-background"
                placeholder="John Doe"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              className="w-full p-2 rounded-md border border-input bg-background"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full p-2 rounded-md border border-input bg-background"
              placeholder="••••••••"
            />
          </div>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">I am a...</label>
              <select name="role" className="w-full p-2 rounded-md border border-input bg-background">
                <option value="player">Player</option>
                <option value="coach">Coach</option>
              </select>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded-md font-semibold hover:opacity-90 transition-opacity"
          >
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

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
