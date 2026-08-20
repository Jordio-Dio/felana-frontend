const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload direct navigateur -> Cloudinary, sans passer par notre backend.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Configuration Cloudinary manquante. Vérifiez VITE_CLOUDINARY_CLOUD_NAME et VITE_CLOUDINARY_UPLOAD_PRESET dans .env.local"
    );
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error("Échec de l'envoi de l'image. Réessayez.");
  }

  const data = await response.json();
  const rawUrl = data.secure_url as string;

  return applyOptimization(rawUrl);
}

/**
 * Insère les paramètres d'optimisation directement dans l'URL Cloudinary :
 * - w_1200,c_limit : redimensionne à 1200px de large max (jamais agrandi)
 * - q_auto : compression automatique, qualité visuelle préservée
 * - f_auto : sert du WebP/AVIF aux navigateurs qui le supportent
 *
 * L'URL Cloudinary a toujours la forme :
 * https://res.cloudinary.com/<cloud_name>/image/upload/v1234/felana/articles/xyz.jpg
 * On insère les transformations juste après "/upload/".
 */
function applyOptimization(url: string): string {
  return url.replace("/upload/", "/upload/w_1200,c_limit,q_auto,f_auto/");
}