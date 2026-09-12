'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Iniciais para o monograma: duas letras, tiradas das duas primeiras palavras
 * ou das duas primeiras letras quando o nome é uma palavra só.
 */
function iniciais(nome: string): string {
  const palavras = nome.trim().split(/\s+/).filter(Boolean);
  if (!palavras.length) return '?';
  if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
  return (palavras[0][0] + palavras[1][0]).toUpperCase();
}

interface AuthorCardProps {
  name: string;
  bio: string;
}

/**
 * B3 da auditoria: `/foto.jpg` era referenciado mas nunca existiu no projeto,
 * e a landing — a página que recebe o tráfego pago — abria com um ícone de
 * imagem quebrada.
 *
 * Agora a ausência do arquivo cai num monograma, que parece intencional. Assim
 * que `public/foto.jpg` existir, a foto aparece sozinha, sem tocar no código.
 */
export function AuthorCard({ name, bio }: AuthorCardProps) {
  const [semFoto, setSemFoto] = useState(false);

  return (
    <div className="mb-7 flex items-center gap-3.5 rounded-xl bg-white p-3.5 text-[#111]">
      {semFoto ? (
        <div
          aria-hidden="true"
          className="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center rounded-full bg-[#111827] text-[.95rem] font-extrabold tracking-[.5px] text-white"
        >
          {iniciais(name)}
        </div>
      ) : (
        <Image
          src="/foto.jpg"
          alt={name}
          width={52}
          height={52}
          onError={() => setSemFoto(true)}
          className="h-[52px] w-[52px] rounded-full bg-[#ddd] object-cover"
        />
      )}
      <div>
        <b className="block text-[.98rem]">{name}</b>
        <span className="text-[.82rem] leading-[1.35] text-[#555]">{bio}</span>
      </div>
    </div>
  );
}
