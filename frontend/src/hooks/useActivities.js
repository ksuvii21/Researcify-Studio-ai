import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { getActivities } from "../api/activityApi";

/*
 * One parameterised hook powers every activities surface:
 *
 *   useActivities()                    -> all activities
 *   useActivities({ projectId })       -> project-scoped
 *   useActivities({ entityType })      -> filtered
 *
 * Requests are guarded with a monotonically increasing
 * sequence number so a slow, stale response cannot
 * overwrite a newer one when filters change quickly.
 */
const useActivities = ({
  projectId,
  entityType,
  action,
  autoFetch = true,
} = {}) => {
  const [activities, setActivities] = useState([]);

  const [loading, setLoading] = useState(autoFetch);

  const [error, setError] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  const [page, setPage] = useState(1);

  const requestSequence = useRef(0);

  const fetchActivities = useCallback(
    async (pageNum = 1) => {
      const requestId = ++requestSequence.current;

      try {
        setLoading(true);
        setError("");

        const params = {
          page: pageNum,
          limit: 20,
        };

        if (projectId) params.projectId = projectId;
        if (entityType) params.entityType = entityType;
        if (action) params.action = action;

        const response = await getActivities(params);

        if (requestId !== requestSequence.current) {
          return;
        }

        setActivities(response.activities || []);
        setPagination(response.pagination || {
          page: pageNum,
          limit: 20,
          total: 0,
          pages: 0,
        });
        setPage(pageNum);
      } catch (err) {
        if (requestId !== requestSequence.current) {
          return;
        }

        console.error("[Activities] Fetch error:", err);

        setError(
          err?.message || "Unable to load activity."
        );
      } finally {
        if (requestId === requestSequence.current) {
          setLoading(false);
        }
      }
    },
    [projectId, entityType, action]
  );

  const refetch = useCallback(() => {
    fetchActivities(page);
  }, [fetchActivities, page]);

  useEffect(() => {
    if (!autoFetch) return undefined;

    const timer = setTimeout(() => {
      fetchActivities(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [autoFetch, fetchActivities]);

  return {
    activities,
    pagination,
    loading,
    error,

    page,
    setPage,

    fetchActivities,
    refetch,
  };
};

export default useActivities;