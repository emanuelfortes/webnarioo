import { useEffect, useState } from 'react';
import { sb } from '../../../lib/supabase';
import type { WebinarConfig } from '../../../lib/types';

type FormState = Record<string, string>;

const NUMERIC_FIELDS = ['duration_sec', 'interval_min', 'offer_show_at_sec'];

function fieldLabelClass() {
  return 'mt-3.5 mb-1 block text-[.82rem] font-semibold text-[#6b7280]';
}
function inputClass() {
  return 'w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 text-[.95rem]';
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}

function Field({ label, value, onChange, type = 'text', placeholder }: FieldProps) {
  return (
    <div>
      <label className={fieldLabelClass()}>{label}</label>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass()} />
    </div>
  );
}

export function ConfigTab() {
  const [form, setForm] = useState<FormState>({});
  const [scheduledMessages, setScheduledMessages] = useState('[]');
  const [saveMsg, setSaveMsg] = useState('');

  useEffect(() => {
    sb.from('webinar_config').select('*').eq('id', 1).single().then(({ data }) => {
      if (!data) return;
      const cfg = data as WebinarConfig;
      setForm({
        title: cfg.title, video_url: cfg.video_url,
        duration_sec: String(cfg.duration_sec), interval_min: String(cfg.interval_min), offer_show_at_sec: String(cfg.offer_show_at_sec),
        offer_title: cfg.offer_title, offer_headline: cfg.offer_headline, offer_text: cfg.offer_text,
        cta_label: cfg.cta_label, cta_url: cfg.cta_url, booking_url: cfg.booking_url,
      });
      setScheduledMessages(JSON.stringify(cfg.scheduled_messages || [], null, 2));
    });
  }, []);

  const set = (key: string) => (v: string) => setForm((f) => ({ ...f, [key]: v }));

  const save = async () => {
    let sched;
    try { sched = JSON.parse(scheduledMessages); }
    catch (e) { alert('JSON das mensagens programadas inválido: ' + (e as Error).message); return; }

    const upd: Record<string, unknown> = { scheduled_messages: sched };
    Object.entries(form).forEach(([key, value]) => {
      upd[key] = NUMERIC_FIELDS.includes(key) ? parseInt(value || '0', 10) : value;
    });

    const { error } = await sb.from('webinar_config').update(upd).eq('id', 1);
    setSaveMsg(error ? 'Erro: ' + error.message : '✓ Salvo!');
    setTimeout(() => setSaveMsg(''), 3000);
  };

  return (
    <div>
      <div className="mb-[18px] rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
        <h3>Webinar</h3>
        <Field label="Título" value={form.title ?? ''} onChange={set('title')} />
        <Field label="URL do vídeo (MP4 no Cloudflare R2)" value={form.video_url ?? ''} onChange={set('video_url')} placeholder="https://pub-xxxx.r2.dev/webinar.mp4" />
        <div className="grid grid-cols-3 gap-3.5">
          <Field label="Duração do vídeo (segundos)" value={form.duration_sec ?? ''} onChange={set('duration_sec')} type="number" />
          <Field label="Sessões a cada (minutos)" value={form.interval_min ?? ''} onChange={set('interval_min')} type="number" />
          <Field label="Oferta aparece no segundo" value={form.offer_show_at_sec ?? ''} onChange={set('offer_show_at_sec')} type="number" />
        </div>
        <p className="mt-1.5 text-[.8rem] text-[#6b7280]">Ex: vídeo de 75 min = 4500 segundos. Oferta no minuto 45 = 2700.</p>
      </div>

      <div className="mb-[18px] rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
        <h3>Aba Oferta</h3>
        <Field label="Selo (ex: OFERTA ESPECIAL)" value={form.offer_title ?? ''} onChange={set('offer_title')} />
        <Field label="Headline" value={form.offer_headline ?? ''} onChange={set('offer_headline')} />
        <Field label="Texto" value={form.offer_text ?? ''} onChange={set('offer_text')} />
        <div className="grid grid-cols-[1fr_2fr] gap-3.5">
          <Field label="Texto do botão" value={form.cta_label ?? ''} onChange={set('cta_label')} />
          <Field label="Link do botão (página de aplicação)" value={form.cta_url ?? ''} onChange={set('cta_url')} />
        </div>
        <Field label="Link da agenda (Cal.com/Calendly, usado no final da aplicação)" value={form.booking_url ?? ''} onChange={set('booking_url')} placeholder="https://cal.com/seu-usuario/diagnostico" />
      </div>

      <div className="rounded-xl bg-white p-6 shadow-[0_1px_4px_rgba(0,0,0,.08)]">
        <h3>Mensagens programadas do apresentador</h3>
        <p className="mt-1.5 text-[.8rem] text-[#6b7280]">
          Formato JSON: lista de {'{'}"at": segundos, "name": "quem", "text": "mensagem"{'}'}. Aparecem no chat de todos quando o vídeo atinge o segundo indicado, identificadas como mensagem do apresentador.
        </p>
        <textarea
          value={scheduledMessages}
          onChange={(e) => setScheduledMessages(e.target.value)}
          className="mt-3.5 min-h-[120px] w-full rounded-lg border border-[#d1d5db] px-3 py-2.5 font-mono text-[.85rem]"
        />
        <button onClick={save} className="mt-[18px] rounded-lg bg-[#16a34a] px-[26px] py-3 font-bold text-white">💾 Salvar tudo</button>
        {saveMsg && <span className="ml-3 font-bold text-[#16a34a]">{saveMsg}</span>}
      </div>
    </div>
  );
}
