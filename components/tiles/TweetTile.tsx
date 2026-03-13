'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    twttr?: { widgets?: { load: (el?: HTMLElement) => void } };
  }
}

interface TweetTileProps {
  tweetHtml: string;
  tweetUrl?: string;
}

export default function TweetTile({ tweetHtml, tweetUrl }: TweetTileProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = tweetHtml;

    const loadWidgets = () => {
      window.twttr?.widgets?.load(ref.current ?? undefined);
    };

    if (window.twttr) {
      loadWidgets();
    } else {
      const existing = document.getElementById('twitter-wjs');
      if (!existing) {
        const s = document.createElement('script');
        s.id = 'twitter-wjs';
        s.src = 'https://platform.twitter.com/widgets.js';
        s.async = true;
        s.onload = loadWidgets;
        document.body.appendChild(s);
      } else {
        existing.addEventListener('load', loadWidgets, { once: true });
      }
    }
  }, [tweetHtml]);

  if (!tweetHtml) {
    return (
      <div className="p-4 h-40 flex flex-col items-center justify-center gap-2">
        <p className="text-xs text-neutral-400">Could not load tweet</p>
        {tweetUrl && (
          <a
            href={tweetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline"
            onClick={e => e.stopPropagation()}
          >
            View on X →
          </a>
        )}
      </div>
    );
  }

  return <div ref={ref} className="p-2 overflow-hidden" />;
}
