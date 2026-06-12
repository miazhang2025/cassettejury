import { toPng } from 'html-to-image';

const GOOGLE_FONTS_CSS =
  'https://fonts.googleapis.com/css2?family=Blaka&family=IBM+Plex+Mono:ital,wght@0,400;0,600;0,700&display=swap';

// html-to-image can't reach cross-origin font files, so inline them as data URLs.
async function buildFontEmbedCSS(): Promise<string> {
  try {
    const cssResponse = await fetch(GOOGLE_FONTS_CSS);
    let css = await cssResponse.text();

    const fontUrls = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com[^)]+)\)/g)].map((m) => m[1]);
    for (const url of fontUrls) {
      try {
        const fontRes = await fetch(url);
        const blob = await fontRes.blob();
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
        css = css.replace(`url(${url})`, `url(${base64})`);
      } catch {
        // skip individual font on error
      }
    }
    return css;
  } catch {
    return '';
  }
}

function dataUrlToFile(dataUrl: string, filename: string): File {
  const [meta, base64] = dataUrl.split(',');
  const mime = meta.match(/data:(.*?);/)?.[1] ?? 'image/png';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], filename, { type: mime });
}

/**
 * Renders a DOM node to PNG and shares it — native share sheet where
 * available (mobile), download everywhere else.
 */
export async function shareNodeAsPng(node: HTMLElement, filename: string): Promise<void> {
  const fontEmbedCSS = await buildFontEmbedCSS();
  // The live node is parked off-screen (left: -10000px). html-to-image clones
  // it with its styles, so the clone must be repositioned into the capture
  // viewport or the output is blank.
  const dataUrl = await toPng(node, {
    pixelRatio: 2,
    fontEmbedCSS,
    cacheBust: true,
    style: { position: 'static', left: '0px', top: '0px' },
  });

  const file = dataUrlToFile(dataUrl, filename);
  if (typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Cassette Jury verdict' });
      return;
    } catch {
      // user cancelled or share failed — fall through to download
    }
  }

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
