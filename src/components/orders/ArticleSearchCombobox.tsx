import { useState } from "react";
import { Check, ChevronsUpDown, Search } from "lucide-react";
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
          className="w-full justify-between font-normal text-gray-500"
        >
          <span className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Rechercher un article à ajouter...
          </span>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Nom ou référence..." />
          <CommandList>
            <CommandEmpty>Aucun article trouvé.</CommandEmpty>
            <CommandGroup>
              {articles.map((article) => (
                <CommandItem
                  key={article.id}
                  value={`${article.nom} ${article.reference ?? ""}`}
                  onSelect={() => {
                    onSelect(article);
                    setOpen(false);
                  }}
                  disabled={article.quantiteStock <= 0}
                  className="flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span>{article.nom}</span>
                    <span className="text-xs text-gray-400">
                      Stock : {article.quantiteStock}
                      {article.quantiteStock <= 0 && " (épuisé)"}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {formatCurrency(article.prixVente)}
                  </span>
                  <Check className={cn("ml-2 h-4 w-4 opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}