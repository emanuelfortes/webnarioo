import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Política de privacidade',
  robots: { index: false, follow: true },
};

/**
 * A4 da auditoria. Este texto descreve com precisão o que o sistema realmente
 * coleta e faz — foi escrito a partir do código, não de um modelo genérico.
 *
 * ATENÇÃO: revise com apoio jurídico antes de publicar. Faltam dois dados que
 * só você tem: a razão social e o CNPJ da ACEV, e o e-mail do encarregado.
 */
export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] px-6 py-16 text-[#e5e7eb]">
      <main className="mx-auto max-w-[680px] leading-relaxed">
        <Link href="/" className="text-[.85rem] text-[#93c5fd] no-underline">
          ← Voltar
        </Link>

        <h1 className="mb-2 mt-6 text-[1.8rem] font-bold">Política de privacidade</h1>
        <p className="mb-8 text-[.85rem] text-[#9ca3af]">
          Tratamento de dados pessoais nesta página, conforme a Lei 13.709/2018 (LGPD).
        </p>

        <Secao titulo="Quais dados coletamos">
          <p>
            No formulário de inscrição: <b>nome, e-mail e WhatsApp</b>. Se você preencher a
            aplicação após a sessão, também coletamos <b>cidade do escritório, área de atuação,
            tempo de existência, faturamento mensal médio, investimento em marketing</b> e a sua
            descrição da principal dificuldade em atrair clientes.
          </p>
          <p>
            Registramos ainda dados de uso da sala: horário de entrada, por quanto tempo você
            assistiu e se abriu ou clicou na oferta. As mensagens que você envia no chat ficam
            visíveis para os demais participantes daquela sessão.
          </p>
        </Secao>

        <Secao titulo="Para que usamos">
          <p>
            Para dar acesso à sessão, conduzir o diagnóstico que você solicitou e entrar em contato
            sobre os serviços apresentados. As informações da aplicação servem para preparar essa
            conversa. Os dados de uso são usados de forma agregada, para entender quantas pessoas
            assistiram e até onde.
          </p>
          <p>A base legal é o seu consentimento, dado ao marcar a caixa no formulário.</p>
        </Secao>

        <Secao titulo="Com quem compartilhamos">
          <p>
            Não vendemos nem cedemos seus dados. Eles ficam armazenados na infraestrutura do
            Supabase e a aplicação roda na Vercel — ambos atuam como operadores, apenas hospedando
            os dados em nosso nome.
          </p>
        </Secao>

        <Secao titulo="Seus direitos">
          <p>
            Você pode pedir a qualquer momento confirmação do tratamento, acesso, correção,
            portabilidade, anonimização ou <b>exclusão</b> dos seus dados, e revogar o consentimento.
            Basta escrever para o endereço abaixo — respondemos em até 15 dias.
          </p>
        </Secao>

        <Secao titulo="Contato">
          <p className="rounded-lg border border-dashed border-[#4b5563] p-4 text-[.9rem] text-[#9ca3af]">
            Preencha antes de publicar: razão social e CNPJ da ACEV, e o e-mail do encarregado pelo
            tratamento de dados.
          </p>
        </Secao>
      </main>
    </div>
  );
}

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-2 text-[1.1rem] font-bold text-white">{titulo}</h2>
      <div className="flex flex-col gap-3 text-[.95rem] text-[#d1d5db]">{children}</div>
    </section>
  );
}
