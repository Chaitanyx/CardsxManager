"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, PieChart, Settings, Menu } from 'lucide-react';
import { useCards } from '../../hooks/useCards';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const { cards } = useCards();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const NavigationLink = ({ href, icon: Icon, label, isActive }: { href: string, icon: React.ElementType, label: string, isActive: boolean }) => (
    <Link href={href} title={isExpanded ? "" : label} className="relative block">
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute inset-0 bg-white shadow-sm border border-white/60 rounded-xl"
          initial={false}
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
          style={{ mixBlendMode: "normal" }}
        />
      )}
      <motion.div 
        whileHover={{ scale: isActive ? 1 : 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-colors duration-200
          ${isActive ? 'text-sky-600' : 'text-neutral-500 hover:text-neutral-800'}`}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-sky-600' : 'text-neutral-500'}`} />
        <AnimatePresence mode="popLayout">
          {isExpanded && (
            <motion.span 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="font-medium whitespace-nowrap overflow-hidden"
            >
              {label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  );

  return (
    <motion.nav 
      initial={false}
      animate={{ 
        width: isExpanded ? 256 : 80,
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 1.2
      }}
      className={`fixed left-0 top-0 bottom-0 z-50 h-screen bg-white/70 backdrop-blur-[32px] border-r border-white/60 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.15)] flex flex-col will-change-[width]`}
      onContextMenu={(e) => { e.preventDefault(); setIsExpanded(!isExpanded); }}
      style={{
        backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.7), rgba(255,255,255,0.3))",
        boxShadow: "inset -1px 0 0 rgba(255,255,255,0.5), 4px 0 24px -12px rgba(0,0,0,0.15)"
      }}
    >
      <div className="flex items-center p-4 sm:p-5 h-16 sm:h-20 shrink-0">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl hover:bg-black/5 text-neutral-700 transition relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-neutral-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          <Menu className="w-5 h-5 relative z-10" />
        </motion.button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, width: 0, marginLeft: 0 }}
              animate={{ opacity: 1, width: "auto", marginLeft: 12 }}
              exit={{ opacity: 0, width: 0, marginLeft: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center space-x-1 overflow-hidden whitespace-nowrap"
            >
              <Link href="/" className="text-xl font-bold tracking-tight text-neutral-800">
                Card<span className="text-sky-500">X</span>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2 px-3 flex-1 py-4 overflow-y-auto overflow-x-hidden no-scrollbar">
        <NavigationLink href="/" icon={LayoutDashboard} label="Dashboard" isActive={pathname === '/'} />
        <NavigationLink href="/analytics" icon={PieChart} label="Analytics" isActive={pathname === '/analytics'} />
        
        {mounted && cards.length > 0 && (
          <div className="mt-8 mb-2">
            <div className={`px-4 text-[10px] uppercase tracking-widest font-semibold text-neutral-400 mb-3 transition-opacity duration-300
              ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 hidden'}`}>
              My Vault
            </div>
            {!isExpanded && (
              <div className="flex justify-center mb-3">
                 <div className="w-6 h-[1px] bg-neutral-200"></div>
              </div>
            )}
            
            <div className="flex flex-col gap-1.5 px-2 relative">
              {cards.map(card => {
                const isCardActive = pathname === `/card/${card.id}`;
                return (
                  <div key={card.id} className="relative block">
                    <Link 
                      href={`/card/${card.id}`}
                      className="relative block w-full"
                      title={isExpanded ? "" : card.name}
                    >
                    {isCardActive && (
                      <motion.div
                        layoutId="activeCardIndicator"
                        className="absolute inset-0 bg-white/60 shadow-sm border border-white/80 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <motion.div 
                      whileHover={{ scale: isCardActive ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors duration-200
                        ${isCardActive 
                          ? 'text-neutral-900 border-neutral-200/50' 
                          : 'text-neutral-500 hover:text-neutral-800'}`}
                    >
                      <div 
                        className={`w-6 h-[18px] rounded-[4px] shrink-0 border border-white/60 shadow-sm relative overflow-hidden flex items-center justify-center`}
                        style={{ background: `linear-gradient(135deg, ${card.color[0]}, ${card.color[1]})` }}
                      >
                        <div className="absolute inset-0 bg-white/10 mix-blend-overlay"></div>
                      </div>
                      
                      <AnimatePresence mode="popLayout">
                        {isExpanded && (
                          <motion.span 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="text-sm font-medium whitespace-nowrap overflow-hidden"
                          >
                            {card.bank}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 shrink-0 mb-4 border-t border-black/[0.03] pt-4 mt-auto relative z-10 w-full">
        <NavigationLink href="/settings" icon={Settings} label="Settings" isActive={pathname === '/settings'} />
      </div>
    </motion.nav>
  );
}
