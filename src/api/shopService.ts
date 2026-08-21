import { axiosInstance } from "@/api/axiosInstance";
import type {
  ArticlePublic,
  PublicOrderRequest,
  PublicOrderResponse,
} from "@/types/shop.types";
import type { PageResponse } from "@/types/api.types";

export const shopService = {
  async findArticles(params: { page?: number; size?: number } = {}): Promise<PageResponse<ArticlePublic>> {
    const { data } = await axiosInstance.get<PageResponse<ArticlePublic>>("/v1/public/articles", {
      params: { page: params.page ?? 0, size: params.size ?? 100 },
    });
    return data;
  },

  async findArticleById(id: number): Promise<ArticlePublic> {
    const { data } = await axiosInstance.get<ArticlePublic>(`/v1/public/articles/${id}`);
    return data;
  },

  async createOrder(payload: PublicOrderRequest): Promise<PublicOrderResponse> {
    const { data } = await axiosInstance.post<PublicOrderResponse>("/v1/public/orders", payload);
    return data;
  },
};