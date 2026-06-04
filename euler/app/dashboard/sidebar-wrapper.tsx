"use client"

import { usePathname } from "next/navigation"
import { DashboardSidebar } from "./sidebar"

type SidebarWrapperProps = {
  user: { name: string; email: string; image: string | null }
  plan: string | null
  billingInterval: string | null
  credits: number
  children: React.ReactNode
}

export function SidebarWrapper({
  user,
  plan,
  billingInterval,
  credits,
  children,
}: SidebarWrapperProps) {
  const pathname = usePathname()
  const isWorkspace = pathname.startsWith("/dashboard/projects/")

  if (isWorkspace) {
    return <>{children}</>
  }

  return (
    <div className="flex h-svh">
      <DashboardSidebar
        user={user}
        plan={plan}
        billingInterval={billingInterval}
        credits={credits}
      />
      <main className="flex-1 overflow-y-auto bg-muted/30">{children}</main>
    </div>
  )
}
