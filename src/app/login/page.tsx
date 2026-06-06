"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate network request
    setTimeout(() => {
      // In a real app, set cookie or JWT here
      sessionStorage.setItem("northstar_auth", "true");
      router.push("/overview");
    }, 800);
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-0)] text-[var(--color-text-primary)]">
      
      {/* Left Panel: Branding */}
      <div className="hidden lg:flex w-1/2 bg-[var(--color-surface-1)] border-r border-[var(--color-border)] p-12 flex-col justify-between relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-[-10%] right-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top_left,var(--color-accent)_0%,transparent_50%)] opacity-5 pointer-events-none"></div>

        <div>
          <div className="flex items-center gap-3 mb-16">
            {/* Custom North Star / Compass Point Logo */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full text-[var(--color-accent)] drop-shadow-sm">
                <path d="M50 0 L55 45 L100 50 L55 55 L50 100 L45 55 L0 50 L45 45 Z" fill="currentColor" />
              </svg>
            </div>
            <span className="font-bold text-2xl tracking-tight font-dm-sans">Northstar Commerce</span>
          </div>

          <h1 className="text-4xl font-bold tracking-tight mb-6 max-w-md leading-tight text-[var(--color-text-primary)]">
            Revenue intelligence for e-commerce teams making daily product and channel decisions.
          </h1>
          <p className="text-lg text-[var(--color-text-secondary)] max-w-md leading-relaxed">
            Unify your order data, identify actionable customer segments, and discover hidden product affinities to optimize your catalog and marketing spend.
          </p>
        </div>

        <div className="text-sm text-[var(--color-text-secondary)]">
          © {new Date().getFullYear()} Northstar Commerce Intelligence. All rights reserved.
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-[var(--color-text-secondary)]">Sign in to your dashboard to view the latest analytics.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">Email Address</label>
              <input 
                type="email" 
                defaultValue="demo@northstar-commerce.app"
                required
                className="w-full h-11 px-4 bg-[var(--color-surface-1)] border border-[var(--color-border-strong)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-[var(--color-text-primary)]">Password</label>
                <a href="#" className="text-xs text-[var(--color-accent)] hover:underline">Forgot password?</a>
              </div>
              <input 
                type="password" 
                defaultValue="demo1234"
                required
                className="w-full h-11 px-4 bg-[var(--color-surface-1)] border border-[var(--color-border-strong)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] transition-colors"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 text-base mt-2" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Continue as Demo User
                </div>
              )}
            </Button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-[var(--color-text-secondary)]">
                Don't have an account? <a href="#" className="text-[var(--color-accent)] hover:underline font-medium">Request access</a>
              </p>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}
