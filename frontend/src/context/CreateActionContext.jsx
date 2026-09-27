import {
  createContext,
  useCallback,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import useToast from "../hooks/useToast";

export const CreateActionContext =
  createContext(null);

export const CreateActionProvider = ({
  children,
}) => {
  const navigate = useNavigate();
  const toast = useToast();

  const [activeAction, setActiveAction] =
    useState(null);

  const closeAction = useCallback(() => {
    setActiveAction(null);
  }, []);

  const handleAction = useCallback(
    (action) => {
      switch (action) {
        case "project":
          setActiveAction("project");
          break;

        case "note":
          setActiveAction("note");
          break;

        case "upload":
          setActiveAction("upload");
          break;

        case "paper":
        case "import":
          setActiveAction("import");
          break;

        case "collection":
          toast.info(
            "Collections",
            "Collection creation will be available in the Library workspace."
          );
          break;

        case "search":
          navigate("/discover");
          break;

        case "ai":
          navigate("/ai-assistant");
          break;

        default:
          console.warn(
            `[CreateAction] Unknown action: ${action}`
          );
      }
    },
    [navigate, toast]
  );

  const value = useMemo(
    () => ({
      activeAction,
      handleAction,
      closeAction,
    }),
    [
      activeAction,
      handleAction,
      closeAction,
    ]
  );

  return (
    <CreateActionContext.Provider value={value}>
      {children}
    </CreateActionContext.Provider>
  );
};