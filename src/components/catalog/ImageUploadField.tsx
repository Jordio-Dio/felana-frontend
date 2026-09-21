import { useRef, useState } from "react";
import { ImagePlus, Loader2, X, Star } from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ImageUploadFieldProps {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

/**
 * Gère l'upload de plusieurs photos par article aux couleurs de VALISOA.
 * La première image de la liste sert de couverture.
 */
export function ImageUploadField({
  imageUrls,
  onChange,
  maxImages = 5,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (imageUrls.length + files.length > maxImages) {
      notify.error(`Maximum ${maxImages} photos par article.`);
      return;
    }

    setIsUploading(true);
    try {
      const uploads = await Promise.all(
        Array.from(files).map((file) => uploadImageToCloudinary(file))
      );
      onChange([...imageUrls, ...uploads]);
      notify.success(`${uploads.length} photo(s) ajoutée(s).`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Échec de l'envoi.";
      notify.error(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(index: number) {
    onChange(imageUrls.filter((_, i) => i !== index));
  }

  function setCover(index: number) {
    if (index === 0) return;
    const reordered = [...imageUrls];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    onChange(reordered);
  }

  return (
    <div className="space-y-2.5">
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-5">
        {imageUrls.map((url, index) => (
          <div
            key={url}
            className="group relative aspect-square overflow-hidden rounded-2xl border border-[#F2E6E1] bg-[#FAF6F4] shadow-sm transition-all hover:shadow-md"
          >
            <img src={url} alt={`Photo ${index + 1}`} className="h-full w-full object-cover" />

            {/* Badge de couverture pour la première image */}
            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-lg bg-[#8B3A1C] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                Couverture
              </span>
            )}

            {/* Incrustation d'actions au survol */}
            <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-stone-900/40 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
              {index !== 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => setCover(index)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-stone-700 shadow-sm transition-transform hover:scale-110 hover:bg-[#FAF6F4] hover:text-[#8B3A1C]"
                    >
                      <Star className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="rounded-lg bg-stone-900 text-[11px] text-white">
                    Définir comme couverture
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="flex h-7 w-7 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm transition-transform hover:scale-110 hover:bg-rose-50 hover:text-rose-700"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="rounded-lg bg-rose-950 text-[11px] text-white">
                  Supprimer
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        ))}

        {/* Bouton d'ajout d'image */}
        {imageUrls.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-[#F2E6E1] bg-[#FAF6F4]/50 text-stone-400 transition-all duration-200 hover:border-[#8B3A1C]/50 hover:bg-[#FAF6F4] hover:text-[#8B3A1C]",
              isUploading && "pointer-events-none opacity-60"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-[#8B3A1C]" />
            ) : (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-[#8B3A1C] shadow-sm ring-1 ring-[#8B3A1C]/10">
                  <ImagePlus className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-semibold text-stone-600">Ajouter</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-[11px] font-medium text-stone-400">
        {imageUrls.length}/{maxImages} photo(s) — Cliquez sur l'étoile pour définir la couverture.
      </p>
    </div>
  );
}