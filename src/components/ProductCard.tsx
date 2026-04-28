import { Star, MapPin, ExternalLink } from "lucide-react";
import type { RankedProduct } from "@/lib/searchRank";

const categoryLabel: Record<string, string> = {
  liquidi: "Liquido",
  dispositivi: "Dispositivo",
  resistenze: "Resistenza",
  accessori: "Accessorio",
};

export const ProductCard = ({ product }: { product: RankedProduct }) => {
  const bestPrice = product.shops.reduce(
    (min, s) => (s.price < min ? s.price : min),
    product.shops[0]?.price ?? product.priceFrom,
  );

  return (
    <article className="group relative rounded-2xl overflow-hidden bg-gradient-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-elegant animate-fade-up">
      {/* Score ribbon */}
      <div className="absolute top-3 right-3 z-10 glass rounded-full px-3 py-1 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-secondary shadow-cyan" />
        <span className="text-xs font-semibold text-secondary">
          {product.score}% match
        </span>
      </div>

      {/* Image area */}
      <div className="aspect-[4/3] flex items-center justify-center text-7xl bg-gradient-to-br from-accent/40 via-background to-muted/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-glow opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <span className="relative animate-float">{product.image}</span>
      </div>

      <div className="p-5 space-y-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {categoryLabel[product.category]}
            </span>
            <span>{product.brand}</span>
          </div>
          <h3 className="font-display font-semibold text-lg leading-tight">
            {product.name}
          </h3>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-primary text-primary" />
            <span className="font-medium">{product.rating}</span>
            <span className="text-muted-foreground">({product.reviews})</span>
          </div>
          {product.localStores?.length ? (
            <div className="flex items-center gap-1 text-muted-foreground text-xs">
              <MapPin className="w-3.5 h-3.5" />
              <span>{product.localStores.length} negozi vicini</span>
            </div>
          ) : null}
        </div>

        <div className="flex items-end justify-between pt-2 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground">Da</div>
            <div className="font-display text-2xl font-bold text-gradient">
              €{bestPrice.toFixed(2)}
            </div>
          </div>
          <a
            href={product.shops[0]?.url ?? "#"}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-xl bg-primary/10 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground hover:shadow-neon transition-all"
          >
            Vai allo shop
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
};
