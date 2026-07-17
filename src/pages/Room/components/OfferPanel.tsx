import { toRoute } from '../../../lib/format';

interface OfferPanelProps {
  revealed: boolean;
  offerTitle: string;
  offerHeadline: string;
  offerText: string;
  ctaLabel: string;
  ctaUrl: string;
}

export function OfferPanel({ revealed, offerTitle, offerHeadline, offerText, ctaLabel, ctaUrl }: OfferPanelProps) {
  if (!revealed) {
    return (
      <div className="m-auto p-[30px] text-center text-[.9rem] text-[#6b7280]">
        A oferta especial será liberada durante a apresentação. Continue assistindo 👀
      </div>
    );
  }

  return (
    <div className="m-[18px] rounded-xl border border-[#fde68a] bg-[#fffbeb] p-[22px]">
      <div className="text-[.75rem] font-extrabold tracking-[1px] text-[#c2570b]">{offerTitle}</div>
      <h2 className="my-2 text-xl text-[#111]">{offerHeadline}</h2>
      <p className="mb-4 text-[.92rem] text-[#374151]">{offerText}</p>
      <a
        href={toRoute(ctaUrl)}
        target="_blank"
        rel="noopener"
        className="block rounded-[10px] bg-[#c2570b] py-[15px] text-center font-extrabold text-white no-underline"
      >
        {ctaLabel}
      </a>
    </div>
  );
}
