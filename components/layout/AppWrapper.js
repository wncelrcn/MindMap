import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/component";
import { RecapProvider } from "@/contexts/RecapContext";

export default function AppWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (mounted) {
        setUser(session?.user || null);
        setLoading(false);
        if (session?.user) {
          console.log("Initial session found, user authenticated");
        }
      }
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth event:", event);

      const newUser = session?.user || null;
      setUser(newUser);
      setLoading(false);

      if (event === "SIGNED_IN" && newUser) {
        console.log("User signed in, recap will initialize");
      } else if (event === "SIGNED_OUT") {
        console.log("User signed out");
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <RecapProvider user={user}>{children}</RecapProvider>;
}
