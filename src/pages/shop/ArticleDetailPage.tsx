import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { isAxiosError } from "axios";
import { ArrowLeft, ImageOff, PackageX, RotateCcw, ShoppingBag } from "lucide-react";
import { shopService } from "@/api/shopService";
import { useCart } from "@/context/CartContext";
import type { ArticlePublic } from "@/types/shop.types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/formatters";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

type LoadError = "notfound" | "error";

type FetchState =
  | { status: "loading"; articleId: number; retryToken: number }
  | { status: "success"; articleId: number; retryToken: number; article: ArticlePublic }
  | { status: LoadError; articleId: number; retryToken: number };

function BackToCatalog({ className }: { className?: string }) {
  return (
    <Link
      to="/shop"
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 transition-colors hover:text-[#D9886A]",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      Retour au catalogue
    </Link>
  );
}

function LoadingSkeleton() {
  return (
    <div className="pb-4">
      <BackToCatalog />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galerie */}
        <div className="space-y-3">
          <Skeleton className="aspect-square w-full rounded-3xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 shrink-0 rounded-2xl sm:h-20 sm:w-20" />
            ))}
          </div>
        </div>

        {/* Infos produit */}
        <div className="space-y-4">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="rounded-3xl border border-[#F2E6E1] bg-white p-5 sm:p-6">
            <Skeleton className="h-3 w-28" />
            <div className="mt-4 space-y-2.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error, onRetry }: { error: LoadError; onRetry: () => void }) {
  const isNotFound = error === "notfound";

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FDEEE9]">
        {isNotFound ? (
          <PackageX className="h-9 w-9 text-[#8B3A1C] stroke-[2.2]" />
        ) : (
          <RotateCcw className="h-9 w-9 text-[#8B3A1C] stroke-[2.2]" />
        )}
      </div>

      <span className="mb-2 inline-block rounded-full bg-[#FAF6F4] px-3 py-1 text-xs font-semibold text-[#8B3A1C]">
        {isNotFound ? "Erreur 404" : "Erreur de chargement"}
      </span>

      <h1 className="text-2xl font-extrabold tracking-tight text-stone-900">
        {isNotFound ? "Article introuvable" : "Impossible de charger l'article"}
      </h1>

      <p className="mt-2 max-w-md text-sm text-stone-500 sm:text-base">
        {isNotFound
          ? "Cet article n'existe pas ou n'est plus disponible dans notre catalogue."
          : "Une erreur est survenue lors du chargement de l'article. Vérifiez votre connexion puis réessayez."}
      </p>

      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
        <Button
          asChild
          className="gap-2 rounded-2xl bg-[#D9886A] px-6 py-5 text-sm font-bold text-white shadow-md shadow-[#D9886A]/20 hover:bg-[#c27558]"
        >
          <Link to="/shop">
            <ArrowLeft className="h-4 w-4" />
            Retour au catalogue
          </Link>
        </Button>

        {!isNotFound && (
          <Button
            variant="outline"
            onClick={onRetry}
            className="gap-2 rounded-2xl border-[#E09F82] px-6 py-5 text-sm font-semibold text-[#D9886A] hover:bg-[#FDEEE9]"
          >
            <RotateCcw className="h-4 w-4" />
            Réessayer
          </Button>
        )}
      </div>
    </div>
  );
}

