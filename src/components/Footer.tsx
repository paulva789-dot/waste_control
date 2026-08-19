import Link from "next/link";
import { MessageCircle, Mail } from "lucide-react";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border-soft)] bg-[var(--surface)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Logo size={20} />
          <p className="mt-3 text-sm text-[var(--muted)] max-w-xs">
            Digital waste management for residents, collectors, HYSACAM and municipal councils.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Product</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/register" className="hover:text-brand-dark transition">Get started</Link></li>
            <li><Link href="/pricing" className="hover:text-brand-dark transition">Pricing</Link></li>
            <li><Link href="/login" className="hover:text-brand-dark transition">Log in</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Company</p>
          <ul className="space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-brand-dark transition">About</Link></li>
            <li><Link href="/privacy" className="hover:text-brand-dark transition">Privacy policy</Link></li>
            <li><Link href="/terms" className="hover:text-brand-dark transition">Terms of service</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)] mb-3">Contact</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a
                href="https://wa.me/000000000000"
                className="flex items-center gap-1.5 hover:text-brand-dark transition"
              >
                <MessageCircle size={14} /> WhatsApp (placeholder)
              </a>
            </li>
            <li>
              <a href="mailto:hello@example.com" className="flex items-center gap-1.5 hover:text-brand-dark transition">
                <Mail size={14} /> hello@example.com (placeholder)
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-[var(--border-soft)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5 text-xs text-[var(--muted)] flex flex-col sm:flex-row justify-between gap-2">
          <p>© {new Date().getFullYear()} CleanCity. Built for cleaner, smarter cities.</p>
          <p>Digital waste management system</p>
        </div>
      </div>
    </footer>
  );
}
