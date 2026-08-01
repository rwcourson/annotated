import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-[transform,background-color,color,box-shadow,border-color,opacity] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--action)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--canvas)] disabled:pointer-events-none disabled:opacity-50 active:scale-[0.96] [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_.lucide-arrow-right]:transition-transform [&_.lucide-arrow-up-right]:transition-transform hover:[&_.lucide-arrow-right]:translate-x-1 hover:[&_.lucide-arrow-up-right]:translate-x-0.5 hover:[&_.lucide-arrow-up-right]:-translate-y-0.5",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--ink)] text-white shadow-[0_10px_28px_-18px_rgba(24,22,22,.65)] hover:-translate-y-0.5 hover:bg-[#34302f] hover:shadow-[0_16px_34px_-18px_rgba(24,22,22,.72)]",
        warm: "bg-[var(--action)] text-white shadow-[0_10px_24px_-18px_rgba(217,74,54,.7)] hover:-translate-y-0.5 hover:bg-[var(--action-dark)] hover:shadow-[0_16px_32px_-17px_rgba(217,74,54,.72)]",
        destructive:
          "bg-red-600 text-white shadow-sm hover:bg-red-500",
        outline:
          "border border-[var(--line)] bg-white text-[var(--ink)] shadow-[0_8px_24px_-22px_rgba(24,22,22,.5)] hover:-translate-y-0.5 hover:border-[rgba(29,27,26,.32)] hover:bg-[#fcfaf8] hover:shadow-[0_14px_30px_-20px_rgba(24,22,22,.4)]",
        secondary:
          "bg-[var(--soft)] text-[var(--ink)] hover:-translate-y-px hover:bg-[#e9e4e0] hover:shadow-[0_10px_22px_-19px_rgba(24,22,22,.42)]",
        ghost: "text-[var(--muted-ink)] hover:bg-white/90 hover:text-[var(--ink)] hover:shadow-[0_7px_18px_-17px_rgba(24,22,22,.48)]",
        link: "text-[var(--ink)] underline decoration-transparent underline-offset-4 hover:decoration-[var(--action)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-[15px]",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
