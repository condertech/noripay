import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const Index = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name },
        },
      });

      if (error) setError(error.message);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) setError(error.message);
    }

    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) setError(error.message);

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm space-y-6 rounded-2xl bg-card p-8 shadow-card animate-fade-in"
      >
        <h1 className="mb-2 text-center text-2xl font-bold font-display">
          {isSignUp ? "Criar Conta" : "Entrar"}
        </h1>

        {isSignUp && (
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Seu nome"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu@email.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
        </div>

        {error && (
          <div className="text-center text-sm text-destructive">{error}</div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? isSignUp
              ? "Criando..."
              : "Entrando..."
            : isSignUp
              ? "Criar Conta"
              : "Entrar"}
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogle}
          disabled={loading}
        >
          Entrar com Google
        </Button>

        <div className="mt-2 text-center text-sm">
          {isSignUp ? (
            <>
              Já tem conta?{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => setIsSignUp(false)}
              >
                Entrar
              </button>
            </>
          ) : (
            <>
              Não tem conta?{" "}
              <button
                type="button"
                className="text-primary underline"
                onClick={() => setIsSignUp(true)}
              >
                Criar conta
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Index;
