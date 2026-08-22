import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, Heart } from "lucide-react";
import { getCategoryIcon, AllCategoriesIcon } from "@/lib/CategoryIcons"
import { shopService } from "@/api/shopService";
import { useCart } from "@/context/CartContext";
import { useShopSearch } from "@/context/ShopSearchContext";
import type { ArticlePublic } from "@/types/shop.types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

const CATEGORY_TONES = [
  "from-teal-600 to-teal-700",
  "from-emerald-600 to-emerald-700",
  "from-teal-500 to-emerald-600",
  "from-emerald-500 to-teal-600",
];

function ProductCard({ article, onAdd }: { article: ArticlePublic; onAdd: (a: ArticlePublic) => void }) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300",
        "hover:shadow-xl hover:ring-2 hover:ring-teal-600"
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

        <button
          type="button"
          onClick={() => setIsFavorite((prev) => !prev)}
          className="absolute bottom-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-md transition-colors hover:bg-white"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            className={cn(
              "h-4 w-4 transition-colors",
              isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"
            )}
          />
        </button>
      </div>

      <div className="space-y-2 p-4">
        <p className="text-[11px] uppercase tracking-wide text-gray-400">{article.categorieNom}</p>
        <p className="truncate text-sm font-semibold text-gray-900">{article.nom}</p>
        <p className="text-base font-bold text-teal-700">{formatCurrency(article.prixVente)}</p>

        <Button
          size="sm"
          disabled={!article.disponible}
          onClick={() => onAdd(article)}
          className={cn(
            "w-full rounded-full py-2.5 font-medium shadow-sm transition-all",
            "bg-teal-700 text-white hover:bg-teal-800 hover:shadow-md",
            "disabled:bg-gray-200 disabled:text-gray-400 disabled:shadow-none"
          )}
        >
          {article.disponible ? "Ajouter au panier" : "Épuisé"}
        </Button>
      </div>
    </div>
  );
}

export function ShopCatalogPage() {
  const { addToCart } = useCart();
  const { search } = useShopSearch();
  const [articles, setArticles] = useState<ArticlePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categorieFilter, setCategorieFilter] = useState<string>("Toutes");

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

  // Petit aperçu honnête de vraies photos d'articles, pour le badge flottant.
  const previewPhotos = useMemo(
    () =>
      articles
        .filter((a) => a.imageUrls.length > 0)
        .slice(0, 3)
        .map((a) => a.imageUrls[0]),
    [articles]
  );

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
      {/* HERO */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-700 to-emerald-800 px-6 py-12 text-white sm:px-10 sm:py-16">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="animate-hero-title text-3xl font-bold leading-tight sm:text-4xl">
              Découvrez nos créations
              <br />
              artisanales faites main
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm text-teal-50 lg:mx-0">
              Chaque pièce Hiba est pensée et confectionnée à la main, avec des matières
              choisies et du temps donné à chaque détail.
            </p>

            <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                onClick={scrollToCatalogue}
                className="rounded-full bg-white px-6 py-5 text-sm font-semibold text-teal-800 shadow-sm hover:bg-teal-50"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                Voir le catalogue
              </Button>

              <Select value={categorieFilter} onValueChange={setCategorieFilter}>
                <SelectTrigger className="w-48 rounded-full border-white/30 bg-white/10 text-white [&>svg]:text-white">
                  <SelectValue placeholder="Toutes catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Toutes">Toutes catégories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="relative mx-auto flex h-72 w-72 items-center justify-center sm:h-80 sm:w-80">
            <div className="absolute inset-0 rounded-full bg-white/15" />
            <img
              src="/images/createuse.jpg"
              alt="Créatrice Felana au travail"
              className="relative h-64 w-64 rounded-full border-4 border-white/80 object-cover shadow-xl sm:h-72 sm:w-72"
            />
          </div>
        </div>
      </section>

      {/* Badge flottant : texte + aperçu photos (remplace l'ancienne recherche) */}
      <div className="relative z-[1] -mt-7 flex justify-center px-4">
        <div className="flex w-full max-w-md items-center gap-3 rounded-full bg-white px-4 py-3 shadow-lg">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
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
                  isActive ? "bg-teal-50" : "hover:bg-gray-50"
                )}
              >
                <span
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-full transition-colors",
                    isActive ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-xs font-medium",
                    isActive ? "text-teal-700" : "text-gray-500"
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((article) => (
              <ProductCard key={article.id} article={article} onAdd={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}