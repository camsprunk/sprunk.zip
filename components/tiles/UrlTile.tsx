interface UrlTileProps {
  url: string;
  screenshotUrl?: string;
  title?: string;
  favicon?: string;
}

export default function UrlTile({ url, screenshotUrl, title, favicon }: UrlTileProps) {
  const domain = (() => {
    try { return new URL(url).hostname.replace('www.', ''); }
    catch { return url; }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      onClick={e => e.stopPropagation()}
    >
      {screenshotUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={screenshotUrl}
          alt={title ?? url}
          className="w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="w-full h-40 bg-neutral-50 flex flex-col items-center justify-center gap-2">
          {favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={favicon} alt="" className="w-6 h-6 opacity-50" />
          ) : (
            <span className="text-neutral-200 text-2xl">↗</span>
          )}
          <span className="text-[11px] text-neutral-300 tracking-wide">{domain}</span>
        </div>
      )}
    </a>
  );
}