export function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();

  const [fetchState, setFetchState] = useState<FetchState>({
    status: "loading",
    articleId: Number.NaN,
    retryToken: 0,
  });
  const [selectedImage, setSelectedImage] = useState(0);
  const [retryToken, setRetryToken] = useState(0);

  const articleId = Number(id);
  const isValidId = Number.isInteger(articleId) && articleId > 0;

  // Toujours en haut de page lors de l'arrivée / changement d'article
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [id]);

  useEffect(() => {
    // Id invalide : aucun appel réseau, l'état "introuvable" est dérivé au rendu
    if (!isValidId) return;

    let cancelled = false;

    shopService.findArticleById(articleId).then(
      (data) => {
        if (cancelled) return;
        // La photo de couverture est toujours sélectionnée par défaut
        setSelectedImage(0);
        setFetchState({ status: "success", articleId, retryToken, article: data });
      },
      (err: unknown) => {
        if (cancelled) return;
        setFetchState(
          isAxiosError(err) && err.response?.status === 404
            ? { status: "notfound", articleId, retryToken }
            : { status: "error", articleId, retryToken }
        );
      }
    );

    return () => {
      cancelled = true;
    };
  }, [articleId, isValidId, retryToken]);

  // État effectif : un fetch en cours / périmé (id ou retry différent) affiche le skeleton
  const isFresh =
    fetchState.articleId === articleId && fetchState.retryToken === retryToken;
  const view: FetchState = !isValidId
    ? { status: "notfound", articleId, retryToken }
    : isFresh
      ? fetchState
      : { status: "loading", articleId, retryToken };

  if (view.status === "loading") {
    return <LoadingSkeleton />;
  }

  if (view.status !== "success") {
    return <ErrorState error={view.status} onRetry={() => setRetryToken((t) => t + 1)} />;
  }

  const article = view.article;
  const images = article.imageUrls ?? [];
  const imageIndex = selectedImage < images.length ? selectedImage : 0;
  const currentImage = images[imageIndex];

  function handleAddToCart() {
    addToCart(article);
    notify.success(`${article.nom} ajouté au panier.`);
  }

  return (
    <div className="pb-32 sm:pb-4">
      <BackToCatalog />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* ============================================
            Galerie d'images (Mobile : sous l'image / Desktop : à droite)
           ============================================ */}
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Image principale */}
          <div className="relative aspect-square min-w-0 flex-1 overflow-hidden rounded-3xl border border-[#F2E6E1] bg-[#FAF6F4]">
            {currentImage ? (
              <img
                key={currentImage}
                src={currentImage}
                alt={`${article.nom} — photo ${imageIndex + 1}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-[#D8C4BC]">
                <ImageOff className="h-12 w-12" />
                <span className="text-xs font-bold uppercase tracking-widest">Aucune photo</span>
              </div>
            )}

            {/* Badge statut */}
            {!article.disponible && (
              <span className="absolute left-3 top-3 z-[1] rounded-full bg-stone-900/80 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                Épuisé
              </span>
            )}

            {/* Compteur de photos */}
            {images.length > 1 && (
              <span className="absolute bottom-3 right-3 z-[1] rounded-full bg-stone-900/60 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {imageIndex + 1} / {images.length}
              </span>
            )}
          </div>

          {/* Miniatures cliquables */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1 lg:w-24 lg:flex-col lg:overflow-x-visible lg:pb-0">
              {images.map((url, index) => (
                <button
                  key={`${url}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Afficher la photo ${index + 1} de ${article.nom}`}
                  aria-pressed={index === imageIndex}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200 sm:h-20 sm:w-20 lg:h-24 lg:w-24",
                    index === imageIndex
                      ? "border-[#D9886A] opacity-100 ring-2 ring-[#D9886A]/30"
                      : "border-transparent opacity-60 hover:opacity-100 hover:ring-2 hover:ring-[#D9886A]/30"
                  )}
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ============================================
            Zone d'informations produit
           ============================================ */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#FDEEE9] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#8B3A1C]">
              {article.categorieNom}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                article.disponible ? "bg-emerald-50 text-emerald-700" : "bg-stone-100 text-stone-500"
              )}
            >
              {article.disponible ? "En stock" : "Épuisé"}
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold leading-tight tracking-tight text-stone-900 sm:text-4xl">
              {article.nom}
            </h1>
            <p className="text-3xl font-black text-[#D9886A] sm:text-4xl">
              {formatCurrency(article.prixVente)}
            </p>
          </div>

          {/* CTA Desktop / Tablette */}
          <Button
            disabled={!article.disponible}
            onClick={handleAddToCart}
            className={cn(
              "hidden h-14 w-full gap-2 rounded-2xl bg-[#D9886A] text-base font-bold text-white shadow-lg shadow-[#D9886A]/20 transition-all duration-200 sm:inline-flex",
              "hover:bg-[#c27558] hover:shadow-xl active:scale-[0.98]",
              "disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
            )}
          >
            <ShoppingBag className="h-5 w-5" />
            {article.disponible ? "Ajouter au panier" : "Article épuisé"}
          </Button>

          {/* Description complète */}
          <div className="rounded-3xl border border-[#F2E6E1] bg-white p-5 shadow-xs sm:p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Description
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-stone-600 sm:text-base">
              {article.description?.trim()
                ? article.description
                : "Aucune description disponible pour le moment."}
            </p>
          </div>

          {/* Détails du produit */}
          <div className="rounded-3xl border border-[#F2E6E1] bg-white p-5 shadow-xs sm:p-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-stone-400">
              Détails du produit
            </h2>
            <dl className="mt-3 divide-y divide-[#F5EDE9] text-sm">
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-stone-500">Référence</dt>
                <dd className="font-semibold text-stone-800">{article.reference ?? "—"}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-stone-500">Catégorie</dt>
                <dd className="font-semibold text-stone-800">{article.categorieNom}</dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-stone-500">Disponibilité</dt>
                <dd className={cn("font-semibold", article.disponible ? "text-emerald-600" : "text-stone-800")}>
                  {article.disponible ? "En stock" : "Épuisé"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-stone-500">Photos</dt>
                <dd className="font-semibold text-stone-800">
                  {images.length} photo{images.length > 1 ? "s" : ""}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* ============================================
          CTA STICKY — Mobile uniquement, toujours accessible sans scroller
         ============================================ */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#F2E6E1] bg-white/95 px-4 py-3 shadow-[0_-6px_20px_rgba(74,46,27,0.08)] backdrop-blur-md sm:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Prix</p>
            <p className="truncate text-lg font-extrabold leading-tight text-[#D9886A]">
              {formatCurrency(article.prixVente)}
            </p>
          </div>

          <Button
            disabled={!article.disponible}
            onClick={handleAddToCart}
            className={cn(
              "h-12 flex-1 gap-2 rounded-2xl bg-[#D9886A] text-sm font-bold text-white shadow-md shadow-[#D9886A]/20 transition-all duration-200",
              "hover:bg-[#c27558] active:scale-[0.98]",
              "disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            {article.disponible ? "Ajouter au panier" : "Épuisé"}
          </Button>
        </div>
      </div>
    </div>
  );
}
