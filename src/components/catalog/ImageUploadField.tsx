import { useRef, useState } from "react";
import { ImagePlus, Loader2, X, Star } from "lucide-react";
import { uploadImageToCloudinary } from "@/lib/cloudinary";
import { notify } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface ImageUploadFieldProps {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
}

/**
 * Gère l'upload de plusieurs photos par article. La première image de la
 * liste sert de couverture (visible dans le tableau et la vitrine) -
 * l'utilisateur peut réordonner en cliquant l'étoile sur une autre photo.
 */
export function ImageUploadField({ imageUrls, onChange, maxImages = 5 }: ImageUploadFieldProps) {
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
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {imageUrls.map((url, index) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-lg border border-gray-200">
            <img src={url} alt="" className="h-full w-full object-cover" />
            {index === 0 && (
              <span className="absolute left-1 top-1 rounded bg-teal-700 px-1.5 py-0.5 text-[10px] font-medium text-white">
                Couverture
              </span>
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => setCover(index)}
                  className="rounded-full bg-white p-1.5 text-gray-700 hover:bg-gray-100"
                  title="Définir comme couverture"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="rounded-full bg-white p-1.5 text-red-600 hover:bg-gray-100"
                title="Supprimer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {imageUrls.length < maxImages && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-teal-400 hover:text-teal-600",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ImagePlus className="h-5 w-5" />
                <span className="text-[10px]">Ajouter</span>
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

      <p className="text-xs text-gray-400">
        {imageUrls.length}/{maxImages} photos — cliquez l'étoile pour définir la couverture.
      </p>
    </div>
  );
}