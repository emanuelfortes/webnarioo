export function FinalCta({ bookingUrl }: { bookingUrl: string }) {
  if (!bookingUrl) {
    return (
      <p className="mx-auto max-w-[760px] p-2.5 text-center text-[.9rem] text-[#8b95ab]">
        Recebemos sua aplicação. Entraremos em contato pelo WhatsApp para combinar o horário.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-[760px] p-2.5 text-center">
      <a
        href={bookingUrl}
        target="_blank"
        // B9 da auditoria: link externo saía sem `rel`.
        rel="noopener noreferrer"
        className="mt-3.5 inline-block rounded-xl bg-[#16a34a] px-[34px] py-4 text-[1.05rem] font-extrabold text-white no-underline"
      >
        📅 AGENDAR MEU DIAGNÓSTICO
      </a>
    </div>
  );
}
