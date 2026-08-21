import { useEffect, useState } from "react";
import { ShoppingCart, Search } from "lucide-react";
import { shopService } from "@/api/shopService";
import { useCart } from "@/context/CartContext";
import type { ArticlePublic } from "@/types/shop.types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatters";
import { notify } from "@/lib/toast";

export function ShopCatalogPage() {
  const { addToCart } = useCart();
  const [articles, setArticles] = useState<ArticlePublic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const categories = ["Toutes", ...new Set(articles.map((a) => a.categorieNom))];

  const filtered = articles.filter((a) => {
    const matchSearch = a.nom.toLowerCase().includes(search.toLowerCase());
    const matchCategorie = categorieFilter === "Toutes" || a.categorieNom === categorieFilter;
    return matchSearch && matchCategorie;
  });

  function handleAddToCart(article: ArticlePublic) {
    addToCart(article);
    notify.success(`${article.nom} ajouté au panier.`);
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Notre catalogue</h1>
        <p className="mt-1 text-sm text-gray-500">
          Découvrez nos créations et passez commande directement en ligne.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un article..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategorieFilter(cat)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                categorieFilter === cat
                  ? "bg-teal-700 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-gray-400">Chargement du catalogue...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-sm text-gray-400">Aucun article ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((article) => (
            <div
              key={article.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <div className="aspect-square bg-gray-100">
                {article.imageUrls.length > 0 ? (
                  <img
                    src={article.imageUrls[0]}
                    alt={article.nom}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-gray-300">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-gray-900">{article.nom}</p>
                <p className="mt-0.5 text-xs text-gray-400">{article.categorieNom}</p>
                <p className="mt-1.5 text-sm font-semibold text-teal-700">
                  {formatCurrency(article.prixVente)}
                </p>
                <Button
                  size="sm"
                  disabled={!article.disponible}
                  onClick={() => handleAddToCart(article)}
                  className="mt-2 w-full bg-teal-700 text-white hover:bg-teal-800 disabled:bg-gray-200"
                >
                  {article.disponible ? "Ajouter au panier" : "Épuisé"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}