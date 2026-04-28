import { Search, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, FormEvent } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  initialValue?: string;
}

const suggestions = [
  "Liquido dolce al mango senza nicotina",
  "Pod compatto per principiante, tiro di guancia",
  "Salts al tabacco intenso",
  "Mod 100W per tiro diretto",
];

export const SearchBar = ({ onSearch, loading, initialValue = "" }: SearchBarProps) => {
  const [value, setValue] = useState(initialValue);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={submit} className="relative group">
        <div className="absolute inset-0 bg-gradient-primary opacity-30 blur-2xl group-focus-within:opacity-60 transition-opacity duration-500 rounded-2xl" />
        <div className="relative glass rounded-2xl p-2 flex items-center gap-2 border-2 border-border group-focus-within:border-primary/60 transition-colors">
          <Sparkles className="w-5 h-5 text-primary ml-3 shrink-0" />
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Descrivi cosa cerchi… es. liquido dolce al mango senza nicotina"
            className="flex-1 bg-transparent border-0 outline-none text-base md:text-lg placeholder:text-muted-foreground py-3 min-w-0"
            disabled={loading}
          />
          <Button
            type="submit"
            variant="neon"
            size="lg"
            disabled={loading || !value.trim()}
            className="shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Cerco…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">Cerca</span>
              </>
            )}
          </Button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2 justify-center mt-5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setValue(s);
              onSearch(s);
            }}
            disabled={loading}
            className="text-xs md:text-sm px-3 py-1.5 rounded-full border border-border bg-muted/40 text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
};
