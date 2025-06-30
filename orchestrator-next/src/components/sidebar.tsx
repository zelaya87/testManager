"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Home, Play, Settings, BarChart } from "lucide-react";

const routes = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "Karate",
    icon: Play,
    href: "/dashboard/karate",
    color: "text-violet-500",
  },
  {
    label: "Gatling",
    icon: Play,
    href: "/dashboard/gatling",
    color: "text-pink-700",
  },
  {
    label: "Insights",
    icon: BarChart,
    href: "/dashboard/insights",
    color: "text-emerald-500",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/dashboard/settings",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
      <div className="px-3 py-2 flex-1">
        <Link href="/dashboard" className="flex items-center pl-3 mb-14">
          <h1 className="text-2xl font-bold">Test Manager</h1>
        </Link>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link key={route.href} href={route.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start pl-6 mb-1",
                  pathname === route.href
                    ? "bg-white/10 text-white"
                    : "text-zinc-400"
                )}
              >
                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                {route.label}
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
