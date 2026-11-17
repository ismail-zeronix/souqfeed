/** The broadcast exactly as the supplier pasted it, with line numbers. */
export function BroadcastRawText({ rawText }: { rawText: string }) {
  const lines = rawText.split(/\r\n|\r|\n/);

  return (
    <div className="bg-muted/40 max-h-[32rem] overflow-auto rounded-lg border font-mono text-xs leading-6">
      <ol className="min-w-max py-2">
        {lines.map((line, index) => (
          <li key={index} className="flex">
            <span
              aria-hidden
              className="text-muted-foreground w-10 shrink-0 pr-3 text-right select-none"
            >
              {index + 1}
            </span>
            <span className="pr-4 whitespace-pre">{line || " "}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
