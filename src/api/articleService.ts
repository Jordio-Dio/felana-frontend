import { axiosInstance } from "@/api/axiosInstance";
import type { Article, ArticleCreateRequest, ArticleUpdateRequest } from "@/types/catalog.types";
import type { PageResponse } from "@/types/api.types";

interface SearchParams {
  categorieId?: number;
  actif?: boolean;
  terme?: string;
  page?: number;
  size?: number;
}

export const articleService = {
  async search(params: SearchParams = {}): Promise<PageResponse<Article>> {
    const { data } = await axiosInstance.get<PageResponse<Article>>("/articles", {
      params: { page: params.page ?? 0, size: params.size ?? 50, ...params },
    });
    return data;
  },

  async create(payload: ArticleCreateRequest): Promise<Article> {
    const { data } = await axiosInstance.post<Article>("/articles", payload);
    return data;
  },

  async update(id: number, payload: ArticleUpdateRequest): Promise<Article> {
    const { data } = await axiosInstance.put<Article>(`/articles/${id}`, payload);
    return data;
  },

  async remove(id: number): Promise<void> {
    await axiosInstance.delete(`/articles/${id}`);
  },
};