// Animated stickers: Google's Noto animated emoji (CC BY 4.0), served from Google Fonts' CDN.
// In markdown a sticker is just an image whose alt text starts with "sticker", e.g.
//   ![sticker: fire](https://fonts.gstatic.com/s/e/notoemoji/latest/1f525/512.webp)

export interface Sticker {
  name: string;
  code: string;
}

export const stickerUrl = (code: string) => `https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/512.webp`;

export const STICKER_PACKS: { label: string; items: Sticker[] }[] = [
  {
    label: "vibes",
    items: [
      { name: "fire", code: "1f525" },
      { name: "rocket", code: "1f680" },
      { name: "sparkles", code: "2728" },
      { name: "party", code: "1f973" },
      { name: "confetti", code: "1f389" },
      { name: "100", code: "1f4af" },
      { name: "star-struck", code: "1f929" },
      { name: "muscle", code: "1f4aa" },
      { name: "clap", code: "1f44f" },
      { name: "raised-hands", code: "1f64c" },
      { name: "thumbs-up", code: "1f44d" },
    ],
  },
  {
    label: "feels",
    items: [
      { name: "joy", code: "1f602" },
      { name: "rofl", code: "1f923" },
      { name: "smile", code: "1f604" },
      { name: "wink", code: "1f609" },
      { name: "heart-eyes", code: "1f60d" },
      { name: "cool", code: "1f60e" },
      { name: "thinking", code: "1f914" },
      { name: "mind-blown", code: "1f92f" },
      { name: "melting", code: "1fae0" },
      { name: "sweat", code: "1f605" },
      { name: "cry", code: "1f62d" },
      { name: "skull", code: "1f480" },
      { name: "sleepy", code: "1f634" },
      { name: "yawn", code: "1f971" },
      { name: "angry", code: "1f621" },
      { name: "see-no-evil", code: "1f648" },
    ],
  },
  {
    label: "dev life",
    items: [
      { name: "robot", code: "1f916" },
      { name: "brain", code: "1f9e0" },
      { name: "bulb", code: "1f4a1" },
      { name: "bug", code: "1f41b" },
      { name: "gear", code: "2699_fe0f" },
      { name: "zap", code: "26a1" },
      { name: "eyes", code: "1f440" },
      { name: "check", code: "2705" },
      { name: "cross", code: "274c" },
      { name: "warning", code: "26a0_fe0f" },
      { name: "hourglass", code: "23f3" },
      { name: "alarm", code: "23f0" },
      { name: "graph", code: "1f4c8" },
      { name: "trophy", code: "1f3c6" },
      { name: "target", code: "1f3af" },
    ],
  },
  {
    label: "daily",
    items: [
      { name: "coffee", code: "2615" },
      { name: "pizza", code: "1f355" },
      { name: "sun", code: "1f31e" },
      { name: "moon", code: "1f31b" },
      { name: "rain", code: "1f327_fe0f" },
      { name: "rainbow", code: "1f308" },
      { name: "plant", code: "1f331" },
      { name: "earth", code: "1f30d" },
      { name: "heart", code: "2764_fe0f" },
      { name: "wave", code: "1f44b" },
      { name: "pray", code: "1f64f" },
      { name: "dog", code: "1f415" },
      { name: "cat", code: "1f63a" },
      { name: "unicorn", code: "1f984" },
      { name: "turtle", code: "1f422" },
      { name: "butterfly", code: "1f98b" },
    ],
  },
];
