import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./client";

const AuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/MonthlyCalendar"); // adjust if needed
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return null;
};

export default AuthRedirect;
