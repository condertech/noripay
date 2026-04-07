import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacidade() {
  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="rounded-xl" asChild>
          <Link to="/configuracoes">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold font-display text-foreground tracking-tight">
            Política de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Última atualização: janeiro de 2025
          </p>
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-card border border-border p-6 space-y-6 text-sm text-foreground leading-relaxed">
        {/* Intro */}
        <div className="flex items-start gap-3 rounded-xl bg-primary/10 border border-primary/20 p-4">
          <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            A NoriPay leva a privacidade dos seus dados muito a sério. Este
            documento descreve como coletamos, usamos e protegemos suas
            informações pessoais, em conformidade com a{" "}
            <strong className="text-foreground">
              Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº
              13.709/2018)
            </strong>
            .
          </p>
        </div>

        <Section title="1. Quem somos">
          <p>
            A <strong>NoriPay</strong> é uma aplicação de controle financeiro
            pessoal desenvolvida para auxiliar usuários no gerenciamento de
            receitas, despesas, metas e contas bancárias. Operamos como
            controlador dos dados pessoais que você nos fornece.
          </p>
          <p className="mt-2">
            Contato: <strong>suporte@noripay.com.br</strong>
          </p>
        </Section>

        <Section title="2. Dados que coletamos">
          <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Dados de cadastro:</strong>{" "}
              nome, endereço de e-mail e senha (armazenada criptografada).
            </li>
            <li>
              <strong className="text-foreground">
                Dados financeiros pessoais:
              </strong>{" "}
              contas bancárias, saldos, transações (receitas e despesas),
              cartões de crédito (limites, vencimentos) e metas financeiras.
            </li>
            <li>
              <strong className="text-foreground">Dados de uso:</strong> logs de
              acesso, endereço IP e informações do dispositivo para fins de
              segurança e prevenção a fraudes.
            </li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            Não coletamos números de cartões, senhas bancárias, dados de CPF ou
            informações sensíveis além das listadas acima.
          </p>
        </Section>

        <Section title="3. Como usamos seus dados">
          <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
            <li>Fornecer e personalizar os serviços da plataforma;</li>
            <li>
              Gerar relatórios e análises financeiras dentro do seu painel;
            </li>
            <li>Enviar alertas sobre contas a vencer e metas (se ativado);</li>
            <li>Melhorar a segurança e detectar atividades suspeitas;</li>
            <li>Cumprir obrigações legais e regulatórias.</li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            <strong className="text-foreground">
              Nunca vendemos seus dados
            </strong>{" "}
            a terceiros para fins comerciais.
          </p>
        </Section>

        <Section title="4. Base legal (LGPD)">
          <p>
            O tratamento dos seus dados é realizado com base nos seguintes
            fundamentos legais previstos na LGPD:
          </p>
          <ul className="space-y-1 list-disc pl-5 mt-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Consentimento</strong> — ao
              criar sua conta, você concorda com esta política;
            </li>
            <li>
              <strong className="text-foreground">Execução de contrato</strong>{" "}
              — necessário para prestar os serviços contratados;
            </li>
            <li>
              <strong className="text-foreground">Legítimo interesse</strong> —
              para segurança e prevenção a fraudes;
            </li>
            <li>
              <strong className="text-foreground">
                Cumprimento de obrigação legal
              </strong>{" "}
              — quando exigido por lei.
            </li>
          </ul>
        </Section>

        <Section title="5. Compartilhamento de dados">
          <p>Seus dados podem ser compartilhados apenas com:</p>
          <ul className="space-y-1 list-disc pl-5 mt-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Supabase</strong> — nosso
              provedor de banco de dados e autenticação, com servidores na União
              Europeia e certificações de segurança ISO 27001;
            </li>
            <li>
              <strong className="text-foreground">
                Autoridades competentes
              </strong>{" "}
              — quando exigido por ordem judicial ou regulatória.
            </li>
          </ul>
        </Section>

        <Section title="6. Segurança dos dados">
          <ul className="space-y-1 list-disc pl-5 text-muted-foreground">
            <li>Toda comunicação é criptografada via HTTPS/TLS;</li>
            <li>Senhas são armazenadas com hashing bcrypt;</li>
            <li>
              Row Level Security (RLS) garante que cada usuário acesse apenas
              seus próprios dados;
            </li>
            <li>Autenticação segura via JWT com expiração automática;</li>
            <li>Backups automáticos diários realizados pelo Supabase.</li>
          </ul>
        </Section>

        <Section title="7. Seus direitos (LGPD, Art. 18)">
          <p>Você tem direito a:</p>
          <ul className="space-y-1 list-disc pl-5 mt-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Acesso</strong> — obter
              confirmação e acesso aos seus dados;
            </li>
            <li>
              <strong className="text-foreground">Correção</strong> — solicitar
              atualização de dados incompletos ou incorretos;
            </li>
            <li>
              <strong className="text-foreground">Exclusão</strong> — solicitar
              a exclusão dos seus dados pessoais;
            </li>
            <li>
              <strong className="text-foreground">Portabilidade</strong> —
              receber seus dados em formato estruturado;
            </li>
            <li>
              <strong className="text-foreground">
                Revogação do consentimento
              </strong>{" "}
              — a qualquer momento, sem prejuízo a ações anteriores;
            </li>
            <li>
              <strong className="text-foreground">
                Oposição ao tratamento
              </strong>{" "}
              — quando o tratamento não for necessário.
            </li>
          </ul>
          <p className="mt-3 text-muted-foreground">
            Para exercer esses direitos, envie um e-mail para{" "}
            <strong className="text-foreground">
              privacidade@noripay.com.br
            </strong>
            . Responderemos em até 15 dias úteis.
          </p>
        </Section>

        <Section title="8. Retenção de dados">
          <p>
            Mantemos seus dados enquanto sua conta estiver ativa. Após o
            encerramento da conta, os dados são excluídos em until 60 dias,
            salvo obrigação legal de retenção.
          </p>
        </Section>

        <Section title="9. Cookies e armazenamento local">
          <p>
            Utilizamos <strong>localStorage</strong> do navegador apenas para
            salvar preferências locais (como notificações ativadas). Não
            utilizamos cookies de rastreamento ou publicidade.
          </p>
        </Section>

        <Section title="10. Menores de idade">
          <p>
            A NoriPay não é destinada a menores de 18 anos. Não coletamos
            intencionalmente dados de menores. Caso identifique tal situação,
            entre em contato para que possamos tomar as providências
            necessárias.
          </p>
        </Section>

        <Section title="11. Alterações nesta política">
          <p>
            Podemos atualizar esta política periodicamente. Notificaremos sobre
            alterações significativas por e-mail ou pela própria plataforma. O
            uso continuado dos serviços após as alterações implica aceite da
            nova política.
          </p>
        </Section>

        <Section title="12. Contato e Encarregado (DPO)">
          <p>
            Para dúvidas, solicitações ou reclamações relacionadas à
            privacidade:
          </p>
          <ul className="mt-2 space-y-1 list-disc pl-5 text-muted-foreground">
            <li>
              E-mail:{" "}
              <strong className="text-foreground">
                privacidade@noripay.com.br
              </strong>
            </li>
            <li>
              Você também pode contatar a{" "}
              <strong className="text-foreground">
                Autoridade Nacional de Proteção de Dados (ANPD)
              </strong>{" "}
              em <strong className="text-foreground">www.gov.br/anpd</strong>.
            </li>
          </ul>
        </Section>

        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center">
            Esta Política de Privacidade é regida pelas leis da República
            Federativa do Brasil. Foro: Comarca de São Paulo — SP.
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="rounded-xl gap-2" asChild>
          <Link to="/configuracoes">
            <ArrowLeft className="h-4 w-4" />
            Voltar às Configurações
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-semibold text-foreground text-base">{title}</h2>
      <div className="text-sm text-muted-foreground">{children}</div>
    </div>
  );
}
