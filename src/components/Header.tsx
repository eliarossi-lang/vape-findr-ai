import { Sparkles, User as UserIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 glass border-b border-border/60">
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-neon group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            Vape<span className="text-gradient">Search</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/#scopri" className="hover:text-foreground transition-colors">Scopri</a>
          <a href="/#categorie" className="hover:text-foreground transition-colors">Categorie</a>
          <a href="/#piani" className="hover:text-foreground transition-colors">Piani</a>
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
                <UserIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Profilo</span>
              </Button>
              <Button variant="outlineNeon" size="sm" onClick={async () => { await signOut(); navigate("/"); }}>
                Esci
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={() => navigate("/auth")}>Accedi</Button>
              <Button variant="neon" size="sm" onClick={() => navigate("/auth")}>Inizia</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
