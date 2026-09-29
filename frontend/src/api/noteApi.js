import apiClient from "./apiClient";

// -----------------------------------------------------
// Get notes
// -----------------------------------------------------

export const getNotes = async (params = {}) => {
  const response = await apiClient.get("/notes", {
    params,
  });

  return response.data;
};

// -----------------------------------------------------
// Get one note
// -----------------------------------------------------

export const getNoteById = async (noteId) => {
  const response = await apiClient.get(
    `/notes/${noteId}`
  );

  return response.data;
};

// -----------------------------------------------------
// Create note
// -----------------------------------------------------

export const createNote = async (noteData) => {
  const response = await apiClient.post(
    "/notes",
    noteData
  );

  return response.data;
};

// -----------------------------------------------------
// Update note
// -----------------------------------------------------

export const updateNote = async (
  noteId,
  noteData
) => {
  const response = await apiClient.patch(
    `/notes/${noteId}`,
    noteData
  );

  return response.data;
};

// -----------------------------------------------------
// Delete note
// -----------------------------------------------------

export const deleteNote = async (noteId) => {
  const response = await apiClient.delete(
    `/notes/${noteId}`
  );

  return response.data;
};

// -----------------------------------------------------
// Toggle pin
// -----------------------------------------------------

export const toggleNotePin = async (noteId) => {
  const response = await apiClient.patch(
    `/notes/${noteId}/pin`
  );

  return response.data;
};

// -----------------------------------------------------
// Toggle archive
// -----------------------------------------------------

export const toggleNoteArchive = async (noteId) => {
  const response = await apiClient.patch(
    `/notes/${noteId}/archive`
  );

  return response.data;
};

const noteApi = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  toggleNotePin,
  toggleNoteArchive,
};

export default noteApi;