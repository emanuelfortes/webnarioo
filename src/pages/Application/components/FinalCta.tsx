interface FinalCtaProps {
  bookingUrl: string;
}

export function FinalCta({ bookingUrl }: FinalCtaProps) {
  return (
    <div className="mx-auto max-w-[760px] p-2.5 text-center">
      <a
        href={bookingUrl || '#'}
        className="mt-3.5 inline-block rounded-xl bg-[#16a34a] px-[34px] py-4 text-[1.05rem] font-extrabold text-white no-underline"
      >
        📅 AGENDAR MEU DIAGNÓSTICO
      </a>
    </div>
  );
}
