import { useState } from "react";
import { Check, ChevronsUpDown, Search, Package, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formatters";
import type { Article } from "@/types/catalog.types";

interface ArticleSearchComboboxProps {
  articles: Article[];
  onSelect: (article: Article) => void;
}

export function ArticleSearchCombobox({ articles, onSelect }: ArticleSearchComboboxProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="h-11 w-full justify-between rounded-xl border-[#F2E6E1] bg-[#FAF6F4]/50 px-3.5 text-xs font-normal text-stone-600 transition-colors hover:bg-[#FAF6F4] hover:text-stone-900 focus:border-[#8B3A1C] focus:ring-1 focus:ring-[#8B3A1C]"
        >
          <span className="flex items-center gap-2 text-stone-500">
            <Search className="h-4 w-4 text-[#8B3A1C]" />
            <span>Rechercher un article par nom ou SKU...</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-40 text-stone-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[--radix-popover-trigger-width] overflow-hidden rounded-2xl border-[#F2E6E1] p-0 shadow-xl"
        align="start"
      >
        <Command className="bg-white">
          <CommandInput
            placeholder="Tapez le nom ou la référence..."
            className="h-10 text-xs text-stone-900 placeholder:text-stone-400 border-b border-[#F2E6E1]"
          />
          <CommandList className="max-h-60 p-1">
            <CommandEmpty className="p-4 text-center text-xs text-stone-400">
              Aucun article trouvé.
            </CommandEmpty>

            <CommandGroup>
              {articles.map((article) => {
                const coverImage = article.imageUrls?.[0];
                const isOutOfStock = article.quantiteStock <= 0;

                return (
                  <CommandItem
                    key={article.id}
                    value={`${article.nom} ${article.reference ?? ""}`}
                    onSelect={() => {
                      onSelect(article);
                      setOpen(false);
                    }}
                    disabled={isOutOfStock}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors cursor-pointer my-0.5",
                      "aria-selected:bg-[#FAF6F4] aria-selected:text-stone-900",
                      isOutOfStock && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Image / Miniature de l'article */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#F2E6E1] bg-[#FAF6F4]">
                        {coverImage ? (
                          <img
                            src={coverImage}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-4 w-4 text-[#8B3A1C]/60" />
                        )}
                      </div>

                      {/* Info de l'article */}
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-stone-900 line-clamp-1">
                          {article.nom}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                          {article.reference && (
                            <span className="font-mono text-[10px] text-stone-400">
                              [{article.reference}]
                            </span>
                          )}
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-medium",
                              isOutOfStock ? "text-rose-600" : "text-stone-500"
                            )}
                          >
                            {isOutOfStock ? (
                              <>
                                <AlertCircle className="h-3 w-3" />
                                Épuisé
                              </>
                            ) : (
                              `Stock : ${article.quantiteStock}`
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prix de vente */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8B3A1C]">
                        {formatCurrency(article.prixVente)}
                      </span>
                      <Check className="h-3.5 w-3.5 opacity-0 text-[#8B3A1C]" />
                    </div>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}