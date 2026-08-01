"use client";

import * as React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-900 group-[.toaster]:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.18)] group-[.toaster]:rounded-xl group-[.toaster]:border-0",
          description: "group-[.toast]:text-zinc-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
