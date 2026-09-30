import apiClient from "./apiClient";

export const search = async (params = {}) => {
  const response = await apiClient.get("/search", { params });

  return response.data;
};