import apiClient from "./apiClient";

/*
 * Every function here resolves to the API envelope
 * ({ statusCode, success, message, data }) rather than the
 * raw axios response.
 *
 * That matches paperApi, projectApi and noteApi, and it is
 * what the hooks expect: useCollections reads
 * `response.data` to reach the payload. Returning the axios
 * response from here handed the envelope itself to the hook,
 * so `collections` became an object and CollectionsPage
 * crashed on `collections.filter`.
 */

export const getCollections = async (params = {}) => {
  const response = await apiClient.get("/collections", {
    params,
  });

  return response.data;
};

export const getCollectionById = async (id) => {
  const response = await apiClient.get(
    `/collections/${id}`
  );

  return response.data;
};

export const createCollection = async (data) => {
  const response = await apiClient.post(
    "/collections",
    data
  );

  return response.data;
};

export const updateCollection = async (id, data) => {
  const response = await apiClient.patch(
    `/collections/${id}`,
    data
  );

  return response.data;
};

export const deleteCollection = async (id) => {
  const response = await apiClient.delete(
    `/collections/${id}`
  );

  return response.data;
};

export const toggleCollectionPin = async (id) => {
  const response = await apiClient.patch(
    `/collections/${id}/pin`
  );

  return response.data;
};

export const toggleCollectionArchive = async (id) => {
  const response = await apiClient.patch(
    `/collections/${id}/archive`
  );

  return response.data;
};

export const addPaper = async (id, paperId) => {
  const response = await apiClient.post(
    `/collections/${id}/papers`,
    { paperId }
  );

  return response.data;
};

export const removePaper = async (id, paperId) => {
  const response = await apiClient.delete(
    `/collections/${id}/papers/${paperId}`
  );

  return response.data;
};

export const addDocument = async (id, documentId) => {
  const response = await apiClient.post(
    `/collections/${id}/documents`,
    { documentId }
  );

  return response.data;
};

export const removeDocument = async (id, documentId) => {
  const response = await apiClient.delete(
    `/collections/${id}/documents/${documentId}`
  );

  return response.data;
};

const collectionApi = {
  getCollections,
  getCollectionById,
  createCollection,
  updateCollection,
  deleteCollection,
  toggleCollectionPin,
  toggleCollectionArchive,
  addPaper,
  removePaper,
  addDocument,
  removeDocument,
};

export default collectionApi;
