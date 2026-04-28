import { Droplet, Cpu, Zap, Package } from "lucide-react";
import type { ProductCategory } from "@/data/catalog";

const items: { id: ProductCategory | "all"; label: string; icon: typeof Droplet }[] = [
  { id: "all", label: "Tutto", icon: Zap },
  { id: "liquidi", label: "Liquidi", icon: Droplet },
  { id: "dispositivi", label: "Dispositivi", icon: Cpu },
  { id: "resistenze", label: "Resistenze", icon: Zap },
  { id: "accessori", label: "Accessori", icon: Package },
];

interface Props {
  active: ProductCategory | "all";
  onChange: (c: ProductCategory | "all") => void;
}

export const CategoryPills = ({ active, onChange }: Props) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {items.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={[
              "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all duration-300",
              isActive
                ? "bg-gradient-primary text-primary-foreground border-transparent shadow-neon"
                : "glass border-border text-muted-foreground hover:text-foreground hover:border-primary/40",
            ].join(" ")}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
};
