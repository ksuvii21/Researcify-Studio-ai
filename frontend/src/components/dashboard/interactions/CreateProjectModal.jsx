import ProjectFormModal from "../../projects/ProjectFormModal";

import useProjects from "../../../hooks/useProjects";
import useToast from "../../../hooks/useToast";

/*
 * Global "New Project" entry point.
 *
 * This used to be a standalone form that faked success
 * with a 650ms timer and reported "Project created" for a
 * project that was never written. It now renders the same
 * ProjectFormModal the Projects page uses, and the parent
 * owns the real API call, so a success toast can only
 * appear when MongoDB actually accepted the project.
 */
const CreateProjectModal = ({
  open,
  onClose,
}) => {
  const toast = useToast();

  const {
    createProject,
    mutationLoading,
  } = useProjects({ autoFetch: false });

  const handleSubmit = async (values) => {
    const created = await createProject(values);

    onClose();

    toast.success(
      "Project created",
      `"${created?.title || values.title}" is ready for research.`
    );
  };

  return (
    <ProjectFormModal
      open={open}
      loading={mutationLoading}
      onClose={onClose}
      onSubmit={handleSubmit}
    />
  );
};

export default CreateProjectModal;
