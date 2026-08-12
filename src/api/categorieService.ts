import { axiosInstance } from "@/api/axiosInstance";
import type { Categorie, CategorieRequest } from "@/types/catalog.types";

export const categorieService = {
  async findAll(): Promise<Categorie[]> {
    const { data } = await axiosInstance.get<Categorie[]>("/categories");
    return data;
  },

  async create(payload: CategorieRequest): Promise<Categorie> {
    const { data } = await axiosInstance.post<Categorie>("/categories", payload);
    return data;
  },

  async update(id: number, payload: CategorieRequest): Promise<Categorie> {
    const { data } = await axiosInstance.put<Categorie>(`/categories/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`/categories/${id}`);
  },
};