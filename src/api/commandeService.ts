import { axiosInstance } from "@/api/axiosInstance";
import type { Commande, StatutCommande } from "@/types/orders.types";
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
};