import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string, href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2 group", className)}>
      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
        <Image
          src="/logo.png"
          alt="Practice With Purpose Logo"
          fill
          className="object-contain"
          priority
        />
      </div>
      <span className="font-black text-lg sm:text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
        Practice<span className="text-primary group-hover:text-foreground">WithPurpose</span>
      </span>
    </Link>
  );
}
