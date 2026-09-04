import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Heart, Truck, Sparkles } from "lucide-react";
import { shopService } from "@/api/shopService";
import { useCart } from "@/context/CartContext";
import { useShopSearch } from "@/context/ShopSearchContext";
import type { ArticlePublic } from "@/types/shop.types";
import { Button } from "@/components/ui/button";
import { ArtisanBanner } from "@/components/shop/ArtisanBanner";
import { getCategoryIcon, AllCategoriesIcon } from "@/lib/categoryIcons";
import { formatCurrency } from "@/lib/formatters";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useClientAuth } from "@/context/ClientAuthContext"; 

function ProductCard({ article, onAdd , isAuthenticated}: { article: ArticlePublic; onAdd: (a: ArticlePublic) => void ; isAuthenticated: boolean }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-shadow duration-300",
        "hover:shadow-xl hover:ring-2 hover:ring-rose-600"
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-3xl bg-gray-100">
        {article.imageUrls.length > 0 ? (
          <img
            src={article.imageUrls[0]}
            alt={article.nom}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-300">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}

        <div className="absolute left-3 top-3 z-[1] flex flex-col gap-1">
          {!article.disponible && (
            <span className="rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              Épuisé
            </span>
          )}
        </div>

        {isAuthenticated && (<motion.button
          whileTap={{ scale: 0.85 }}
          whileHover={{ scale: 1.1 }}
          type="button"
          onClick={() => setIsFavorite((prev) => !prev)}
          className="absolute bottom-3 right-3 z-[1] flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-colors hover:bg-white"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
            )}
          />
        </motion.button> )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">{article.categorieNom}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{article.nom}</p>
        <p className="text-base font-bold text-rose-700">{formatCurrency(article.prixVente)}</p>

        <Button
          size="sm"
          disabled={!article.disponible}
          onClick={() => onAdd(article)}
          className={cn(
            "w-full rounded-full py-2.5 font-medium shadow-sm transition-all",
            "bg-rose-700 text-white hover:bg-rose-800 hover:shadow-md",
            "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          )}
        >
          {article.disponible ? "Ajouter au panier" : "Épuisé"}
        </Button>
      </div>
    </motion.div>
  );
}

export function ShopCatalogPage() {
  const { addToCart } = useCart();
  const { search } = useShopSearch();
  const { isAuthenticated } = useClientAuth();
  const [articles, setArticles] = useState<ArticlePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categorieFilter, setCategorieFilter] = useState<string>("Toutes");

  // Variantes d'animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  useEffect(() => {
    async function load() {
      try {
        const page = await shopService.findArticles({ size: 200 });
        setArticles(page.content);
      } catch (error) {
        console.error("Erreur lors du chargement du catalogue :", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(articles.map((a) => a.categorieNom))),
    [articles]
  );

  const previewPhotos = useMemo(
    () =>
      articles
        .filter((a) => a.imageUrls.length > 0)
        .slice(0, 3)
        .map((a) => a.imageUrls[0]),
    [articles]
  );

  const heroImage = previewPhotos[0] ?? "/images/hero-placeholder.jpg";

  const filtered = articles.filter((a) => {
    const matchSearch = a.nom.toLowerCase().includes(search.toLowerCase());
    const matchCategorie = categorieFilter === "Toutes" || a.categorieNom === categorieFilter;
    return matchSearch && matchCategorie;
  });

  function handleAddToCart(article: ArticlePublic) {
    addToCart(article);
    notify.success(`${article.nom} ajouté au panier.`);
  }

  function scrollToCatalogue() {
    document.getElementById("catalogue")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="space-y-0">
      {/* HERO — inspiré Glowora, palette rose/noir dédiée à cette section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 to-pink-100 px-6 py-12 sm:px-10 sm:py-16">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          {/* Colonne gauche : texte + CTA + confiance */}
          <div className="text-center lg:text-left">
            <span className="text-xs font-semibold uppercase tracking-widest text-rose-600">
              Nouvelle collection
            </span>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              <span className="text-gray-900">Révélez tout le charme</span> <br />
              <span className="inline-block bg-gradient-to-r from-pink-500 to-rose-500 bg-clip-text text-transparent">
                du fait main
              </span>
            </h1>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                onClick={scrollToCatalogue}
                className="rounded-full bg-gray-900 px-6 py-5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:scale-[1.03] hover:bg-rose-600"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Voir le catalogue
              </Button>

              <a
                href="#catalogue"
                className="text-sm font-medium text-gray-700 underline underline-offset-4 transition-colors duration-300 hover:text-rose-600"
              >
                Découvrir notre histoire
              </a>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-xs text-gray-500 lg:justify-start">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-500" />
                Fait main artisanalement
              </span>
              <span className="flex items-center gap-1.5">
                <Truck className="h-3.5 w-3.5 text-rose-500" />
                Livraison soignée
              </span>
              <span className="flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                Pièces uniques
              </span>
            </div>
          </div>

          {/* Colonne droite : photo produit + badge flottant */}
          <div className="relative mx-auto w-full max-w-sm">
            <img
              src={heroImage}
              alt="Création artisanale Hiba mise en avant"
              className="h-72 w-full rounded-3xl object-cover shadow-xl sm:h-96 text-gray-900"
            />
            <div className="absolute -right-4 -top-4 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white text-center shadow-lg sm:-right-6 sm:h-24 sm:w-24">
              <span className="text-sm font-bold text-gray-900 sm:text-base">Nouveau</span>
              <span className="text-[10px] text-gray-500">cette semaine</span>
            </div>
          </div>
        </div>
      </section>

      {/* Badge flottant : texte + aperçu de vraies photos */}
      <div className="relative z-[1] -mt-7 flex justify-center px-4">
        <div className="flex w-full max-w-md items-center gap-3 rounded-full bg-white px-4 py-3 shadow-lg">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-700">
            <Heart className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-gray-900">Fait main, avec soin</p>
            <p className="truncate text-[11px] text-gray-400">Chaque pièce est unique</p>
          </div>

          {previewPhotos.length > 0 && (
            <div className="flex shrink-0 -space-x-3">
              {previewPhotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt=""
                  className="h-8 w-8 rounded-full border-2 border-white object-cover shadow-sm"
                  style={{ zIndex: previewPhotos.length - i }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-10">
        <ArtisanBanner onExplore={scrollToCatalogue} />
      </div>

      <div className="pt-10" id="catalogue">
        <div className="mb-8 flex justify-center gap-5 overflow-x-auto px-2 pb-2 sm:gap-8">
          {[{ label: "All", value: "Toutes", Icon: AllCategoriesIcon }, ...categories.map((cat) => ({
            label: cat,
            value: cat,
            Icon: getCategoryIcon(cat),
          }))].map(({ label, value, Icon }) => {
            const isActive = categorieFilter === value;
            return (
              <button
                key={value}
                onClick={() => setCategorieFilter(value)}
                className={cn(
                  "flex shrink-0 flex-col items-center gap-2 rounded-2xl px-3 py-2 transition-colors",
                  isActive ? "bg-rose-50" : "hover:bg-gray-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-rose-700 text-white" : "bg-gray-100 text-gray-500"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs font-medium",
                    isActive ? "text-rose-700" : "text-gray-500"
                  )}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </div>

        {isLoading ? (
          <p className="text-center text-sm text-gray-400">Chargement du catalogue...</p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-gray-400">Aucun article ne correspond à votre recherche.</p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            key={categorieFilter + search} // Réanime proprement lors du changement de filtre
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          >
            {filtered.map((article) => (
              <motion.div key={article.id} variants={itemVariants}>
                <ProductCard article={article} onAdd={handleAddToCart} isAuthenticated={isAuthenticated} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}