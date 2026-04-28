import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const signUpSchema = z.object({
  email: z.string().trim().email("Email non valida").max(255),
  password: z.string().min(8, "Minimo 8 caratteri").max(72),
  displayName: z.string().trim().min(2, "Nome troppo corto").max(50),
  ageConfirmed: z.literal(true, { errorMap: () => ({ message: "Devi confermare di avere almeno 18 anni" }) }),
});

const signInSchema = z.object({
  email: z.string().trim().email("Email non valida").max(255),
  password: z.string().min(1, "Inserisci la password").max(72),
});

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  // sign up state
  const [suEmail, setSuEmail] = useState("");
  const [suPwd, setSuPwd] = useState("");
  const [suName, setSuName] = useState("");
  const [age, setAge] = useState(false);

  // sign in state
  const [siEmail, setSiEmail] = useState("");
  const [siPwd, setSiPwd] = useState("");

  useEffect(() => {
    if (!loading && user) navigate("/profile", { replace: true });
  }, [user, loading, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signUpSchema.safeParse({ email: suEmail, password: suPwd, displayName: suName, ageConfirmed: age });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/profile`,
        data: { display_name: parsed.data.displayName, age_confirmed: true },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("already") ? "Email già registrata. Accedi." : error.message);
      return;
    }
    toast.success("Benvenuto su VapeSearch!");
    navigate("/profile");
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signInSchema.safeParse({ email: siEmail, password: siPwd });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.includes("Invalid") ? "Credenziali non valide" : error.message);
      return;
    }
    navigate("/profile");
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}/profile` });
    if (result.error) {
      setSubmitting(false);
      toast.error("Errore con Google. Riprova.");
      return;
    }
    if (result.redirected) return;
    navigate("/profile");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 justify-center mb-8 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center shadow-neon">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">
            Vape<span className="text-gradient">Search</span>
          </span>
        </Link>

        <div className="glass rounded-2xl p-6 md:p-8">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid grid-cols-2 w-full mb-6">
              <TabsTrigger value="signin">Accedi</TabsTrigger>
              <TabsTrigger value="signup">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="si-email">Email</Label>
                  <Input id="si-email" type="email" autoComplete="email" value={siEmail} onChange={(e) => setSiEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="si-pwd">Password</Label>
                  <Input id="si-pwd" type="password" autoComplete="current-password" value={siPwd} onChange={(e) => setSiPwd(e.target.value)} required />
                </div>
                <Button type="submit" variant="neon" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Attendere…" : "Accedi"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="su-name">Nome / Username</Label>
                  <Input id="su-name" value={suName} onChange={(e) => setSuName(e.target.value)} maxLength={50} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-email">Email</Label>
                  <Input id="su-email" type="email" autoComplete="email" value={suEmail} onChange={(e) => setSuEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="su-pwd">Password</Label>
                  <Input id="su-pwd" type="password" autoComplete="new-password" value={suPwd} onChange={(e) => setSuPwd(e.target.value)} minLength={8} required />
                  <p className="text-xs text-muted-foreground">Almeno 8 caratteri</p>
                </div>
                <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Checkbox checked={age} onCheckedChange={(v) => setAge(v === true)} className="mt-0.5" />
                  <span>Confermo di avere almeno <strong className="text-foreground">18 anni</strong> e accetto che lo svapo contiene nicotina, sostanza che crea dipendenza.</span>
                </label>
                <Button type="submit" variant="neon" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? "Creazione…" : "Crea account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground">oppure</span></div>
          </div>

          <Button type="button" variant="glass" className="w-full" size="lg" onClick={handleGoogle} disabled={submitting}>
            <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 5c1.6 0 3 .55 4.13 1.62l3.07-3.07C17.18 1.7 14.78.8 12 .8 7.32.8 3.27 3.46 1.31 7.4l3.6 2.78C5.86 7.36 8.7 5 12 5z"/><path fill="#34A853" d="M23.2 12.27c0-.85-.07-1.66-.21-2.45H12v4.63h6.3c-.27 1.46-1.1 2.7-2.34 3.53l3.6 2.79c2.1-1.94 3.32-4.81 3.32-8.5z"/><path fill="#FBBC05" d="M4.91 14.18A7.18 7.18 0 014.5 12c0-.76.13-1.5.36-2.18L1.3 7.04A11.96 11.96 0 000 12c0 1.93.46 3.76 1.3 5.4l3.6-2.79z"/><path fill="#4285F4" d="M12 23.2c3.24 0 5.95-1.07 7.93-2.9l-3.6-2.79c-1 .67-2.28 1.07-4.33 1.07-3.3 0-6.14-2.36-7.09-5.4l-3.6 2.78C3.27 20.54 7.32 23.2 12 23.2z"/></svg>
            Continua con Google
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Riservato ai maggiori di 18 anni. Procedendo accetti la nostra natura di aggregatore indipendente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
