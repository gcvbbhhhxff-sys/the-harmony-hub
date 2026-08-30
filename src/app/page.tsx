export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-8">
      <section className="w-full max-w-xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-primary)]">
          Fundação do projeto
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight">
          Sistema de Delivery
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 opacity-80">
          A fundação técnica está sendo construída em etapas controladas,
          conforme a especificação mestre do projeto.
        </p>
      </section>
    </main>
  );
}
