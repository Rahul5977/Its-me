import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Blog pages load on demand so the portfolio's first paint stays lean.
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const BlogWrite = lazy(() => import("./pages/BlogWrite"));

const App = () => (
  <TooltipProvider>
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{ className: "!bg-card !border-white/10 !font-sans", style: { fontFamily: "Inter, sans-serif" } }}
    />
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/write" element={<BlogWrite />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  </TooltipProvider>
);

export default App;
