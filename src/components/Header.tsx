import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Header = () => (
  <header className="sticky top-0 z-50 glass border-b border-border/60">
    <div className="container flex items-center justify-between h-16">
      <a href="/" className="flex items-center gap-2 group">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-neon group-hover:scale-105 transition-transform">
          <Sparkles className="w-5 h-5 text-primary-foreground" />
        </div>
        <span className="font-display text-xl font-bold tracking-tight">
          Vape<span className="text-gradient">Search</span>
        </span>
      </a>

      <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
        <a href="#scopri" className="hover:text-foreground transition-colors">Scopri</a>
        <a href="#categorie" className="hover:text-foreground transition-colors">Categorie</a>
        <a href="#piani" className="hover:text-foreground transition-colors">Piani</a>
      </nav>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Accedi</Button>
        <Button variant="neon" size="sm">Inizia</Button>
      </div>
    </div>
  </header>
);
