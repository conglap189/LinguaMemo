"use client"

import {
  ChevronRight,
  Shield,
  Bell,
  HelpCircle,
  LogOut,
  Edit3,
} from "lucide-react"
import { NavBar } from "@/components/finance/nav-bar"

interface ProfileScreenProps {
  onNavChange: (tab: string) => void
  activeTab: string
  hideNavBar?: boolean
}

const menuItems = [
  { icon: Edit3, label: "Edit Profile", sub: "Update your personal info" },
  { icon: Shield, label: "Security & Privacy", sub: "Password, 2FA, biometrics" },
  { icon: Bell, label: "Notifications", sub: "Manage your alerts" },
  { icon: HelpCircle, label: "Help & Support", sub: "FAQs and contact us" },
  { icon: LogOut, label: "Sign Out", sub: "Log out of your account", danger: true },
]

const stats = [
  { label: "Total Spent", value: "$12,480" },
  { label: "Transactions", value: "284" },
  { label: "Saved", value: "$3,200" },
]

export function ProfileScreen({ onNavChange, activeTab, hideNavBar }: ProfileScreenProps) {
  return (
    <div className="flex flex-col h-full bg-cream overflow-hidden">
      <div className="flex-1 overflow-y-auto pb-2">
        {/* Profile Hero */}
        <div className="flex flex-col items-center gap-3 px-5 pt-6 pb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden ring-4 ring-lime">
              <img src="/images/onboarding-hero.jpg" alt="Alex Piter" className="w-full h-full object-cover object-top" draggable={false} />
            </div>
            <button className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-lime flex items-center justify-center shadow-sm">
              <Edit3 size={12} className="text-forest" />
            </button>
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-forest">Alex Piter</p>
            <p className="text-xs text-muted-foreground">alex.piter@email.com</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="mx-4 mb-4 bg-forest rounded-3xl p-4 flex justify-around">
          {stats.map((s, i) => (
            <div key={s.label} className={`flex flex-col items-center gap-0.5 ${i < stats.length - 1 ? "border-r border-white/10 pr-4 mr-4" : ""}`}>
              <p className="text-base font-extrabold text-lime">{s.value}</p>
              <p className="text-[9px] text-white/60">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Menu */}
        <div className="mx-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-3.5 shadow-sm"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.danger ? "bg-red-50" : "bg-cream"}`}>
                  <Icon size={16} className={item.danger ? "text-red-500" : "text-forest"} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-sm font-semibold ${item.danger ? "text-red-500" : "text-forest"}`}>{item.label}</p>
                  <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                </div>
                {!item.danger && <ChevronRight size={16} className="text-muted-foreground" />}
              </button>
            )
          })}
        </div>

      </div>

      {!hideNavBar && <NavBar activeTab={activeTab} onNavChange={onNavChange} />}
    </div>
  )
}
