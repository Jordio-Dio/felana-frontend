import { useEffect, useState } from "react";
import { Mail, Phone, MapPin, MessageCircle, BadgeInfo } from "lucide-react";
import { Link } from "react-router-dom";
import { shopService } from "@/api/shopService";
import type { ShopInfo } from "@/types/shop.types";

/** Convertit un numéro malgache "033 67 658 01" en format wa.me (261336765801). */
function toWhatsAppLink(numero: string) {
  const digits = numero.replace(/\D/g, "");
  return digits.startsWith("0") ? digits.replace(/^0/, "261") : digits;
}

export function ShopFooter() {
  const [shopInfo, setShopInfo] = useState<ShopInfo | null>(null);

  useEffect(() => {
    async function loadShopInfo() {
      try {
        const info = await shopService.getShopInfo();
        setShopInfo(info);
      } catch (error) {
        console.error("Erreur lors du chargement des infos boutique :", error);
      }
    }
    loadShopInfo();
  }, []);

  const whatsapp = shopInfo?.whatsapp?.trim() ?? "";
  const email = shopInfo?.email?.trim() ?? "";
  const adresse = shopInfo?.adresse?.trim() ?? "";
  const nifStat = shopInfo?.nifStat?.trim() ?? "";

  // Les 3 numéros de téléphone, affichés sans libellé (remplace la ligne Tél).
  const phoneNumbers = [
    shopInfo?.orangeMoneyNumero?.trim() ?? "",
    shopInfo?.mvolaNumero?.trim() ?? "",
    shopInfo?.airtelMoneyNumero?.trim() ?? "",
  ].filter((numero) => numero !== "");

  return (
    <footer id="contact" className="mt-16 border-t border-[#e2d2bf] bg-[#f4ead9]">
      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {/* Colonne 1: Marque */}
          <div className="flex flex-col gap-3">
            <Link to="/shop" className="text-xl font-bold tracking-tight text-[#3b2f24]">
              {shopInfo?.nom}
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

          {/* Colonne 3: Contact (depuis /v1/public/shop-info) */}
          <div className="flex flex-col gap-3">
            <h3 className="font-semibold text-[#3b2f24]">Contact</h3>
            <div className="flex flex-col gap-2">
              {whatsapp && (
                <a
                  href={`https://wa.me/${toWhatsAppLink(whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-[#8a8276] transition-colors hover:text-[#8a6f56]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp : {whatsapp}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 text-sm text-[#8a8276] transition-colors hover:text-[#8a6f56]"
                >
                  <Mail className="h-4 w-4" />
                  {email}
                </a>
              )}
              {phoneNumbers.map((numero) => (
                <div
                  key={numero}
                  className="flex items-center gap-2 text-sm text-[#8a8276]"
                >
                  <Phone className="h-4 w-4" />
                  {numero}
                </div>
              ))}
              {adresse && (
                <div className="flex items-center gap-2 text-sm text-[#8a8276]">
                  <MapPin className="h-4 w-4" />
                  {adresse}
                </div>
              )}
              {nifStat && (
                <div className="flex items-center gap-2 text-sm text-[#8a8276]">
                  <BadgeInfo className="h-4 w-4" />
                  NIF/STAT : {nifStat}
                </div>
              )}
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
            © {new Date().getFullYear()} {shopInfo?.nom}. Tous droits réservés.
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
