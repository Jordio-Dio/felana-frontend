import { axiosInstance } from "@/api/axiosInstance";
import type { Article } from "@/types/catalog.types";
import type { PageResponse } from "@/types/api.types";

export const articleService = {
  async search(params: { size?: number; actif?: boolean } = {}): Promise<PageResponse<Article>> {
    const { data } = await axiosInstance.get<PageResponse<Article>>("/articles", {
      params: { size: params.size ?? 1000, actif: params.actif },
    });
    return data;
  },
};