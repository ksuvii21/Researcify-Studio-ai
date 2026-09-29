import apiClient from "./apiClient";

// -----------------------------------------------------
// Get all projects
// -----------------------------------------------------

export const getProjects = async (params = {}) => {
  const response = await apiClient.get("/projects", {
    params,
  });

  return response.data;
};

// -----------------------------------------------------
// Get one project
// -----------------------------------------------------

export const getProjectById = async (projectId) => {
  const response = await apiClient.get(
    `/projects/${projectId}`
  );

  return response.data;
};

// -----------------------------------------------------
// Create project
// -----------------------------------------------------

export const createProject = async (projectData) => {
  const response = await apiClient.post(
    "/projects",
    projectData
  );

  return response.data;
};

// -----------------------------------------------------
// Update project
// -----------------------------------------------------

export const updateProject = async (
  projectId,
  projectData
) => {
  const response = await apiClient.patch(
    `/projects/${projectId}`,
    projectData
  );

  return response.data;
};

// -----------------------------------------------------
// Delete project
// -----------------------------------------------------

export const deleteProject = async (projectId) => {
  const response = await apiClient.delete(
    `/projects/${projectId}`
  );

  return response.data;
};

// -----------------------------------------------------
// Project papers (relationship)
// -----------------------------------------------------

export const getProjectPapers = async (projectId) => {
  const response = await apiClient.get(
    `/projects/${projectId}/papers`
  );

  return response.data;
};

export const addPaperToProject = async (
  projectId,
  paperId
) => {
  const response = await apiClient.post(
    `/projects/${projectId}/papers`,
    { paperId }
  );

  return response.data;
};

export const removePaperFromProject = async (
  projectId,
  paperId
) => {
  const response = await apiClient.delete(
    `/projects/${projectId}/papers/${paperId}`
  );

  return response.data;
};

const projectApi = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  getProjectPapers,
  addPaperToProject,
  removePaperFromProject,
};

export default projectApi;