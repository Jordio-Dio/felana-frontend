import { axiosInstance } from "@/api/axiosInstance";
import type { Commande, StatutCommande, CommandeCreateRequest, Invoice } from "@/types/orders.types";
import type { PageResponse } from "@/types/api.types";

interface HistoriqueParams {
  dateDebut?: string;
  dateFin?: string;
  statut?: StatutCommande;
  clientId?: number;
  size?: number;
  page?: number;
}

export const commandeService = {
  async historique(params: HistoriqueParams = {}): Promise<PageResponse<Commande>> {
    const { data } = await axiosInstance.get<PageResponse<Commande>>("/commandes/historique", {
      params: { size: params.size ?? 20, page: params.page ?? 0, ...params },
    });
    return data;
  },

  async findById(id: number): Promise<Commande> {
    const { data } = await axiosInstance.get<Commande>(`/commandes/${id}`);
    return data;
  },

  async create(payload: CommandeCreateRequest): Promise<Commande> {
    const { data } = await axiosInstance.post<Commande>("/commandes", payload);
    return data;
  },

  async updateStatut(id: number, statut: StatutCommande): Promise<Commande> {
    const { data } = await axiosInstance.patch<Commande>(`/commandes/${id}/statut`, { statut });
    return data;
  },

  async getRecu(id: number): Promise<Invoice> {
    const { data } = await axiosInstance.get<Invoice>(`/commandes/${id}/recu`);
    return data;
  },

   getNotificationCount: async (): Promise<number> => {
    const { data } = await axiosInstance.get("/commandes/notifications/count");
    return data.commandesEnAttente ?? 0;
  }
};