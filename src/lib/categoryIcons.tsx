import { Shirt, Footprints, Gem, Backpack, Watch, Tag, LayoutGrid, type LucideIcon } from "lucide-react";

const ICON_RULES: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["robe", "veste", "chemise", "haut", "pull", "vêtement"], icon: Shirt },
  { keywords: ["chaussure", "sandale", "basket"], icon: Footprints },
  { keywords: ["bijou", "collier", "boucle"], icon: Gem },
  { keywords: ["sac", "pochette", "sacoche"], icon: Backpack },
  { keywords: ["montre", "accessoire"], icon: Watch },
];

/** Devine une icône pertinente à partir du nom de catégorie ; sinon une icône neutre. */
export function getCategoryIcon(nom: string): LucideIcon {
  const lower = nom.toLowerCase();
  const match = ICON_RULES.find((rule) => rule.keywords.some((kw) => lower.includes(kw)));
  return match ? match.icon : Tag;
}

export const AllCategoriesIcon = LayoutGrid;