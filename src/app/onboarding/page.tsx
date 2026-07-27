import { auth } from "@/auth";
import { JoinByCodeForm } from "@/components/player/JoinByCodeForm";
import { Logo } from "@/components/ui/Logo";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function OnboardingPage(props: {
  searchParams: Promise<{ code?: string }>;
}) {
  const searchParams = await props.searchParams;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
  });

  if (dbUser?.teamId || dbUser?.role === "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 dark">
      <header className="fixed top-0 left-0 right-0 p-6 flex justify-between items-center">
        <Logo />
        <Link
          href="/api/auth/signout"
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-bold transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </Link>
      </header>

      <div className="w-full max-w-md space-y-4">
        <JoinByCodeForm initialCode={searchParams.code} />
        <p className="text-center text-xs text-muted-foreground">
          Ask your coach or program administrator for your team&apos;s player or coach invite code.
        </p>
      </div>
    </div>
  );
}
