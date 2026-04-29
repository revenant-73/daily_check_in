import { CheckInForm } from "@/components/player/CheckInForm";

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <CheckInForm />
      </div>
    </div>
  );
}
