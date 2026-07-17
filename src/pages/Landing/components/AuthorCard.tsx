export function AuthorCard() {
  return (
    <div className="mb-7 flex items-center gap-3.5 rounded-xl bg-white p-3.5 text-[#111]">
      <img
        src="/foto.jpg"
        alt=""
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
        className="h-[52px] w-[52px] rounded-full bg-[#ddd] object-cover"
      />
      <div>
        <b className="block text-[.98rem]">ACEV</b>
        <span className="text-[.82rem] leading-[1.35] text-[#555]">
          Especialistas em captação de clientes pelo Google para escritórios de advocacia: Ads, SEO e presença local
        </span>
      </div>
    </div>
  );
}
