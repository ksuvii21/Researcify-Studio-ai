import apiClient from "./apiClient";

export const getCollections = (params = {}) =>
  apiClient.get("/collections", { params });

export const getCollectionById = (id) =>
  apiClient.get(`/collections/${id}`);

export const createCollection = (data) =>
  apiClient.post("/collections", data);

export const updateCollection = (id, data) =>
  apiClient.patch(`/collections/${id}`, data);

export const deleteCollection = (id) =>
  apiClient.delete(`/collections/${id}`);

export const toggleCollectionPin = (id) =>
  apiClient.patch(`/collections/${id}/pin`);

export const toggleCollectionArchive = (id) =>
  apiClient.patch(`/collections/${id}/archive`);

export const addPaper = (id, paperId) =>
  apiClient.post(`/collections/${id}/papers`, { paperId });

export const removePaper = (id, paperId) =>
  apiClient.delete(`/collections/${id}/papers/${paperId}`);

export const addDocument = (id, documentId) =>
  apiClient.post(`/collections/${id}/documents`, { documentId });

export const removeDocument = (id, documentId) =>
  apiClient.delete(`/collections/${id}/documents/${documentId}`);