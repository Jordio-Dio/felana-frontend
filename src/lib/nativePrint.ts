import { Capacitor, registerPlugin } from "@capacitor/core";

/**
 * Interface du plugin natif Android (voir
 * `android/app/src/main/java/com/hibacreation/app/PrintPlugin.java`).
 */
interface PrintPlugin {
  print(options?: { jobName?: string }): Promise<void>;
}

const NativePrint = registerPlugin<PrintPlugin>("Print");

/** Vrai lorsque l'application tourne dans l'APK Capacitor. */
export function isNativeApp(): boolean {
  return Capacitor.isNativePlatform();
}

// On garde une référence au window.print d'origine AVANT de le remplacer :
// cela évite une boucle infinie si le plugin natif n'est pas disponible.
const originalWindowPrint =
  typeof window !== "undefined" ? window.print.bind(window) : undefined;

/**
 * Lance l'impression de la page courante.
 *
 * - Dans l'APK : utilise le dialogue d'impression natif Android
 *   (`window.print()` n'existe pas dans le WebView Android).
 * - Dans un navigateur : utilise l'impression classique.
 *
 * @returns `true` si l'impression a pu être déclenchée.
 */
export async function printPage(jobName = "Document"): Promise<boolean> {
  if (Capacitor.isNativePlatform()) {
    try {
      await NativePrint.print({ jobName });
      return true;
    } catch (error) {
      // Ancien APK sans le plugin : on retombe sur le comportement navigateur.
      console.warn(
        "[print] Plugin natif indisponible, repli sur window.print().",
        error
      );
    }
  }

  if (!originalWindowPrint) {
    return false;
  }

  try {
    originalWindowPrint();
    return true;
  } catch (error) {
    console.error("[print] Impression impossible.", error);
    return false;
  }
}

/**
 * Rend `window.print()` compatible avec l'APK pour tout le code de
 * l'application (y compris d'éventuels futurs boutons « Imprimer »).
 * À appeler une seule fois au démarrage.
 */
export function installNativePrintBridge(): void {
  if (typeof window === "undefined" || !Capacitor.isNativePlatform()) {
    return;
  }

  const nativeWindow = window as Window & {
    __hibaPrintBridge?: boolean;
    __hibaNativePrint?: boolean;
  };

  // Le script injecté côté Android peut déjà avoir installé le pont.
  if (nativeWindow.__hibaPrintBridge || nativeWindow.__hibaNativePrint) {
    return;
  }
  nativeWindow.__hibaPrintBridge = true;

  window.print = () => {
    void printPage(document.title || "Document").then((started) => {
      if (!started && originalWindowPrint) {
        try {
          originalWindowPrint();
        } catch {
          // Rien d'autre à faire : l'appareil ne propose pas d'impression.
        }
      }
    });
  };
}
