import { axiosInstance } from "@/api/axiosInstance";
import type { Client, ClientRequest } from "@/types/client.types";
import type { PageResponse } from "@/types/api.types";

export const clientService = {
  /**
   * Récupère la liste paginée des clients
   */
  async findAll(params: { page?: number; size?: number } = {}): Promise<PageResponse<Client>> {
    const { data } = await axiosInstance.get<PageResponse<Client>>("/clients", {
      params: { page: params.page ?? 0, size: params.size ?? 100 },
    });
    return data;
  },

  /**
   * Création d'un client (Admin / Back-office)
   */
  async create(payload: ClientRequest): Promise<Client> {
    const { data } = await axiosInstance.post<Client>("/clients", payload);
    return data;
  },

  /**
   * Mise à jour du profil d'un client par son ID
   */
  async update(id: number, payload: ClientRequest): Promise<Client> {
    const { data } = await axiosInstance.put<Client>(`/clients/${id}`, payload);
    return data;
  },

  /**
   * Suppression d'un client
   */
  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`/clients/${id}`);
  },
};