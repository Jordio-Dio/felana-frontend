import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from "@/components/ui/sonner";
import { initAnalytics } from "@/lib/analytics";
import './index.css'
import App from './App.tsx'

initAnalytics();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster 
    richColors 
    position="top-right" 
    toastOptions={{
      classNames: {
        error: "!text-white",
        success: "!text-white"
      }
    }}
    />
  </StrictMode>,
);
