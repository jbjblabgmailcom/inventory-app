import { useEffect, useState } from "react";
import { db } from "../db/db";
import { runMigrations } from "../db/migrations";

export const useDB = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      runMigrations(db);
      setLoading(false);
    } catch (e) {
     setError(e);
      setLoading(false);
    }
  }, []);

  return { loading, error };
};
