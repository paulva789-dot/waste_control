"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Bell, Sun, Moon, MapPin, CalendarDays, Crown } from "lucide-react";
import Logo from "./Logo";
import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();

  const navLink = (href: string, label: string, Icon: any) => (
    <Link
      href={href}
      className={`flex items-center gap-1.5 text-sm font-medium transition ${
        pathname === href ? "text-brand-dark" : "text-[var(--muted)] hover:text-brand-dark"
      }`}
    >
      <Icon size={16} />
      <span className="hidden md:inline">{label}</span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--border-soft)] bg-[var(--surface)]/80 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        <Link href="/">
          <Logo size={22} />
        </Link>

        {user && (
          <nav className="flex items-center gap-5">
            {navLink("/dashboard", "Dashboard", Bell)}
            {navLink("/schedule", "Schedule", CalendarDays)}
            {navLink("/map", "Map", MapPin)}
          </nav>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="text-[var(--muted)] hover:text-brand-dark transition p-2 rounded-full hover:bg-brand-light"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {user ? (
            <div className="flex items-center gap-4">
              {user.isPremium && (
                <span className="badge bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                  <Crown size={12} /> Premium
                </span>
              )}
              <button className="relative text-[var(--muted)] hover:text-brand-dark transition">
                <Bell size={20} />
              </button>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold leading-none">{user.name}</p>
                <p className="text-xs text-[var(--muted)] mt-0.5">{user.role.replace(/_/g, " ")}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-red-600 transition"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-secondary">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Get started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
