import Link from "next/link";

export const metadata = {
  title: "Política de Privacidade | Tabajara's Churrascaria",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 md:px-6">
      <Link href="/" className="text-sm text-[var(--color-accent-cool)] underline">
        Voltar ao início
      </Link>
      <article className="mt-6 rounded-xl border bg-white p-6 shadow-sm md:p-8">
        <h1 className="text-3xl font-extrabold">Política de Privacidade</h1>
        <p className="mt-3 text-sm leading-6 opacity-75">
          Esta é uma política informativa de demonstração. Antes da publicação do sistema,
          o restaurante deverá revisar e substituir este texto por sua versão jurídica definitiva.
        </p>

        <section className="mt-8 space-y-6 text-sm leading-6">
          <div>
            <h2 className="font-bold">Dados coletados</h2>
            <p>
              Para processar pedidos, o sistema poderá tratar nome, telefone, e-mail, endereço de entrega,
              observações do pedido e informações necessárias ao pagamento.
            </p>
          </div>
          <div>
            <h2 className="font-bold">Finalidade</h2>
            <p>
              Os dados são usados para autenticação, atendimento, processamento, pagamento, entrega e acompanhamento do pedido.
            </p>
          </div>
          <div>
            <h2 className="font-bold">Segurança</h2>
            <p>
              O sistema aplica controles de acesso e isolamento de dados por usuário. Credenciais sensíveis de integrações
              permanecem somente no ambiente do servidor.
            </p>
          </div>
          <div>
            <h2 className="font-bold">Direitos do titular</h2>
            <p>
              O titular pode solicitar informações sobre o tratamento de seus dados e exercer os direitos previstos na legislação aplicável.
            </p>
          </div>
          <div>
            <h2 className="font-bold">Contato</h2>
            <p>
              O canal oficial de atendimento e contato do restaurante deverá ser informado aqui antes do lançamento.
            </p>
          </div>
        </section>
      </article>
    </main>
  );
}
