import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export function ShopFooter() {
  return (
    <footer className="mt-16 border-t border-[#e2d2bf] bg-[#f4ead9]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Colonne 1: Marque */}
          <div className="flex flex-col gap-3">
            <Link to="/shop" className="text-xl font-bold tracking-tight text-[#3b2f24]">
              FELANA
            </Link>
            <p className="text-sm text-[#8a8276]">
              Créations artisanales faites avec amour et passion.
            </p>
          </div>

          {/* Colonne 2: Navigation */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#3b2f24]">Navigation</h3>
            <nav className="flex flex-col gap-2">
              <a href="#hero" className="text-sm text-[#8a8276] transition-colors hover:text-[#8a6f56]">
                Accueil
              </a>
              <a href="#catalogue" className="text-sm text-[#8a8276] transition-colors hover:text-[#8a6f56]">
                Catalogue
              </a>
              <a href="#histoire" className="text-sm text-[#8a8276] transition-colors hover:text-[#8a6f56]">
                Notre histoire
              </a>
            </nav>
          </div>

          {/* Colonne 3: Contact */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#3b2f24]">Contact</h3>
            <div className="flex flex-col gap-2">
              <a 
                href="tel:0381765656" 
                className="flex items-center gap-2 text-sm text-[#8a8276] transition-colors hover:text-[#8a6f56]"
              >
                <Phone className="h-4 w-4" />
                +261 38 17 65 656
              </a>
              <a 
                href="mailto:contact@felana.mg" 
                className="flex items-center gap-2 text-sm text-[#8a8276] transition-colors hover:text-[#8a6f56]"
              >
                <Mail className="h-4 w-4" />
                contact@felana.mg
              </a>
              <div className="flex items-center gap-2 text-sm text-[#8a8276]">
                <MapPin className="h-4 w-4" />
                Toliara, Madagascar
              </div>
            </div>
          </div>

          {/* Colonne 4: Réseaux sociaux */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#3b2f24]">Nous suivre</h3>
            <div className="flex gap-3">
              <a 
                href="https://www.facebook.com/profile.php?id=61582681190380"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ead9c6] text-[#8a6f56] transition-all hover:bg-[#8a6f56] hover:text-white"
                aria-label="Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Séparateur */}
        <div className="mt-8 border-t border-[#e2d2bf]" />

        {/* Copyright et liens légaux */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-center text-xs text-[#8a8276]">
            © {new Date().getFullYear()} FELANA. Tous droits réservés.
          </p>
          <div className="flex gap-4 text-xs text-[#8a8276]">
            <a href="#" className="transition-colors hover:text-[#8a6f56]">
              Conditions d'utilisation
            </a>
            <span>•</span>
            <a href="#" className="transition-colors hover:text-[#8a6f56]">
              Politique de confidentialité
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
