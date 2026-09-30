import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { search } from "../api/searchApi";

/*
 * Global search hook with debouncing and request sequencing.
 *
 *   useSearch()                          -> no auto-search
 *   useSearch({ debounceMs: 300 })       -> debounced
 *
 * Returns:
 *   query
 *   setQuery
 *   results
 *   counts
 *   loading
 *   error
 *   refetch
 */
const useSearch = ({ debounceMs = 300, autoFetch = false } = {}) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState({
    projects: [],
    papers: [],
    notes: [],
    documents: [],
    collections: [],
  });
  const [counts, setCounts] = useState({
    projects: 0,
    papers: 0,
    notes: 0,
    documents: 0,
    collections: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const requestSequence = useRef(0);
  const debounceTimer = useRef(null);

  const fetchSearch = useCallback(async (searchQuery) => {
    const requestId = ++requestSequence.current;

    try {
      setLoading(true);
      setError("");

      const response = await search({
        q: searchQuery,
        limit: 5,
      });

      if (requestId !== requestSequence.current) {
        return;
      }

      setResults(response.results || {
        projects: [],
        papers: [],
        notes: [],
        documents: [],
        collections: [],
      });
      setCounts(response.counts || {
        projects: 0,
        papers: 0,
        notes: 0,
        documents: 0,
        collections: 0,
        total: 0,
      });
    } catch (err) {
      if (requestId !== requestSequence.current) {
        return;
      }

      console.error("[Search] Fetch error:", err);

      setError(err?.message || "Search failed.");
    } finally {
      if (requestId === requestSequence.current) {
        setLoading(false);
      }
    }
  }, []);

  const debouncedSearch = useCallback(
    (searchQuery) => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      if (searchQuery.trim().length < 2) {
        setResults({
          projects: [],
          papers: [],
          notes: [],
          documents: [],
          collections: [],
        });
        setCounts({
          projects: 0,
          papers: 0,
          notes: 0,
          documents: 0,
          collections: 0,
          total: 0,
        });
        return;
      }

      debounceTimer.current = setTimeout(() => {
        fetchSearch(searchQuery);
      }, debounceMs);
    },
    [debounceMs, fetchSearch]
  );

  useEffect(() => {
    if (!autoFetch) return undefined;

    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSearch(query);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [autoFetch, query, debounceMs, fetchSearch]);

  const handleQueryChange = useCallback(
    (newQuery) => {
      setQuery(newQuery);
      debouncedSearch(newQuery);
    },
    [debouncedSearch]
  );

  const refetch = useCallback(() => {
    if (query.trim().length >= 2) {
      fetchSearch(query);
    }
  }, [query, fetchSearch]);

  return {
    query,
    setQuery: handleQueryChange,
    results,
    counts,
    loading,
    error,
    refetch,
  };
};

export default useSearch;