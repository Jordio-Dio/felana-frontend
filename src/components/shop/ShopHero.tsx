import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageWithSkeleton } from "@/components/shared/ImageWithSkeleton";
import type { ArticlePublic } from "@/types/shop.types";

interface ShopHeroProps {
  highlights: ArticlePublic[];
  onExplore: () => void;
  onSelectCategory: (categorie: string) => void;
}

export function ShopHero({ highlights, onExplore, onSelectCategory }: ShopHeroProps) {
  return (
    <section id="hero" className="relative overflow-hidden rounded-3xl">
      {/* Photo de fond */}
      <div className="relative h-[420px] sm:h-[480px]">
        <img
          src="/images/hero-bg.jpg"
          alt="Ambiance atelier artisanal Hiba Créations"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

        <div className="relative z-[1] flex h-full flex-col justify-center px-6 sm:px-10">
          <h1 className="max-w-lg font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">
            Révélez tout le charme
            <br />
            de fait main
          </h1>
          <p className="mt-3 max-w-md text-sm text-white/90 sm:text-base">
            Artisanal, Unique, Made in Toamasina.
          </p>
          <Button
            onClick={onExplore}
            className="mt-6 w-fit rounded-none bg-[#6b4226] px-6 py-5 text-sm font-medium text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-[#54331d]"
          >
            <ShoppingBag className="mr-2 h-4 w-4" />
            Découvrir la collection
          </Button>
        </div>
      </div>

      {/* Cartes catégories, chevauchent le bas du hero */}
      {highlights.length > 0 && (
        <div className="relative z-[1] -mt-16 grid grid-cols-1 gap-4 px-6 sm:grid-cols-3 sm:px-10">
          {highlights.map((article) => (
            <div
              key={article.id}
              className="overflow-hidden rounded-xl bg-white shadow-lg transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative h-40">
                {article.imageUrls[0] ? (
                  <ImageWithSkeleton
                    src={article.imageUrls[0]}
                    alt={article.nom}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-300">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-base font-semibold text-white">{article.categorieNom}</p>
                  <button
                    onClick={() => onSelectCategory(article.categorieNom)}
                    className="mt-2 w-fit rounded-none bg-[#6b4226]/90 px-4 py-1.5 text-xs font-medium text-white transition-all duration-300 hover:scale-105 hover:bg-[#54331d]"
                  >
                    Acheter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}