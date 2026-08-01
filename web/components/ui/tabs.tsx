"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

type TabsListProps = React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
  indicatorIndex?: number;
  indicatorCount?: number;
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  TabsListProps
>(({ className, indicatorIndex = 0, indicatorCount = 3, children, style, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    style={{
      ...style,
      "--segment-index": indicatorIndex,
      "--segment-count": indicatorCount,
    } as React.CSSProperties}
    className={cn(
      "segment-list relative inline-flex h-11 items-center justify-center overflow-hidden rounded-full bg-[var(--soft)] p-1 text-[var(--muted-ink)] before:pointer-events-none before:absolute before:bottom-1 before:left-1 before:top-1 before:w-[calc((100%_-_0.5rem)/var(--segment-count))] before:translate-x-[calc(var(--segment-index)*100%)] before:rounded-full before:bg-white before:shadow-[0_6px_18px_-14px_rgba(35,29,26,.55)] before:transition-transform",
      className
    )}
    {...props}
  >
    {children}
  </TabsPrimitive.List>
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative z-10 inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cobalt)] focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:text-[var(--ink)]",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("focus-visible:outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
