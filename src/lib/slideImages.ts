import { PitchDeck, Slide } from "../types";

const IMAGE_TIMEOUT_MS = 12000;
const IMAGE_ATTEMPTS = 2;
const RETRY_DELAY_MS = 600;

const CURATED_IMAGE_URLS = [
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=960&h=540&q=80",
  "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=960&h=540&q=80",
];

function getSlideImageSeed(slide: Slide, slideNumber: number) {
  return Math.abs(
    `${slide.title}-${slide.imagePrompt}-${slideNumber}`
      .split("")
      .reduce((hash, char) => ((hash << 5) - hash + char.charCodeAt(0)) | 0, 0)
  );
}

export function getSlideImageUrls(slide: Slide, slideNumber: number, width = 960, height = 540) {
  if (slide.imageUrl) return [slide.imageUrl];

  const prompt = encodeURIComponent(slide.imagePrompt);
  const seed = getSlideImageSeed(slide, slideNumber);

  return [
    `https://gen.pollinations.ai/image/${prompt}?width=${width}&height=${height}&seed=${seed}&model=flux&enhance=true&nologo=true`,
    `https://image.pollinations.ai/prompt/${prompt}?width=${width}&height=${height}&seed=${seed}&model=flux&enhance=true&noLogo=true`,
  ];
}

export function preloadImage(url: string, timeoutMs = 30000) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const timeout = window.setTimeout(() => {
      image.src = "";
      reject(new Error("Image generation timed out."));
    }, timeoutMs);

    image.onload = () => {
      window.clearTimeout(timeout);
      resolve(url);
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("Image failed to load."));
    };
    image.referrerPolicy = "no-referrer";
    image.src = url;
  });
}

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function withRetryParam(url: string, attempt: number) {
  if (attempt === 0) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}retry=${attempt}`;
}

function createLocalImageDataUrl(slide: Slide, slideNumber: number) {
  const palette = [
    ["#0f172a", "#0f766e", "#38bdf8"],
    ["#111827", "#be123c", "#f59e0b"],
    ["#020617", "#4338ca", "#14b8a6"],
    ["#18181b", "#0ea5e9", "#84cc16"],
  ][slideNumber % 4];

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="${palette[0]}"/>
          <stop offset="0.58" stop-color="${palette[1]}"/>
          <stop offset="1" stop-color="${palette[2]}"/>
        </linearGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="24"/></filter>
      </defs>
      <rect width="960" height="540" fill="url(#bg)"/>
      <circle cx="210" cy="160" r="150" fill="#ffffff" opacity="0.16" filter="url(#blur)"/>
      <circle cx="760" cy="360" r="190" fill="#020617" opacity="0.28" filter="url(#blur)"/>
      <g opacity="0.38">
        <rect x="96" y="98" width="250" height="138" rx="26" fill="#ffffff"/>
        <rect x="388" y="98" width="210" height="138" rx="26" fill="#ffffff"/>
        <rect x="640" y="98" width="224" height="138" rx="26" fill="#ffffff"/>
        <rect x="96" y="282" width="344" height="154" rx="30" fill="#ffffff"/>
        <rect x="482" y="282" width="382" height="154" rx="30" fill="#ffffff"/>
      </g>
    </svg>
  `.trim();

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function getCuratedImageUrl(slideNumber: number) {
  return CURATED_IMAGE_URLS[(slideNumber - 1) % CURATED_IMAGE_URLS.length];
}

export async function resolveSlideImage(slide: Slide, slideNumber: number) {
  const imageUrls = getSlideImageUrls(slide, slideNumber);

  for (let attempt = 0; attempt < IMAGE_ATTEMPTS; attempt++) {
    for (const imageUrl of imageUrls) {
      try {
        return await preloadImage(withRetryParam(imageUrl, attempt), IMAGE_TIMEOUT_MS);
      } catch {
        // Try the next provider URL.
      }
    }

    if (attempt < IMAGE_ATTEMPTS - 1) {
      await wait(RETRY_DELAY_MS * (attempt + 1));
    }
  }

  try {
    return await preloadImage(getCuratedImageUrl(slideNumber), IMAGE_TIMEOUT_MS);
  } catch {
    return await preloadImage(createLocalImageDataUrl(slide, slideNumber), IMAGE_TIMEOUT_MS);
  }
}

export async function resolveDeckImages(deck: PitchDeck) {
  const slides = [];

  for (let index = 0; index < deck.slides.length; index++) {
    const slide = deck.slides[index];
    slides.push({
      ...slide,
      imageUrl: await resolveSlideImage(slide, index + 1),
    });
  }

  return { ...deck, slides };
}
