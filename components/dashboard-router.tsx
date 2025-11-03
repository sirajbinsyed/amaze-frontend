"use client"

import { useAuth } from "@/contexts/auth-context"
import { AdminDashboard } from "./dashboards/admin-dashboard"
import { CRMDashboard } from "./dashboards/crm-dashboard"
import { SalesDashboard } from "./dashboards/sales-dashboard"
import { ProjectDashboard } from "./dashboards/project-dashboard"
import { DesignerDashboard } from "./dashboards/designer-dashboard"
import { PrintingDashboard } from "./dashboards/printing-dashboard"
import { LogisticsDashboard } from "./dashboards/logistics-dashboard"
// --- Add new imports here ---
import { HRDashboard } from "./dashboards/hr-dashboard"
import { AccountantDashboard } from "./dashboards/accounts-dashboard"

export function DashboardRouter() {
  const { user } = useAuth()

  if (!user) return null

  switch (user.role) {
    case "admin":
      return <AdminDashboard />
    case "crm":
      return <CRMDashboard />
    case "sales":
      return <SalesDashboard />
    case "project":
      return <ProjectDashboard />
    case "designer":
      return <DesignerDashboard />
    case "printing":
      return <PrintingDashboard />
    case "logistics":
      return <LogisticsDashboard />
    // --- Add new cases here ---
    case "hr":
      return <HRDashboard />
    case "accounts":
      return <AccountantDashboard />
    default:
      return <div>Invalid user role</div>
  }
}