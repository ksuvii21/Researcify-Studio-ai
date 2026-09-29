import apiClient from "./apiClient";

// -----------------------------------------------------
// Get all saved papers
// -----------------------------------------------------

export const getPapers = async (params = {}) => {
  const response = await apiClient.get("/papers", {
    params,
  });

  return response.data;
};

// -----------------------------------------------------
// Get one saved paper
// -----------------------------------------------------

export const getPaperById = async (paperId) => {
  const response = await apiClient.get(
    `/papers/${paperId}`
  );

  return response.data;
};

// -----------------------------------------------------
// Save paper
// -----------------------------------------------------

export const createPaper = async (paperData) => {
  const response = await apiClient.post(
    "/papers",
    paperData
  );

  return response.data;
};

// -----------------------------------------------------
// Update paper
// -----------------------------------------------------

export const updatePaper = async (
  paperId,
  paperData
) => {
  const response = await apiClient.patch(
    `/papers/${paperId}`,
    paperData
  );

  return response.data;
};

// -----------------------------------------------------
// Delete paper
// -----------------------------------------------------

export const deletePaper = async (paperId) => {
  const response = await apiClient.delete(
    `/papers/${paperId}`
  );

  return response.data;
};

// -----------------------------------------------------
// Toggle favorite
// -----------------------------------------------------

export const togglePaperFavorite = async (paperId) => {
  const response = await apiClient.patch(
    `/papers/${paperId}/favorite`
  );

  return response.data;
};

// -----------------------------------------------------
// External paper search (CrossRef)
// -----------------------------------------------------

export const searchExternalPapers = async (query) => {
  const response = await apiClient.get(
    "/papers/search",
    {
      params: { q: query },
    }
  );

  return response.data;
};

const paperApi = {
  getPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  togglePaperFavorite,
  searchExternalPapers,
};

export default paperApi;