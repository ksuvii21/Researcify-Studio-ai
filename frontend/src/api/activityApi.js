import apiClient from "./apiClient";

export const getActivities = async (params = {}) => {
  const response = await apiClient.get("/activities", { params });

  return response.data;
};