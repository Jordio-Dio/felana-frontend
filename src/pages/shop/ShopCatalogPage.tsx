import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Heart } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ShopHero } from "@/components/shop/ShopHero";

function ProductCard({ article, onAdd, isAuthenticated }: { article: ArticlePublic; onAdd: (a: ArticlePublic) => void; isAuthenticated: boolean }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-[var(--border)] bg-white shadow-[var(--shadow-soft)] transition-all duration-200 ease-out",
        "hover:shadow-xl hover:ring-2 hover:ring-[color:var(--primary)]/20"
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

        {isAuthenticated && (
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileTap={{ scale: 0.85 }}
                whileHover={{ scale: 1.1 }}
                type="button"
                onClick={() => setIsFavorite((prev) => !prev)}
                className="absolute bottom-3 right-3 z-[1] flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-colors duration-200 ease-out hover:bg-white"
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
                  )}
                />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>{isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}</TooltipContent>
          </Tooltip>
        )}
      </div>

      <div className="space-y-2 p-4">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">{article.categorieNom}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{article.nom}</p>
        <p className="text-base font-bold text-[#E86F3D]">{formatCurrency(article.prixVente)}</p>

        <Button
          size="sm"
          disabled={!article.disponible}
          onClick={() => onAdd(article)}
          className={cn(
            "w-full rounded-full py-2.5 font-medium shadow-sm transition-all duration-200 ease-out",
            "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] hover:shadow-md",
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




  const heroHighlights = useMemo(() => {
    const seen = new Set<string>();
    const result: ArticlePublic[] = [];
    // Tri décroissant par id = approximation de la récence (pas de champ date exposé côté vitrine)
    const sorted = [...articles].sort((a, b) => b.id - a.id);
    for (const article of sorted) {
      if (!seen.has(article.categorieNom)) {
        seen.add(article.categorieNom);
        result.push(article);
      }
      if (result.length === 3) break;
    }
    return result;
  }, [articles]);

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
      <ShopHero
        highlights={heroHighlights}
        onExplore={scrollToCatalogue}
        onSelectCategory={(cat) => {
          setCategorieFilter(cat);
          scrollToCatalogue();
        }}
      />

      

      <div id="histoire" className="pt-10">
        <ArtisanBanner onExplore={scrollToCatalogue} />
      </div>

      <div className="pt-10" id="catalogue">
        <div className="mb-8 flex justify-center gap-5 overflow-x-auto px-2 pb-2 sm:gap-8">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 px-3 py-2">
                <Skeleton className="h-11 w-11 rounded-full" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))
          ) : (
            [{ label: "All", value: "Toutes", Icon: AllCategoriesIcon }, ...categories.map((cat) => ({
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
                    isActive ? "bg-[#F5EBE6]" : "hover:bg-gray-50"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                      isActive ? "bg-[#E86F3D] text-white" : "bg-gray-100 text-gray-500"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span
                    className={cn(
                      "whitespace-nowrap text-xs font-medium",
                      isActive ? "text-[#E86F3D]" : "text-gray-500"
                    )}
                  >
                    {label}
                  </span>
                </button>
              );
            })
          )}

        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
                <Skeleton className="aspect-[4/5] w-full rounded-t-3xl rounded-b-none" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-9 w-full rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--muted)] p-10 text-center shadow-sm">
            <p className="text-base font-medium text-[var(--foreground)]">Aucun article ne correspond à votre recherche.</p>
            <p className="mt-2 text-sm text-[var(--muted-foreground)]">Essayez une autre catégorie ou un autre mot-clé.</p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setCategorieFilter("Toutes");
              }}
            >
              Réinitialiser le filtre
            </Button>
          </div>
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