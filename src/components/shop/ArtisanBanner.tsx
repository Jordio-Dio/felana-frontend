import { Star } from "lucide-react";

interface ArtisanBannerProps {
  onExplore?: () => void;
}

/**
 * Bannière promotionnelle "Créations Artisanales Hiba" — remplace la
 * section promo générique par un visuel dédié à la marque. Autonome,
 * ne dépend d'aucune logique métier (fetch, panier) : purement visuel.
 */
export function ArtisanBanner({ onExplore }: ArtisanBannerProps) {
  return (
    <section
      aria-label="Créations artisanales Hiba"
      className="overflow-x-hidden rounded-2xl bg-[#F8E8E8] px-6 py-10 sm:rounded-3xl sm:px-10 sm:py-14"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,0.7fr)] lg:gap-8">
        {/* Zone gauche : texte + CTA */}
        <div className="text-center lg:text-left">
          <h2 className="font-serif text-3xl font-bold leading-tight text-gray-900 sm:text-4xl">
            Créations Artisanales Hiba
          </h2>
          <p className="mt-3 text-lg text-gray-600">Fait main, tissé avec passion</p>

          <button
            type="button"
            onClick={onExplore}
            className="mt-6 inline-block border-b-2 border-gray-900 pb-1 text-sm font-medium text-gray-900 transition-all duration-300 hover:border-rose-500 hover:text-rose-600"
          >
            Explorer la Collection
          </button>
        </div>

        {/* Zone centrale : podium produits avec effet de profondeur */}
        <div className="relative mx-auto h-56 w-full max-w-sm sm:h-72 sm:max-w-md">
          {/* Socle bois */}
          <div className="absolute bottom-0 left-1/2 h-6 w-40 -translate-x-1/2 rounded-full bg-amber-100/70 sm:w-56" />

          <img
            src="/images/sac-blanc.jpg"
            alt="Sac en crochet blanc fait main, avec nœud décoratif"
            className="absolute bottom-4 left-1/2 z-10 h-32 w-32 -translate-x-[85%] rotate-[-8deg] rounded-2xl object-cover shadow-lg transition-transform duration-300 hover:-translate-y-1 sm:h-44 sm:w-44"
          />
          <img
            src="/images/sac-vert.jpg"
            alt="Sac en crochet vert fait main"
            className="absolute bottom-4 left-1/2 z-0 h-28 w-28 translate-x-[10%] rotate-[6deg] rounded-2xl object-cover shadow-md transition-transform duration-300 hover:-translate-y-1 sm:h-40 sm:w-40"
          />
          <img
            src="/images/sac-rose.jpg"
            alt="Sac en crochet rose fait main, pièce vedette"
            className="absolute bottom-6 left-1/2 z-20 h-36 w-36 -translate-x-1/2 rounded-2xl object-cover shadow-xl transition-transform duration-300 hover:-translate-y-1 sm:h-48 sm:w-48"
          />
        </div>

        {/* Zone droite : preuve sociale */}
        <div className="flex flex-col items-center gap-4 lg:items-end">
          <img
            src="/images/createuse.jpg"
            alt="Hiba, créatrice des sacs en crochet artisanaux"
            className="h-16 w-16 rounded-full border-2 border-white object-cover shadow-md sm:h-20 sm:w-20"
          />

          <div className="text-center lg:text-right">
            <p className="text-xl font-bold text-gray-900">10K+</p>
            <p className="text-xs text-gray-500">Happy Customers</p>
          </div>

          <div className="text-center lg:text-right">
            <p className="text-xl font-bold text-gray-900">4.8</p>
            <p className="text-xs text-gray-500">Average Rating</p>
            <div className="mt-1 flex justify-center gap-0.5 lg:justify-end" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              ))}
            </div>
            <span className="sr-only">Note moyenne : 4,8 sur 5 étoiles</span>
          </div>
        </div>
      </div>
    </section>
  );
}