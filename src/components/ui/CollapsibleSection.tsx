"use client";

import { ReactNode, useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: string;
  count?: number;
  description?: string;
  defaultOpenDesktop?: boolean;
  defaultOpenMobile?: boolean;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
  children: ReactNode;
}

export function CollapsibleSection({
  title,
  count,
  description,
  defaultOpenDesktop = true,
  defaultOpenMobile = false,
  className,
  summaryClassName,
  contentClassName,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpenDesktop);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const syncOpenState = () => {
      setOpen(mediaQuery.matches ? defaultOpenDesktop : defaultOpenMobile);
    };

    syncOpenState();
    mediaQuery.addEventListener("change", syncOpenState);

    return () => mediaQuery.removeEventListener("change", syncOpenState);
  }, [defaultOpenDesktop, defaultOpenMobile]);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className={cn("group", className)}
    >
      <summary
        className={cn(
          "flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background [&::-webkit-details-marker]:hidden",
          summaryClassName
        )}
      >
        <div className="min-w-0">
          <h3 className="truncate text-sm font-black uppercase tracking-widest text-foreground sm:text-xl">
            {title}
            {typeof count === "number" && (
              <span className="text-muted-foreground"> ({count})</span>
            )}
          </h3>
          {description && (
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
      </summary>
      <div className={contentClassName}>{children}</div>
    </details>
  );
}
