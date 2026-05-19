import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { SearchBar } from "@/components/SearchBar";
import { CategoryPills } from "@/components/CategoryPills";
import { ProductCard } from "@/components/ProductCard";
import { catalog, type ProductCategory } from "@/data/catalog";
import { rankCatalog, type SearchCriteria, type RankedProduct } from "@/lib/searchRank";
import heroImage from "@/assets/hero-vapor.jpg";
import { SmokeBackground } from "@/components/SmokeBackground";
import { Sparkles, ShieldCheck, MapPin, Zap } from "lucide-react";
import MagicBento from "@/components/MagicBento.jsx";

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [criteria, setCriteria] = useState<SearchCriteria | null>(null);
  const [results, setResults] = useState<RankedProduct[] | null>(null);
  const [activeCategory, setActiveCategory] = useState<ProductCategory | "all">("all");
  const [lastQuery, setLastQuery] = useState("");

  const handleSearch = async (query: string) => {
    setLoading(true);
    setLastQuery(query);
    try {
      const { data, error } = await supabase.functions.invoke("vape-search", {
        body: { query },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const c: SearchCriteria = data?.criteria ?? { summary: query };
      setCriteria(c);
      const ranked = rankCatalog(catalog, c);
      setResults(ranked);
      setActiveCategory("all");
      // smooth scroll to results
      setTimeout(() => {
        document.getElementById("risultati")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (e) {
      console.error(e);
      const msg = e instanceof Error ? e.message : "Errore durante la ricerca";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (!results) return null;
    if (activeCategory === "all") return results;
    return results.filter((p) => p.category === activeCategory);
  }, [results, activeCategory]);

  return (
    <div className="min-h-screen relative">
      <SmokeBackground />
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden">
        <img
          src={heroImage}
          alt=""
          aria-hidden
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none mix-blend-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background pointer-events-none" />
        <div className="absolute inset-0 grid-noise opacity-[0.04] pointer-events-none" />

        <div className="container relative pt-20 pb-24 md:pt-28 md:pb-32">
          <div className="text-center max-w-3xl mx-auto mb-10 animate-fade-up">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-primary mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Motore di ricerca AI per il mondo dello svapo
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              Trova il vape{" "}
              <span className="text-gradient">perfetto</span>
              <br />
              parlando come pensi.
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              Descrivi a parole tue ciò che cerchi — gusto, intensità, dispositivo —
              e VapeSearch trova prodotti, prezzi e negozi vicini. In italiano, gergo incluso.
            </p>
          </div>

          <div className="animate-fade-up" style={{ animationDelay: "120ms" }}>
            <SearchBar onSearch={handleSearch} loading={loading} initialValue={lastQuery} />
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 text-center">
            {[
              { icon: Sparkles, label: "Ricerca AI", sub: "in italiano" },
              { icon: ShieldCheck, label: "Recensioni", sub: "verificate" },
              { icon: MapPin, label: "Negozi fisici", sub: "vicino a te" },
              { icon: Zap, label: "Prezzi", sub: "sempre aggiornati" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="glass rounded-2xl p-4">
                <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <div className="font-display font-semibold text-sm">{label}</div>
                <div className="text-xs text-muted-foreground">{sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RESULTS */}
      <section id="risultati" className="container py-16 md:py-20">
        {!results ? (
          <div id="categorie" className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
              Esplora per categoria
            </h2>
            <p className="text-muted-foreground mb-8">
              Liquidi, dispositivi, resistenze e accessori. Per principianti ed esperti.
            </p>
            <CategoryPills
              active={activeCategory}
              onChange={(c) => {
                setActiveCategory(c);
                const ranked = rankCatalog(catalog, c === "all" ? {} : { category: c });
                setResults(ranked);
                setCriteria({ summary: c === "all" ? "Tutti i prodotti" : `Categoria: ${c}` });
              }}
            />
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="text-xs uppercase tracking-wider text-primary mb-2 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Interpretazione AI
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-bold">
                  {criteria?.summary ?? "Risultati"}
                </h2>
                <p className="text-muted-foreground text-sm mt-1">
                  {filtered?.length ?? 0} prodotti ordinati per compatibilità
                </p>
              </div>
              <CategoryPills active={activeCategory} onChange={setActiveCategory} />
            </div>

            {filtered && filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((p, i) => (
                  <div key={p.id} style={{ animationDelay: `${i * 60}ms` }}>
                    <ProductCard product={p} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                Nessun prodotto in questa categoria. Prova a cambiare filtro.
              </div>
            )}
          </>
        )}
      </section>

      {/* PIANI teaser */}
      <section id="piani" className="container py-16 md:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Cresci con <span className="text-gradient">VapeSearch</span>
          </h2>
          <p className="text-muted-foreground">
            Inizia gratis. Sblocca ricerche illimitate, mappa negozi e alert prezzi col Pro.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            { name: "Free", price: "0€", sub: "/mese", perks: ["5 ricerche/giorno", "3 risultati per ricerca", "Link agli shop"], variant: "" },
            { name: "Pro", price: "4,99€", sub: "/mese", perks: ["Ricerche illimitate", "10+ risultati completi", "Mappa negozi + alert prezzi"], variant: "featured" },
            { name: "Negozi", price: "29€", sub: "/mese", perks: ["Profilo verificato", "Catalogo + visibilità prioritaria", "Statistiche clienti"], variant: "" },
          ].map((p) => (
            <div
              key={p.name}
              className={[
                "rounded-2xl p-6 border bg-gradient-card transition-all",
                p.variant === "featured"
                  ? "border-primary/60 shadow-neon scale-[1.02]"
                  : "border-border hover:border-primary/30",
              ].join(" ")}
            >
              <div className="text-sm text-muted-foreground">{p.name}</div>
              <div className="mt-2 mb-5">
                <span className="font-display text-4xl font-bold">{p.price}</span>
                <span className="text-muted-foreground">{p.sub}</span>
              </div>
              <ul className="space-y-2 text-sm mb-6">
                {p.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">✓</span>
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="container py-10 border-t border-border/60 text-center text-xs text-muted-foreground">
        <p>
          VapeSearch è un aggregatore indipendente: non vende prodotti per lo svapo.
          Vietato ai minori di 18 anni. Lo svapo contiene nicotina, sostanza che crea dipendenza.
        </p>
      </footer>
    </div>
  );
};

export default Index;
