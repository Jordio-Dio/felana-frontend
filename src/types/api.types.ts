/**
 * Format d'erreur renvoyé par notre GlobalExceptionHandler côté backend
 * (voir GlobalExceptionHandler.java : { timestamp, status, error }).
 */
export interface ApiErrorResponse {
  timestamp: string;
  status: number;
  error?: string;
  errors?: Record<string, string>; // cas de MethodArgumentNotValidException
}

/**
 * Format générique d'une page Spring Data (Page<T>), tel que sérialisé
 * par Jackson quand un controller retourne un objet Page.
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number; // page courante (0-indexed)
  size: number;
  first: boolean;
  last: boolean;
}