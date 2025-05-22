import { supabase } from "./supabase";

export const auth = {
  /**
   * Sign out the current user
   * @returns {Promise<{error: Error | null}>}
   */
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      return { error };
    } catch (error) {
      console.error("Error signing out:", error);
      return { error };
    }
  },

  /**
   * Get the current session
   * @returns {Promise<{session: Session | null, error: Error | null}>}
   */
  getSession: async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      return { session, error };
    } catch (error) {
      console.error("Error getting session:", error);
      return { session: null, error };
    }
  },

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Function to call when auth state changes
   * @returns {Object} Subscription object with unsubscribe method
   */
  onAuthStateChange: (callback) => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(callback);
    return subscription;
  },
};
