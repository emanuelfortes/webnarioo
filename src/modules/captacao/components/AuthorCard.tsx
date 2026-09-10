'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * B3 da auditoria: `/foto.jpg` era referenciado mas nunca existiu no projeto,
 * e a landing — a página que recebe o tráfego pago — abria com um ícone de
 * imagem quebrada.
 *
 * Agora a ausência do arquivo cai num monograma, que parece intencional. Assim
 * que `public/foto.jpg` existir, a foto aparece sozinha, sem tocar no código.
 */
export function AuthorCard() {
  const [semFoto, setSemFoto] = useState(false);

  return (
    <div className="mb-7 flex items-center gap-3.5 rounded-xl bg-white p-3.5 text-[#111]">
      {semFoto ? (
        <div
          aria-hidden="true"
          className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-[#111827] text-[.95rem] font-extrabold tracking-[.5px] text-white"
        >
          AC
        </div>
      ) : (
        <Image
          src="/foto.jpg"
          alt="ACEV"
          width={52}
          height={52}
          onError={() => setSemFoto(true)}
          className="h-[52px] w-[52px] rounded-full bg-[#ddd] object-cover"
        />
      )}
      <div>
        <b className="block text-[.98rem]">ACEV</b>
        <span className="text-[.82rem] leading-[1.35] text-[#555]">
          Especialistas em captação de clientes pelo Google para escritórios de advocacia: Ads, SEO
          e presença local
        </span>
      </div>
    </div>
  );
}
