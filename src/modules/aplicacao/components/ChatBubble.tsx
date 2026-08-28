interface ChatBubbleProps {
  text: string;
  me: boolean;
}

export function ChatBubble({ text, me }: ChatBubbleProps) {
  return (
    <div className={`mb-[18px] flex animate-fadeIn gap-3 ${me ? 'flex-row-reverse' : ''}`}>
      {!me && (
        <div
          aria-hidden="true"
          className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-full bg-[#2a3348] text-[.8rem] font-extrabold text-[#93c5fd]"
        >
          AC
        </div>
      )}
      <div
        className={
          'px-4 py-3 text-[1.02rem] leading-[1.45] ' +
          (me
            ? 'rounded-[14px_4px_14px_14px] bg-[#1d4ed8] text-white'
            : 'rounded-[4px_14px_14px_14px] bg-[#1a2236] text-[#f1f5f9]')
        }
      >
        {text}
      </div>
    </div>
  );
}
