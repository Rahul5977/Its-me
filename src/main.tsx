import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Privacy-friendly visitor analytics (no cookies). Enabled when VITE_GOATCOUNTER is set at build time.
const goatcounter = import.meta.env.VITE_GOATCOUNTER as string | undefined;
// Never on the blog studio: no third-party script should share a page with the unlocked publish token.
const isStudio = /\/blog\/write\/?$/.test(location.pathname);
if (goatcounter && !isStudio) {
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = `https://${goatcounter}.goatcounter.com/count`;
  document.head.appendChild(s);
}

createRoot(document.getElementById("root")!).render(<App />);
