import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-[10px] border border-[var(--line)] bg-[var(--surface)] px-3.5 py-2 text-sm text-[var(--ink)] transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-zinc-400 hover:border-[#b7aa9b] hover:bg-white focus:border-[var(--action)] focus:outline-none focus:ring-4 focus:ring-[var(--action)]/[0.12] disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
