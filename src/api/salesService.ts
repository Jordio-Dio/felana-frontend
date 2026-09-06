import { axiosInstance } from "@/api/axiosInstance";

export interface SalesToday {
  montantTotal: number;
  nombreVentes: number;
}

export const salesService = {
  async getToday(): Promise<SalesToday> {
    const { data } = await axiosInstance.get<SalesToday>("/v1/sales/today");
    return data;
  },
};
