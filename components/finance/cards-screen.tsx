"use client"

import {
  Plus,
  QrCode,
  Home,
  ArrowLeftRight,
  CreditCard,
  User,
  MoreHorizontal,
  Eye,
  EyeOff,
} from "lucide-react"
import { useState } from "react"
import { NavBar } from "@/components/finance/nav-bar"

interface CardsScreenProps {
  onNavChange: (tab: string) => void
  activeTab: string
  hideNavBar?: boolean
}

const cards = [
  {
    id: 1,
    type: "Debit",
    network: "VISA",
    last4: "5690",
    expiry: "07/30",
    balance: 12500,
    gradient: ["#C8E63A", "#b5d42a"],
    textColor: "#1B3A2D",
  },
  {
    id: 2,
    type: "Debit",
    network: "VISA",
    last4: "3421",
    expiry: "12/28",
    balance: 8320.5,
    gradient: ["#1B3A2D", "#2d5c44"],
    textColor: "#ffffff",
  },
  {
    id: 3,
    type: "Credit",
    network: "Mastercard",
    last4: "9017",
    expiry: "03/27",
    balance: 24179.5,
    gradient: ["#2d6070", "#4a8fa8"],
    textColor: "#ffffff",
  },
]

export function CardsScreen({ onNavChange, activeTab, hideNavBar }: CardsScreenProps) {
  const [showBalances, setShowBalances] = useState<Record<number, boolean>>({})

  const toggle = (id: number) =>
    setShowBalances((prev) => ({ ...prev, [id]: !prev[id] }))

  return (
    <div className="flex flex-col h-full bg-cream overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <h1 className="text-xl font-bold text-forest">My Cards</h1>
        <button className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center shadow-sm">
          <Plus size={18} className="text-forest" />
        </button>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 space-y-4">
        {cards.map((card) => (
          <div key={card.id} className="rounded-3xl p-5 space-y-4" style={{ background: `linear-gradient(135deg, ${card.gradient[0]} 0%, ${card.gradient[1]} 100%)` }}>
            {/* Top row */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold opacity-70" style={{ color: card.textColor }}>{card.type}</p>
                <p className="text-lg font-black tracking-tight" style={{ color: card.textColor }}>{card.network}</p>
              </div>
              <button className="opacity-60" style={{ color: card.textColor }}>
                <MoreHorizontal size={20} />
              </button>
            </div>

            {/* Chip */}
            <div className="flex items-center gap-2">
              <div className="grid grid-cols-2 gap-0.5">
                {[0,1,2,3].map(i => (
                  <div key={i} className="w-2.5 h-2 rounded-sm opacity-80" style={{ backgroundColor: card.textColor }} />
                ))}
              </div>
            </div>

            {/* Card Number */}
            <p className="text-sm font-bold tracking-[0.2em] opacity-90" style={{ color: card.textColor }}>
              •••• •••• •••• {card.last4}
            </p>

            {/* Bottom row */}
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[9px] opacity-60" style={{ color: card.textColor }}>Valid Thru</p>
                <p className="text-sm font-bold" style={{ color: card.textColor }}>{card.expiry}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] opacity-60" style={{ color: card.textColor }}>Balance</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-extrabold" style={{ color: card.textColor }}>
                    {showBalances[card.id] ? `$${card.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "••••••"}
                  </p>
                  <button onClick={() => toggle(card.id)} style={{ color: card.textColor }} className="opacity-70">
                    {showBalances[card.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add new card */}
        <button className="w-full rounded-3xl border-2 border-dashed border-border py-6 flex flex-col items-center gap-2 text-muted-foreground hover:bg-white/60 transition-colors">
          <div className="w-10 h-10 rounded-full border-2 border-dashed border-border flex items-center justify-center">
            <Plus size={18} />
          </div>
          <p className="text-sm font-semibold">Add New Card</p>
        </button>
      </div>

      {!hideNavBar && <NavBar activeTab={activeTab} onNavChange={onNavChange} />}
    </div>
  )
}
