"use client";

import { useTransition } from "react";

interface AutoSubmitSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function AutoSubmitSelect({ children, ...props }: AutoSubmitSelectProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      {...props}
      disabled={isPending || props.disabled}
      className={`${props.className} ${isPending ? "opacity-50 cursor-wait" : ""}`}
      onChange={(e) => {
        const form = e.target.form;
        if (form) {
          startTransition(() => {
            form.requestSubmit();
          });
        }
        if (props.onChange) props.onChange(e);
      }}
    >
      {children}
    </select>
  );
}
