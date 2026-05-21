import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="hover:text-pulse-700">
            Features
          </a>
          <a href="#workflow" className="hover:text-pulse-700">
            Workflow
          </a>
          <a href="#pricing" className="hover:text-pulse-700">
            Pricing
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Open demo</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
