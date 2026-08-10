import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [state, setState] = useState<{
    loading: boolean;
    isAdmin: boolean;
    userId: string | null;
  }>({
    loading: true,
    isAdmin: false,
    userId: null,
  });

  useEffect(() => {
    let alive = true;

    (async () => {
      const { data: userData } = await supabase.auth.getUser();

      console.log("AUTH USER =>", userData.user);

      const uid = userData.user?.id ?? null;

      if (!uid) {
        if (alive) {
          setState({
            loading: false,
            isAdmin: false,
            userId: null,
          });
        }
        return;
      }

      const result = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", uid);

      console.log("ROLE RESULT =>", result);

      if (alive) {
        setState({
          loading: false,
          isAdmin: result.data?.some((r) => r.role === "admin") ?? false,
          userId: uid,
        });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  return state;
}