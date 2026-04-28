import type { Product } from "@/data/catalog";

export interface SearchCriteria {
  category?: string;
  flavors?: string[];
  sweetness?: string;
  intensity?: string;
  nicotine?: string;
  drawStyle?: string;
  level?: string;
  priceMax?: number;
  keywords?: string[];
  summary?: string;
}

export interface RankedProduct extends Product {
  score: number; // 0-100
}

export function rankCatalog(
  products: Product[],
  criteria: SearchCriteria,
): RankedProduct[] {
  const ranked = products.map((p) => {
    let score = 0;
    let max = 0;

    const add = (weight: number, hit: boolean) => {
      max += weight;
      if (hit) score += weight;
    };

    if (criteria.category) add(25, p.category === criteria.category);
    if (criteria.drawStyle) add(15, p.drawStyle === criteria.drawStyle);
    if (criteria.nicotine) add(15, p.nicotine === criteria.nicotine);
    if (criteria.intensity) add(10, p.intensity === criteria.intensity);
    if (criteria.sweetness) add(10, p.sweetness === criteria.sweetness);
    if (criteria.level) add(8, p.level === criteria.level);
    if (criteria.priceMax)
      add(8, p.priceFrom <= criteria.priceMax);

    if (criteria.flavors?.length) {
      const tags = (p.flavors ?? []).map((f) => f.toLowerCase());
      const hits = criteria.flavors.filter((f) =>
        tags.some((t) => t.includes(f.toLowerCase())),
      ).length;
      const w = 30;
      max += w;
      score += Math.min(w, (hits / criteria.flavors.length) * w);
    }

    if (criteria.keywords?.length) {
      const hay = (p.name + " " + p.description + " " + p.brand).toLowerCase();
      const hits = criteria.keywords.filter((k) =>
        hay.includes(k.toLowerCase()),
      ).length;
      const w = 12;
      max += w;
      score += Math.min(w, hits * 4);
    }

    // baseline: rating contributes a small fraction
    const ratingBoost = (p.rating / 5) * 10;
    score += ratingBoost;
    max += 10;

    const finalScore = max > 0 ? Math.round((score / max) * 100) : 50;
    return { ...p, score: finalScore };
  });

  return ranked.sort((a, b) => b.score - a.score);
}
