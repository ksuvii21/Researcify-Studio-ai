import { useContext } from "react";

import { CreateActionContext } from "../context/CreateActionContext";

const useCreateAction = () => {
  const context = useContext(
    CreateActionContext
  );

  if (!context) {
    throw new Error(
      "useCreateAction must be used inside CreateActionProvider"
    );
  }

  return context;
};

export default useCreateAction;