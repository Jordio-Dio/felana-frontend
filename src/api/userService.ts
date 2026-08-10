import { axiosInstance } from "@/api/axiosInstance";
import type { UserAccount } from "@/types/user.types";
import type { PageResponse } from "@/types/api.types";
import type { RegisterVendeurRequest } from "@/types/auth.types";

export const userService = {
  async findVendeurs(params: { page?: number; size?: number } = {}): Promise<PageResponse<UserAccount>> {
    const { data } = await axiosInstance.get<PageResponse<UserAccount>>("/users/vendeurs", {
      params: { page: params.page ?? 0, size: params.size ?? 20 },
    });
    return data;
  },

  async createVendeur(payload: RegisterVendeurRequest): Promise<void> {
    await axiosInstance.post("/auth/register-vendeur", payload);
  },

  async updateStatut(id: number, enabled: boolean): Promise<UserAccount> {
    const { data } = await axiosInstance.patch<UserAccount>(`/users/${id}/statut`, { enabled });
    return data;
  },
};