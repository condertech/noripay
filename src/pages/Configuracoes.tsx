import { useEffect, useState } from "react";
import {
  User,
  Bell,
  Shield,
  Palette,
  LogOut,
  Moon,
  Sun,
  ChevronRight,
  Lock,
  Mail,
  Smartphone,
  Trash2,
  Download,
  Info,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface UserProfile {
  email: string;
  name: string;
  avatar_url?: string;
}

export default function Configuracoes() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    name: "",
  });
  const [name, setName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Notificações (salvas em localStorage pois dependem de integração futura)
  const [notifBills, setNotifBills] = useState(
    localStorage.getItem("notif_bills") !== "false",
  );
  const [notifGoals, setNotifGoals] = useState(
    localStorage.getItem("notif_goals") !== "false",
  );
  const [notifWeekly, setNotifWeekly] = useState(
    localStorage.getItem("notif_weekly") !== "false",
  );

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        const n = u.user_metadata?.name || u.email?.split("@")[0] || "";
        setProfile({ email: u.email || "", name: n });
        setName(n);
      }
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { name },
    });
    if (error) toast.error("Erro ao salvar perfil");
    else {
      toast.success("Perfil atualizado!");
      setProfile((p) => ({ ...p, name }));
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error("Erro ao alterar senha: " + error.message);
    else {
      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    }
    setChangingPassword(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleNotifChange = (key: string, value: boolean) => {
    localStorage.setItem(key, String(value));
    if (key === "notif_bills") setNotifBills(value);
    if (key === "notif_goals") setNotifGoals(value);
    if (key === "notif_weekly") setNotifWeekly(value);
    toast.success("Preferência salva");
  };

  const initial = (profile.name || profile.email).charAt(0).toUpperCase();

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
          Configurações
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Gerencie sua conta e preferências
        </p>
      </div>

      {/* Profile */}
      <section className="rounded-2xl bg-card shadow-card border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Perfil</h2>
        </div>
        <div className="p-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground text-2xl font-bold">
              {initial}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {profile.name || "—"}
              </p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Nome de Exibição
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                E-mail
              </Label>
              <Input
                value={profile.email}
                disabled
                className="rounded-xl opacity-60"
              />
              <p className="text-xs text-muted-foreground">
                Para alterar o e-mail entre em contato com o suporte.
              </p>
            </div>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={savingProfile}
            >
              {savingProfile ? "Salvando..." : "Salvar Perfil"}
            </Button>
          </form>
        </div>
      </section>

      {/* Segurança */}
      <section className="rounded-2xl bg-card shadow-card border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Segurança</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleChangePassword} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Altere sua senha de acesso. Use no mínimo 6 caracteres.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Nova Senha
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Confirmar Senha
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="rounded-xl"
              disabled={changingPassword || !newPassword}
            >
              {changingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </div>
      </section>

      {/* Notificações */}
      <section className="rounded-2xl bg-card shadow-card border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Notificações</h2>
        </div>
        <div className="divide-y divide-border">
          {[
            {
              key: "notif_bills",
              label: "Contas a vencer",
              desc: "Alertas de boletos e faturas próximas do vencimento",
              value: notifBills,
            },
            {
              key: "notif_goals",
              label: "Progresso de metas",
              desc: "Notificações ao atingir marcos nas suas metas",
              value: notifGoals,
            },
            {
              key: "notif_weekly",
              label: "Resumo semanal",
              desc: "Relatório de gastos toda segunda-feira",
              value: notifWeekly,
            },
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between px-6 py-4"
            >
              <div>
                <p className="text-sm font-medium text-foreground">
                  {item.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.desc}
                </p>
              </div>
              <Switch
                checked={item.value}
                onCheckedChange={(v) => handleNotifChange(item.key, v)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Dados e privacidade */}
      <section className="rounded-2xl bg-card shadow-card border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Dados e Privacidade</h2>
        </div>
        <div className="divide-y divide-border">
          <Link
            to="/privacidade"
            className="flex items-center justify-between px-6 py-4 hover:bg-secondary/30 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Política de Privacidade
                </p>
                <p className="text-xs text-muted-foreground">
                  Veja como seus dados são tratados
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </div>
      </section>

      {/* Conta */}
      <section className="rounded-2xl bg-card shadow-card border border-border overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
          <User className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-foreground">Conta</h2>
        </div>
        <div className="p-6 space-y-3">
          <Button
            variant="outline"
            className="w-full rounded-xl justify-start gap-3 text-muted-foreground"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
          <Button
            variant="outline"
            className="w-full rounded-xl justify-start gap-3 text-destructive border-destructive/30 hover:bg-destructive/10"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
            Excluir minha conta
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            NoriPay v1.0.0 · Todos os dados armazenados com segurança
          </p>
        </div>
      </section>

      {/* Logout dialog */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Você será desconectado e redirecionado para a tela de login.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={handleLogout}>
              Sair
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete account dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Todos os seus dados (contas, transações, metas) serão apagados
              permanentemente. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90"
              onClick={async () => {
                toast.info(
                  "Para excluir sua conta, entre em contato: suporte@noripay.com.br",
                );
                setDeleteDialogOpen(false);
              }}
            >
              Entrar em Contato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
