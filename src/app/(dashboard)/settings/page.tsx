"use client";

import { useState } from "react";
import { User, LogOut, Monitor, Moon, Sun, Palette, Globe, Settings as SettingsIcon, Info, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const [theme, setTheme] = useState("system");
  const [currency, setCurrency] = useState("USD");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [comparison, setComparison] = useState("previous");
  const [density, setDensity] = useState("comfortable");

  const handleLogout = () => {
    // Basic mock logout: redirect to login
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-12 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-page-title text-[var(--color-text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column (Profile) */}
        <div className="md:col-span-1 flex flex-col gap-6">
          
          {/* Profile Card */}
          <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-xl overflow-hidden shadow-sm">
            <div className="h-24 bg-[var(--color-surface-2)] w-full"></div>
            <div className="px-6 pb-6 relative">
              <div className="w-20 h-20 bg-[var(--color-accent)] text-white rounded-full flex items-center justify-center text-2xl font-bold border-4 border-[var(--color-surface-0)] absolute -top-10 shadow-sm">
                AD
              </div>
              <div className="pt-12">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">Analytics Demo User</h3>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">Category Manager</p>
                
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] mb-6">
                  <User className="w-4 h-4" />
                  demo@northstar-commerce.app
                </div>
                
                <Button 
                  onClick={handleLogout} 
                  variant="outline" 
                  className="w-full text-[var(--color-negative)] border-[var(--color-negative)]/30 hover:bg-[var(--color-negative)]/10"
                >
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </Button>
              </div>
            </div>
          </div>
          
          {/* About Card */}
          <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[var(--color-text-primary)] font-semibold">
              <Info className="w-5 h-5 text-[var(--color-accent)]" />
              About Northstar
            </div>
            
            <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
              <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                <span>Version</span>
                <span className="font-medium text-[var(--color-text-primary)]">v0.1.0-beta</span>
              </div>
              
              <div className="flex justify-between border-b border-[var(--color-border)] pb-2">
                <span className="flex items-center gap-1"><Database className="w-3 h-3" /> Dataset</span>
                <span className="font-medium text-[var(--color-text-primary)]">5,000 Orders</span>
              </div>
              
              <div className="pt-2">
                <p className="font-medium text-[var(--color-text-primary)] mb-2">Powered By:</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-[var(--color-surface-2)] rounded text-xs">Next.js 14</span>
                  <span className="px-2 py-1 bg-[var(--color-surface-2)] rounded text-xs">Prisma SQLite</span>
                  <span className="px-2 py-1 bg-[var(--color-surface-2)] rounded text-xs">FastAPI Pandas</span>
                  <span className="px-2 py-1 bg-[var(--color-surface-2)] rounded text-xs">Recharts</span>
                  <span className="px-2 py-1 bg-[var(--color-surface-2)] rounded text-xs">TanStack Table</span>
                </div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-[var(--color-border)] text-xs text-center">
                Built with Antigravity
              </div>
            </div>
          </div>
          
        </div>
        
        {/* Right Column (Settings) */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Theme Settings */}
          <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-[var(--color-text-primary)] font-semibold">
              <Palette className="w-5 h-5 text-[var(--color-accent)]" />
              Theme Preferences
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "light" ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"}`}
              >
                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-800">
                  <Sun className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Light</span>
              </button>
              
              <button 
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "dark" ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"}`}
              >
                <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-white">
                  <Moon className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">Dark</span>
              </button>
              
              <button 
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${theme === "system" ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5" : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"}`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-800 border border-slate-300 flex items-center justify-center text-slate-500">
                  <Monitor className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </div>
          
          {/* Display Preferences */}
          <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-[var(--color-text-primary)] font-semibold">
              <SettingsIcon className="w-5 h-5 text-[var(--color-accent)]" />
              Display Settings
            </div>
            
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Currency</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-strong)] rounded-md text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Date Format</label>
                  <select 
                    value={dateFormat} 
                    onChange={(e) => setDateFormat(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-strong)] rounded-md text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--color-border)]">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Default Comparison</label>
                  <select 
                    value={comparison} 
                    onChange={(e) => setComparison(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-strong)] rounded-md text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  >
                    <option value="previous">Previous Period</option>
                    <option value="last_year">Same Period Last Year</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[var(--color-text-primary)]">Table Density</label>
                  <select 
                    value={density} 
                    onChange={(e) => setDensity(e.target.value)}
                    className="w-full h-10 px-3 py-2 bg-[var(--color-surface-1)] border border-[var(--color-border-strong)] rounded-md text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]"
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>
              </div>
              
            </div>
            
            <div className="mt-8 flex justify-end">
              <Button>Save Preferences</Button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
