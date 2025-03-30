import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "fa-tachometer-alt" },
  { label: "Energy Management", href: "/energy", icon: "fa-bolt" },
  { label: "Water Supply", href: "/water", icon: "fa-water" },
  { label: "Smart Agriculture", href: "/agriculture", icon: "fa-seedling" },
  { label: "Alerts & Notifications", href: "/alerts", icon: "fa-bell" },
  { label: "Analytics", href: "/analytics", icon: "fa-chart-line" },
  { label: "Settings", href: "/settings", icon: "fa-cog" }
];

export default function Sidebar({ isMobileOpen, onCloseMobile }: { isMobileOpen: boolean, onCloseMobile: () => void }) {
  const [location] = useLocation();
  
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-dark-800 border-r border-gray-800 shadow-lg transition-transform duration-300 ease-in-out",
        isMobileOpen ? "" : "transform -translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary">
            <span className="text-xl font-bold text-white">RF</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-wide">
            RuralFlow <span className="text-primary">AI</span>
          </h1>
        </div>
        <button
          className="md:hidden text-gray-400 hover:text-white focus:outline-none"
          onClick={onCloseMobile}
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {
                if (window.innerWidth < 768) {
                  onCloseMobile();
                }
              }}
            >
              <a
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-lg group",
                  location === item.href
                    ? "bg-gradient-to-r from-gray-700/40 to-gray-700/20 text-white border-l-4 border-primary"
                    : "text-gray-300 hover:bg-gray-700/40 hover:text-white"
                )}
              >
                <i className={cn("fas", item.icon, "mr-3", location === item.href ? "text-primary" : "text-gray-400 group-hover:text-primary")}></i>
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-800">
        <div className="px-4 py-3 bg-gray-700/40 rounded-lg">
          <div className="flex items-center space-x-3">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent animate-pulse"></span>
            <div className="text-sm">
              <p className="text-gray-300">System Status</p>
              <p className="font-semibold text-white">Online</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
