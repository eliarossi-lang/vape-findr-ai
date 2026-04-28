export type ProductCategory = "liquidi" | "dispositivi" | "resistenze" | "accessori";

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  description: string;
  // tagging that the AI can match against
  flavors?: string[]; // es: ["mango", "frutta", "tropicale"]
  sweetness?: "secco" | "neutro" | "dolce" | "molto-dolce";
  intensity?: "leggero" | "medio" | "intenso";
  nicotine?: "0" | "3" | "6" | "9" | "salts-10" | "salts-20";
  drawStyle?: "MTL" | "DTL" | "RDL"; // tiro in bocca / diretto / restricted
  level?: "principiante" | "intermedio" | "esperto";
  priceFrom: number;
  rating: number; // 0-5
  reviews: number;
  image: string; // emoji-art for now
  shops: { name: string; price: number; url: string }[];
  localStores?: { name: string; city: string; distanceKm: number }[];
}

const stores = [
  { name: "SvapoStore", city: "Milano", distanceKm: 1.2 },
  { name: "VapeShop Roma", city: "Roma", distanceKm: 2.4 },
  { name: "Cloud9 Torino", city: "Torino", distanceKm: 3.1 },
];

export const catalog: Product[] = [
  {
    id: "p1",
    name: "Mango Tango",
    brand: "Suprem-e",
    category: "liquidi",
    description: "Aroma concentrato al mango maturo con note tropicali, pensato per tiri di guancia.",
    flavors: ["mango", "tropicale", "frutta", "dolce"],
    sweetness: "dolce",
    intensity: "medio",
    nicotine: "0",
    drawStyle: "MTL",
    level: "principiante",
    priceFrom: 6.9,
    rating: 4.7,
    reviews: 312,
    image: "🥭",
    shops: [
      { name: "Svapo.it", price: 6.9, url: "#" },
      { name: "TerpyVape", price: 7.5, url: "#" },
    ],
    localStores: stores.slice(0, 2),
  },
  {
    id: "p2",
    name: "Ice Menta Polar",
    brand: "Vaporart",
    category: "liquidi",
    description: "Liquido pronto mentolo intenso con effetto ghiaccio, ideale per giornate calde.",
    flavors: ["menta", "ghiaccio", "fresco"],
    sweetness: "neutro",
    intensity: "intenso",
    nicotine: "6",
    drawStyle: "MTL",
    level: "intermedio",
    priceFrom: 4.5,
    rating: 4.4,
    reviews: 198,
    image: "❄️",
    shops: [
      { name: "Vaporart Shop", price: 4.5, url: "#" },
      { name: "Svapo.it", price: 4.9, url: "#" },
    ],
    localStores: stores.slice(1, 3),
  },
  {
    id: "p3",
    name: "Tobacco Gold Salts",
    brand: "Dea Flavor",
    category: "liquidi",
    description: "Nic salts al tabacco dorato, perfetti per pod a tiro di guancia. Resa morbida e persistente.",
    flavors: ["tabacco", "classico", "dorato"],
    sweetness: "secco",
    intensity: "intenso",
    nicotine: "salts-20",
    drawStyle: "MTL",
    level: "esperto",
    priceFrom: 5.9,
    rating: 4.6,
    reviews: 420,
    image: "🟤",
    shops: [{ name: "Dea Shop", price: 5.9, url: "#" }],
    localStores: stores,
  },
  {
    id: "p4",
    name: "Caliburn G3",
    brand: "Uwell",
    category: "dispositivi",
    description: "Pod compatto MTL con regolazione airflow, batteria 900mAh, ideale per principianti.",
    flavors: [],
    intensity: "medio",
    drawStyle: "MTL",
    level: "principiante",
    priceFrom: 32.9,
    rating: 4.8,
    reviews: 1240,
    image: "🔋",
    shops: [
      { name: "Svapo.it", price: 32.9, url: "#" },
      { name: "VapeShop Roma", price: 34.5, url: "#" },
    ],
    localStores: stores,
  },
  {
    id: "p5",
    name: "Drag X Pro",
    brand: "Voopoo",
    category: "dispositivi",
    description: "Box mod 100W per tiro diretto, display TFT, adatto a vapers esperti.",
    intensity: "intenso",
    drawStyle: "DTL",
    level: "esperto",
    priceFrom: 79.9,
    rating: 4.7,
    reviews: 540,
    image: "📦",
    shops: [{ name: "TerpyVape", price: 79.9, url: "#" }],
    localStores: stores.slice(0, 2),
  },
  {
    id: "p6",
    name: "Coil GTX 0.4Ω",
    brand: "Vaporesso",
    category: "resistenze",
    description: "Resistenza mesh per pod GTX, perfetta per tiro restricted (RDL). Confezione da 5.",
    intensity: "medio",
    drawStyle: "RDL",
    level: "intermedio",
    priceFrom: 12.5,
    rating: 4.5,
    reviews: 220,
    image: "🌀",
    shops: [{ name: "Svapo.it", price: 12.5, url: "#" }],
    localStores: stores.slice(0, 1),
  },
  {
    id: "p7",
    name: "Cotone Bacon V2",
    brand: "Wick'n'Vape",
    category: "accessori",
    description: "Cotone organico premium per rigenerabili, fibra lunga, resa pulita degli aromi.",
    level: "esperto",
    priceFrom: 7.9,
    rating: 4.9,
    reviews: 890,
    image: "🧵",
    shops: [{ name: "DIY Vape", price: 7.9, url: "#" }],
  },
  {
    id: "p8",
    name: "Frutti Rossi Estate",
    brand: "FlavourArt",
    category: "liquidi",
    description: "Aroma dolce di fragola, lampone e mirtillo. Estate in una boccetta.",
    flavors: ["frutti rossi", "fragola", "lampone", "dolce", "frutta"],
    sweetness: "molto-dolce",
    intensity: "medio",
    nicotine: "0",
    drawStyle: "MTL",
    level: "principiante",
    priceFrom: 5.5,
    rating: 4.5,
    reviews: 274,
    image: "🍓",
    shops: [{ name: "FlavourArt Store", price: 5.5, url: "#" }],
    localStores: stores.slice(0, 2),
  },
];
