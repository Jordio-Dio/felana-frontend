import posthog from "posthog-js";

/**
 * Analytique produit (PostHog).
 *
 * Les événements servent à suivre le parcours clé de l'application :
 * connexion du personnel -> tableau de bord -> enregistrement d'une vente,
 * ainsi que le parcours boutique (inscription / connexion / commande).
 *
 * Rien n'est envoyé sans clé publique : si `VITE_POSTHOG_KEY` est absent
 * (dev local, preview), toutes les fonctions ci-dessous sont de simples
 * no-ops et l'application fonctionne normalement.
 *
 * Consentement : la capture est désactivée si le navigateur exprime
 * « Do Not Track » ou si l'utilisateur a refusé via `setAnalyticsConsent(false)`.
 * Aucune session replay n'est activée, et les profils ne sont créés que pour
 * les utilisateurs identifiés (`identified_only`).
 */

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY;
const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";
const CONSENT_STORAGE_KEY = "hiba.analytics.consent";

let initialized = false;

/** true si l'utilisateur n'a pas refusé le suivi (choix explicite ou DNT). */
export function hasAnalyticsConsent(): boolean {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored === "granted") return true;
    if (stored === "denied") return false;
  } catch {
    // localStorage indisponible (navigation privée stricte) : on s'abstient.
    return false;
  }
  return navigator.doNotTrack !== "1";
}

/** À appeler une seule fois au démarrage de l'application (main.tsx). */
export function initAnalytics(): void {
  if (initialized || !POSTHOG_KEY) return;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    ui_host: "https://us.posthog.com",
    // SPA : chaque navigation interne (BrowserRouter) déclenche un $pageview.
    capture_pageview: "history_change",
    capture_pageleave: true,
    // Un profil n'est créé que lorsqu'on identifie réellement la personne.
    person_profiles: "identified_only",
    persistence: "localStorage+cookie",
    // Pas d'enregistrement de session ni d'autocapture de champs de formulaire.
    disable_session_recording: true,
    mask_all_text: false,
    respect_dnt: true,
  });

  initialized = true;

  if (!hasAnalyticsConsent()) {
    posthog.opt_out_capturing();
  }
}

/** Enregistre (ou retire) le consentement analytique de l'utilisateur. */
export function setAnalyticsConsent(granted: boolean): void {
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, granted ? "granted" : "denied");
  } catch {
    // Choix non persistable : on applique quand même pour la session en cours.
  }
  if (!initialized) return;

  if (granted) {
    posthog.opt_in_capturing();
  } else {
    posthog.opt_out_capturing();
    posthog.reset();
  }
}

/** Associe la session courante à une personne (personnel ou client boutique). */
export function identifyUser(user: {
  id: number | string;
  email?: string | null;
  name?: string | null;
  role?: string;
}): void {
  if (!initialized) return;

  posthog.identify(String(user.id), {
    email: user.email ?? undefined,
    name: user.name ?? undefined,
    role: user.role,
  });
}

/** À appeler à la déconnexion : la session suivante repart anonyme. */
export function resetAnalytics(): void {
  if (!initialized) return;
  posthog.reset();
}

/** Envoie un événement produit. Les propriétés ne doivent jamais contenir de secret. */
export function captureEvent(
  event: string,
  properties?: Record<string, string | number | boolean | null | undefined>
): void {
  if (!initialized) return;
  posthog.capture(event, properties);
}
