"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const navItems = [
  { href: "/dashboard", label: "Inicio", icon: "home" as keyof typeof Icons },
  { href: "/dashboard/empresas", label: "Empresas", icon: "companies" as keyof typeof Icons },
  { href: "/dashboard/ofertas", label: "Ofertas", icon: "offers" as keyof typeof Icons },
  { href: "/dashboard/candidatos", label: "Candidatos", icon: "candidates" as keyof typeof Icons },
  { href: "/dashboard/documentos", label: "Documentos", icon: "documents" as keyof typeof Icons },
  { href: "/dashboard/entrevistas", label: "Entrevistas IA", icon: "chat" as keyof typeof Icons },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <TooltipProvider>
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
        <Link
          href="#"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Icons.home className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">HR AI Platform</span>
        </Link>
        {navItems.map((item) => {
          const Icon = Icons[item.icon]
          const isActive = pathname === item.href
          return (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8",
                    isActive && "bg-accent text-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="sr-only">{item.label}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
