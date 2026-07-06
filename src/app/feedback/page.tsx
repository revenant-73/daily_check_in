import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { FeedbackForm } from "@/components/player/FeedbackForm";

export default async function FeedbackPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col dark">
      <Header 
        userName={session.user.name} 
        role={session.user.role} 
        href="/dashboard"
      />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6">
        <div className="space-y-2 text-center py-8">
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">Player Feedback</h1>
          <p className="text-muted-foreground font-bold">Help us improve the Daily Check-In experience.</p>
        </div>

        <FeedbackForm />
      </main>
    </div>
  );
}
