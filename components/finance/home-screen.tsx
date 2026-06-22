"use client"

import {
  Bell,
  Eye,
  EyeOff,
  Plus,
  ArrowUpRight,
  Download,
  ChevronRight,
  ArrowLeftRight,
  CreditCard,
} from "lucide-react"
import { useState } from "react"
import { NavBar } from "@/components/finance/nav-bar"

interface HomeScreenProps {
  onNavChange: (tab: string) => void
  activeTab: string
  hideNavBar?: boolean
}

const contacts = [
  { id: 0, name: "Add", isAdd: true },
  { id: 1, name: "Jane", initials: "JA", color: "#C8E63A", textColor: "#1B3A2D" },
  { id: 2, name: "Kristin", initials: "KR", color: "#1B3A2D", textColor: "#ffffff" },
  { id: 3, name: "Hawkins", initials: "HW", color: "#8B5CF6", textColor: "#ffffff" },
  { id: 4, name: "Darlene", initials: "DA", color: "#F59E0B", textColor: "#ffffff" },
  { id: 5, name: "Sam", initials: "SM", color: "#EC4899", textColor: "#ffffff" },
]

const recentTx = [
  { id: 1, name: "Amazon", date: "Feb 15", amount: -80, category: "Shopping", icon: "A", iconBg: "#1a1a1a", iconColor: "white" },
  { id: 2, name: "Bank Transfer", date: "Feb 10", amount: 700, category: "Income", icon: "B", iconBg: "#1B3A2D", iconColor: "white" },
  { id: 3, name: "Netflix", date: "Jan 5", amount: -25, category: "Subscription", icon: "N", iconBg: "#1a1a1a", iconColor: "#E50914" },
]

export function HomeScreen({ onNavChange, activeTab, hideNavBar }: HomeScreenProps) {
  const [balanceVisible, setBalanceVisible] = useState(true)

  return (
    <div className="flex flex-col h-full bg-cream overflow-hidden">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 space-y-4 pb-2 scrollbar-hide">
        {/* Profile Row */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full overflow-hidden" style={{ outline: "2px solid var(--lime)", outlineOffset: "2px" }}>
              <img src="/images/onboarding-hero.jpg" alt="Alex Piter" className="w-full h-full object-cover object-top" draggable={false} />
            </div>
            <span className="font-bold text-forest text-sm">Alex Piter</span>
          </div>
          <button className="relative w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
            <Bell size={16} className="text-forest" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
        </div>

        {/* Balance */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Total Balance</p>
            <p className="text-3xl font-extrabold text-forest tracking-tight">
              {balanceVisible ? "$45,000.00" : "••••••••"}
            </p>
          </div>
          <button onClick={() => setBalanceVisible(!balanceVisible)} className="mb-1">
            {balanceVisible
              ? <Eye size={18} className="text-muted-foreground" />
              : <EyeOff size={18} className="text-muted-foreground" />
            }
          </button>
        </div>

        {/* Cards Carousel */}
        <div className="flex gap-3 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
          <div className="flex-shrink-0 w-8 flex items-center">
            <button className="w-8 h-8 rounded-full bg-white border-2 border-dashed border-border flex items-center justify-center">
              <Plus size={14} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex-shrink-0 w-56 rounded-3xl p-4 snap-start" style={{ background: "linear-gradient(135deg, #c8e63a 0%, #b5d42a 100%)" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold text-forest">Debit</span>
              <span className="font-black text-lg text-forest tracking-tight">VISA</span>
            </div>
            <div className="grid grid-cols-2 gap-0.5 w-8 mb-4">
              {[0,1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-sm bg-forest/80" />)}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] text-forest/70 mb-0.5">Card Number</p>
                <p className="text-[11px] font-bold text-forest tracking-widest">•••• •••• •••• 5690</p>
              </div>
              <div>
                <p className="text-[9px] text-forest/70 mb-0.5">Valid</p>
                <p className="text-[11px] font-bold text-forest">07/30</p>
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 w-56 rounded-3xl p-4 snap-start" style={{ background: "linear-gradient(135deg, #1B3A2D 0%, #2d5c44 100%)" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-bold text-white/80">Debit</span>
              <span className="font-black text-lg text-white tracking-tight">VISA</span>
            </div>
            <div className="grid grid-cols-2 gap-0.5 w-8 mb-4">
              {[0,1,2,3].map(i => <div key={i} className="w-2 h-2 rounded-sm bg-white/60" />)}
            </div>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] text-white/60 mb-0.5">Card Number</p>
                <p className="text-[11px] font-bold text-white tracking-widest">•••• •••• •••• 3421</p>
              </div>
              <div>
                <p className="text-[9px] text-white/60 mb-0.5">Valid</p>
                <p className="text-[11px] font-bold text-white">12/28</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-around">
          {[
            { icon: <Download size={18} className="text-forest" />, label: "Top Up" },
            { icon: <ArrowUpRight size={18} className="text-forest" />, label: "Send" },
            { icon: <CreditCard size={18} className="text-forest" />, label: "Pay" },
            { icon: <ArrowLeftRight size={18} className="text-forest" />, label: "Transfer" },
          ].map((action) => (
            <button key={action.label} className="flex flex-col items-center gap-1.5">
              <div className="w-12 h-12 rounded-2xl bg-white border border-border shadow-sm flex items-center justify-center">
                {action.icon}
              </div>
              <span className="text-[10px] font-medium text-forest">{action.label}</span>
            </button>
          ))}
        </div>

        {/* Connect Card Banner */}
        <div className="flex items-center gap-3 bg-cream-dark rounded-2xl p-3 border border-border">
          <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center flex-shrink-0">
            <CreditCard size={18} style={{ color: "var(--lime)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-forest">Connect Your Card</p>
            <p className="text-[10px] text-muted-foreground">The smarter way to pay your money</p>
          </div>
          <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />
        </div>

        {/* Quick Send */}
        <div>
          <h3 className="text-sm font-bold text-forest mb-3">Quick Send</h3>
          <div className="flex gap-4 overflow-x-auto pb-1 scrollbar-hide">
            {contacts.map((c) => (
              <button key={c.id} className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {c.isAdd ? (
                  <div className="w-11 h-11 rounded-full border-2 border-dashed border-border flex items-center justify-center bg-white">
                    <Plus size={16} className="text-muted-foreground" />
                  </div>
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: c.color, color: c.textColor }}
                  >
                    {c.initials}
                  </div>
                )}
                <span className="text-[10px] font-medium text-muted-foreground">{c.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Transactions */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-forest">Today, Dec 25</p>
            <button
              onClick={() => onNavChange("transactions")}
              className="flex items-center gap-1 text-[10px] font-semibold text-forest"
            >
              All transactions <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: tx.iconBg, color: tx.iconColor }}
                >
                  {tx.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-forest truncate">{tx.name}</p>
                  <p className="text-[10px] text-muted-foreground">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{tx.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {!hideNavBar && <NavBar activeTab={activeTab} onNavChange={onNavChange} />}
    </div>
  )
}
