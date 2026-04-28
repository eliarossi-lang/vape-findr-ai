import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { LogOut, Save, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const FLAVORS = ["Fruttato", "Mentolato", "Tabaccoso", "Dolce / Cremoso", "Agrumato", "Bevande", "Frutti rossi", "Tropicale"];

const profileSchema = z.object({
  display_name: z.string().trim().min(2).max(50),
  full_name: z.string().trim().max(80).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  intensity_preference: z.string().optional(),
  nicotine_type: z.string().optional(),
  nicotine_level: z.number().min(0).max(50).nullable(),
});

const Profile = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [flavors, setFlavors] = useState<string[]>([]);
  const [intensity, setIntensity] = useState<string>("");
  const [nicType, setNicType] = useState<string>("");
  const [nicLevel, setNicLevel] = useState<string>("");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth", { replace: true });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (error) { toast.error("Errore nel caricamento profilo"); console.error(error); }
      if (data) {
        setDisplayName(data.display_name ?? "");
        setFullName(data.full_name ?? "");
        setCity(data.city ?? "");
        setFlavors(data.flavor_preferences ?? []);
        setIntensity(data.intensity_preference ?? "");
        setNicType(data.nicotine_type ?? "");
        setNicLevel(data.nicotine_level != null ? String(data.nicotine_level) : "");
      }
      setLoading(false);
    })();
  }, [user]);

  const toggleFlavor = (f: string) => {
    setFlavors((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]));
  };

  const handleSave = async () => {
    if (!user) return;
    const parsed = profileSchema.safeParse({
      display_name: displayName,
      full_name: fullName,
      city,
      intensity_preference: intensity || undefined,
      nicotine_type: nicType || undefined,
      nicotine_level: nicLevel === "" ? null : Number(nicLevel),
    });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      display_name: parsed.data.display_name,
      full_name: parsed.data.full_name || null,
      city: parsed.data.city || null,
      flavor_preferences: flavors,
      intensity_preference: parsed.data.intensity_preference || null,
      nicotine_type: parsed.data.nicotine_type || null,
      nicotine_level: parsed.data.nicotine_level,
    }).eq("user_id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profilo aggiornato");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="container py-20 text-center text-muted-foreground">Caricamento…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container py-10 md:py-16 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-neon">
              <UserIcon className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold">Il tuo profilo</h1>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}><LogOut className="w-4 h-4" />Esci</Button>
        </div>

        <section className="glass rounded-2xl p-6 md:p-8 space-y-6">
          <div>
            <h2 className="font-display text-lg font-semibold mb-4">Dati personali</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dn">Username *</Label>
                <Input id="dn" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={50} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fn">Nome completo</Label>
                <Input id="fn" value={fullName} onChange={(e) => setFullName(e.target.value)} maxLength={80} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="city">Città (per trovare negozi vicini)</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={80} placeholder="Es. Milano" />
              </div>
            </div>
          </div>

          <div className="border-t border-border/60 pt-6">
            <h2 className="font-display text-lg font-semibold mb-1">Preferenze di gusto</h2>
            <p className="text-sm text-muted-foreground mb-4">Seleziona i gusti che preferisci — useremo queste preferenze per personalizzare i risultati.</p>
            <div className="flex flex-wrap gap-2">
              {FLAVORS.map((f) => {
                const active = flavors.includes(f);
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => toggleFlavor(f)}
                    className={[
                      "px-3 py-1.5 rounded-full text-sm border transition-all",
                      active
                        ? "bg-primary/15 border-primary text-primary shadow-neon"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    ].join(" ")}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-border/60 pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Intensità preferita</Label>
              <Select value={intensity} onValueChange={setIntensity}>
                <SelectTrigger><SelectValue placeholder="Seleziona…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="leggera">Leggera</SelectItem>
                  <SelectItem value="media">Media</SelectItem>
                  <SelectItem value="forte">Forte</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo nicotina</Label>
              <Select value={nicType} onValueChange={setNicType}>
                <SelectTrigger><SelectValue placeholder="Seleziona…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nessuna">Senza nicotina</SelectItem>
                  <SelectItem value="libera">Nicotina libera</SelectItem>
                  <SelectItem value="sali">Sali di nicotina</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nl">Livello (mg/ml)</Label>
              <Input id="nl" type="number" min={0} max={50} step="0.5" value={nicLevel} onChange={(e) => setNicLevel(e.target.value)} placeholder="0" />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="neon" size="lg" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4" />
              {saving ? "Salvataggio…" : "Salva preferenze"}
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Profile;
