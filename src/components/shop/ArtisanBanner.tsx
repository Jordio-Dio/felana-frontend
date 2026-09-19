import { Star } from "lucide-react";

interface ArtisanBannerProps {
  onExplore?: () => void;
}

/**
 * Bannière promotionnelle "Créations Artisanales Hiba"
 * Utilise la même transparence sans flou que la section Hero.
 */
export function ArtisanBanner({ onExplore }: ArtisanBannerProps) {
  return (
    <section
      aria-label="Créations artisanales Hiba"
      className="relative overflow-hidden rounded-3xl"
    >
      <div className="relative h-[420px] sm:h-[480px]">
        {/* Photo de fond sans aucun flou */}
        <img
          src="/images/background-artisan.jpg"
          alt="Ambiance atelier créations artisanales Hiba"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Overlay translucide identique au ShopHero */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />

        {/* Contenu principal */}
        <div className="relative z-[1] flex h-full flex-col justify-between p-6 sm:p-10 md:flex-row md:items-center">
          {/* Zone texte + CTA */}
          <div className="max-w-lg text-left">
            <h2 className="font-serif text-3xl font-bold leading-tight text-white sm:text-5xl">
              Créations Artisanales Hiba
            </h2>
            <p className="mt-3 text-sm text-white/90 sm:text-base">
              Fait main, tissé avec passion.
            </p>

            <button
              type="button"
              onClick={onExplore}
              className="mt-6 inline-block rounded-none bg-[#6b4226] px-6 py-3 text-sm font-medium text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-[#54331d]"
            >
              Explorer la Collection
            </button>
          </div>

          {/* Badge Preuve Sociale avec fond translucide sombre */}
          <div className="mt-6 flex items-center gap-4 rounded-xl border border-white/20 bg-black/40 p-4 text-white shadow-lg md:mt-0 sm:gap-6">
            <img
              src="/images/createuse.jpg"
              alt="Hiba, créatrice des sacs en crochet artisanaux"
              className="h-14 w-14 rounded-full border-2 border-white object-cover shadow-sm sm:h-16 sm:w-16"
            />

            <div className="flex gap-6">
              <div>
                <p className="text-lg font-bold text-white sm:text-xl">10K+</p>
                <p className="text-xs text-white/80">Happy Customers</p>
              </div>

              <div>
                <p className="text-lg font-bold text-white sm:text-xl">4.8</p>
                <p className="text-xs text-white/80">Average Rating</p>
                <div className="mt-1 flex gap-0.5" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}