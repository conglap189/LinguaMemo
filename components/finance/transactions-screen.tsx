"use client"

import { ChevronLeft, Bell, ChevronDown } from "lucide-react"
import { NavBar } from "@/components/finance/nav-bar"

interface TransactionsScreenProps {
  onNavChange: (tab: string) => void
  activeTab: string
  onBack?: () => void
  hideNavBar?: boolean
}

const transactions = [
  { id: 1, name: "Amazon", date: "February 15, 2026", amount: -80, category: "Shopping", icon: "A", iconBg: "#1a1a1a", iconColor: "white" },
  { id: 2, name: "Bank Transfer", date: "February 10, 2026", amount: 700, category: "Income", icon: "B", iconBg: "#1B3A2D", iconColor: "white" },
  { id: 3, name: "McDonald's", date: "Jan 7, 2026", amount: 5, category: "Payment", icon: "M", iconBg: "#DA291C", iconColor: "white" },
  { id: 4, name: "Netflix Subscription", date: "Jan 05, 2026", amount: -25, category: "Subscription", icon: "N", iconBg: "#1a1a1a", iconColor: "#E50914" },
  { id: 5, name: "Spotify", date: "Jan 01, 2026", amount: -10, category: "Subscription", icon: "S", iconBg: "#1DB954", iconColor: "white" },
  { id: 6, name: "Salary", date: "Dec 31, 2025", amount: 3200, category: "Income", icon: "S", iconBg: "#1B3A2D", iconColor: "#C8E63A" },
]

const monthlyData = [
  { month: "Jan", height: 45 },
  { month: "Feb", height: 25 },
  { month: "Mar", height: 55 },
  { month: "Apr", height: 70 },
  { month: "May", height: 50 },
  { month: "June", height: 65 },
]

export function TransactionsScreen({ onNavChange, activeTab, onBack, hideNavBar }: TransactionsScreenProps) {
  return (
    <div className="flex flex-col h-full bg-cream overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <button
          onClick={() => onBack ? onBack() : onNavChange("home")}
          className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center shadow-sm"
        >
          <ChevronLeft size={18} className="text-forest" />
        </button>
        <h1 className="text-base font-bold text-forest">Transactions</h1>
        <button className="relative w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
          <Bell size={16} className="text-forest" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4 scrollbar-hide">
        {/* Income Chart Card */}
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: "#C8E63A" }}>
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-0.5">
              <h2 className="text-xl font-bold text-forest">Income by</h2>
              <button className="flex items-center gap-1 bg-white/30 rounded-full px-3 py-1.5 text-xs font-semibold text-forest">
                Monthly <ChevronDown size={12} />
              </button>
            </div>
            <p className="text-xs text-forest/70 mb-3">Viewing last 6 months chart</p>
            <div className="bg-white/25 rounded-2xl p-3 grid grid-cols-2 gap-2 mb-4">
              <div>
                <p className="text-[10px] text-forest/70 mb-0.5">Total Income</p>
                <p className="text-lg font-bold text-forest">$2,635.00</p>
              </div>
              <div className="border-l border-forest/20 pl-3">
                <p className="text-[10px] text-forest/70 mb-0.5">Total Spendings</p>
                <p className="text-lg font-bold text-forest">$780.50</p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 pb-1">
              {monthlyData.map((item) => (
                <div key={item.month} className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className="w-full rounded-full"
                    style={{
                      height: `${item.height}px`,
                      backgroundColor: item.month === "Apr" ? "#1B3A2D" : "#1B3A2Daa",
                    }}
                  />
                  <span className="text-[9px] font-medium text-forest/80">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-forest">Recent Transactions</h3>
            <button className="flex items-center gap-1 text-xs font-semibold text-forest">
              See All <ChevronDown size={12} className="-rotate-90" />
            </button>
          </div>
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 bg-white rounded-2xl p-3 shadow-sm">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0"
                  style={{ backgroundColor: tx.iconBg, color: tx.iconColor }}
                >
                  {tx.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-forest truncate">{tx.name}</p>
                  <p className="text-xs text-muted-foreground">{tx.date}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{tx.category}</p>
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
