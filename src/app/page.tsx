import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
      <main className="max-w-2xl bg-white p-12 rounded-2xl shadow-sm border border-zinc-200">
        <h1 className="text-4xl font-bold text-zinc-900 mb-4">
          Daily Check-In
        </h1>
        <p className="text-lg text-zinc-600 mb-8">
          A private, repeatable check-in process for athletes to set goals and track readiness.
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50">
            <h2 className="font-semibold text-zinc-800">For Players</h2>
            <p className="text-sm text-zinc-500">Submit daily goals and readiness ratings.</p>
          </div>
          <div className="p-4 border border-zinc-100 rounded-xl bg-zinc-50">
            <h2 className="font-semibold text-zinc-800">For Coaches</h2>
            <p className="text-sm text-zinc-500">Track team trends and individual athlete readiness.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/DOCS.md" 
            className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
          >
            View Documentation
          </Link>
          <Link 
            href="/CHECKLIST.md" 
            className="px-6 py-3 border border-zinc-300 text-zinc-700 rounded-lg font-medium hover:bg-zinc-50 transition-colors"
          >
            Project Checklist
          </Link>
        </div>
      </main>
      <footer className="mt-8 text-zinc-400 text-sm">
        Next.js + Tailwind CSS + Turso + Drizzle
      </footer>
    </div>
  );
}
