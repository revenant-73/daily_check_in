import { CheckInForm } from "@/components/player/CheckInForm";

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 dark">
      <div className="w-full max-w-md">
        <CheckInForm />
      </div>
    </div>
  );
}
