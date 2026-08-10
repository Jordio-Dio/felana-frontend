import type { Role } from "@/types/auth.types";

export interface UserAccount {
  id: number;
  name: string;
  email: string;
  role: Role;
  enabled: boolean;
  emailVerified: boolean;
  createdAt: string; // ISO string
}

export interface UpdateStatutRequest {
  enabled: boolean;
}