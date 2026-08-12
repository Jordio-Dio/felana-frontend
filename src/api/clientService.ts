import { axiosInstance } from "@/api/axiosInstance";
import type { Client, ClientRequest } from "@/types/client.types";
import type { PageResponse } from "@/types/api.types";

export const clientService = {
  async findAll(params: { page?: number; size?: number } = {}): Promise<PageResponse<Client>> {
    const { data } = await axiosInstance.get<PageResponse<Client>>("/clients", {
      params: { page: params.page ?? 0, size: params.size ?? 100 },
    });
    return data;
  },

  async create(payload: ClientRequest): Promise<Client> {
    const { data } = await axiosInstance.post<Client>("/clients", payload);
    return data;
  },

  async update(id: number, payload: ClientRequest): Promise<Client> {
    const { data } = await axiosInstance.put<Client>(`/clients/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`/clients/${id}`);
  },
};