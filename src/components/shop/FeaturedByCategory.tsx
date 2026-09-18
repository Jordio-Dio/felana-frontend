import { useEffect, useState, useMemo } from "react";
import { shopService } from "@/api/shopService";
import type { ArticlePublic } from "@/types/shop.types";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useClientAuth } from "@/context/ClientAuthContext";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface CategoryHighlight {
  categorie: string;
  article: ArticlePublic;
}

export function FeaturedByCategory() {
  const { addToCart } = useCart();
  const { isAuthenticated } = useClientAuth();
  const [articles, setArticles] = useState<ArticlePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function load() {
      try {
        const page = await shopService.findArticles({ size: 200 });
        const sortedArticles = page.content.sort((a, b) => 
           b.id - a.id
         );
         setArticles(sortedArticles);
      } catch (error) {
        console.error("Erreur lors du chargement des articles :", error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const featuredArticles = useMemo<CategoryHighlight[]>(() => {
    const categoryMap = new Map<string, ArticlePublic>();
    
    // Récupère le dernier article de chaque catégorie
    articles.forEach((article) => {
      if (!categoryMap.has(article.categorieNom)) {
        categoryMap.set(article.categorieNom, article);
      }
    });

    return Array.from(categoryMap.entries()).map(([categorie, article]) => ({
      categorie,
      article,
    }));
  }, [articles]);

  function handleAddToCart(article: ArticlePublic) {
    addToCart(article);
    notify.success(`${article.nom} ajouté au panier.`);
  }

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="text-center mb-10">
        <span className="text-xs font-semibold uppercase tracking-widest text-[#8a6f56]">
          Nos créations
        </span>
        <h2 className="mt-2 text-3xl font-bold text-[#3b2f24] sm:text-4xl">
          Dernières créations par catégorie
        </h2>
        <p className="mt-3 text-[#8a8276] max-w-2xl mx-auto">
          Découvrez nos pièces les plus récentes, une par catégorie, fabriquées avec soin et expertise.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-[#e2d2bf] bg-white">
              <Skeleton className="aspect-square w-full rounded-t-3xl" />
              <div className="space-y-3 p-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      ) : featuredArticles.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#e2d2bf] bg-[#f6efe4] p-10 text-center">
          <p className="text-base font-medium text-[#3b2f24]">Aucun article disponible pour le moment.</p>
          <p className="mt-2 text-sm text-[#8a8276]">Revenez bientôt pour découvrir de nouvelles créations.</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {featuredArticles.map(({ categorie, article }) => {
            const isFavorite = favorites.has(article.id);

            return (
              <motion.div key={article.id} variants={itemVariants}>
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-3xl border border-[#e2d2bf] bg-white shadow-[var(--shadow-soft)] transition-all duration-300 ease-out",
                    "hover:shadow-lg hover:ring-2 hover:ring-[#8a6f56]/20 hover:-translate-y-1"
                  )}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden rounded-t-3xl bg-[#f6efe4]">
                    {article.imageUrls.length > 0 ? (
                      <img
                        src={article.imageUrls[0]}
                        alt={article.nom}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#d4c4b0]">
                        <ShoppingBag className="h-12 w-12" />
                      </div>
                    )}

                    {/* Badge catégorie */}
                    <div className="absolute left-3 top-3 z-[1] flex flex-col gap-1">
                      <span className="rounded-full bg-[#8a6f56] px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {categorie}
                      </span>
                      {!article.disponible && (
                        <span className="rounded-full bg-gray-900/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          Épuisé
                        </span>
                      )}
                    </div>

                    {/* Bouton favori */}
                    {isAuthenticated && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            whileHover={{ scale: 1.1 }}
                            type="button"
                            onClick={() => toggleFavorite(article.id)}
                            className="absolute bottom-3 right-3 z-[1] flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-md transition-colors duration-200 ease-out hover:bg-white"
                            aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                          >
                            <Heart
                              className={cn(
                                "h-5 w-5 transition-colors",
                                isFavorite ? "fill-red-500 text-red-500" : "text-[#d8b7a6]"
                              )}
                            />
                          </motion.button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>

                  {/* Contenu */}
                  <div className="space-y-2 p-4">
                    <p className="text-[11px] uppercase tracking-widest font-semibold text-[#8a6f56]">
                      {categorie}
                    </p>
                    <p className="truncate text-sm font-semibold text-[#3b2f24] leading-snug">
                      {article.nom}
                    </p>
                    <p className="line-clamp-2 text-xs text-[#8a8276]">
                      {article.description || "Pièce unique faite main"}
                    </p>
                    <p className="text-base font-bold text-[#8a6f56]">
                      {formatCurrency(article.prixVente)}
                    </p>

                    <Button
                      size="sm"
                      disabled={!article.disponible}
                      onClick={() => handleAddToCart(article)}
                      className={cn(
                        "w-full rounded-full py-2.5 font-medium shadow-sm transition-all duration-200 ease-out",
                        "bg-[#8a6f56] text-white hover:bg-[#6f5a45] hover:shadow-md",
                        "disabled:bg-[#d8b7a6] disabled:text-[#8a8276] disabled:shadow-none"
                      )}
                    >
                      {article.disponible ? "Ajouter au panier" : "Épuisé"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </section>
  );
}
