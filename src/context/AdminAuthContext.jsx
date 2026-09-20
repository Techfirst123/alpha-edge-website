import { useCallback, useEffect, useRef, useState } from "react";
import { adminCheckSession, adminLogin, adminLogout } from "../api/client";
import { AdminAuthContext } from "./adminAuthContextInstance";

// Matches the ~10-minute sliding session on the server (see api/_lib/auth.js).
// The session is only kept alive by *real* activity — mouse/keyboard/touch/
// scroll — not just by having the tab open. So an admin who steps away for
// 10 minutes (even with the tab still open) gets logged out; coming back and
// touching anything immediately reveals that and asks them to sign in again.
const ACTIVITY_THROTTLE_MS = 60 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

const EMPTY_SESSION = { isAdmin: false, role: null, name: "", email: "" };

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(EMPTY_SESSION);
  const [ready, setReady] = useState(false);
  const lastCheckRef = useRef(0);

  const refresh = useCallback(() => {
    return adminCheckSession()
      .then((data) =>
        setSession(
          data.authenticated
            ? { isAdmin: true, role: data.role, name: data.name, email: data.email }
            : EMPTY_SESSION
        )
      )
      .catch(() => setSession(EMPTY_SESSION));
  }, []);

  const isAdmin = session.isAdmin;

  useEffect(() => {
    refresh().finally(() => setReady(true));
  }, [refresh]);

  useEffect(() => {
    if (!isAdmin) return;

    const onActivity = () => {
      const now = Date.now();
      if (now - lastCheckRef.current < ACTIVITY_THROTTLE_MS) return;
      lastCheckRef.current = now;
      refresh();
    };

    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, onActivity, { passive: true }));
    return () => ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, onActivity));
  }, [isAdmin, refresh]);

  const login = async (email, password) => {
    await adminLogin(email, password);
    await refresh(); // pulls in role/name/email now that a session cookie exists
  };

  const logout = async () => {
    await adminLogout().catch(() => {});
    setSession(EMPTY_SESSION);
  };

  return (
    <AdminAuthContext.Provider
      value={{
        isAdmin,
        isSuperAdmin: session.role === "superadmin",
        adminName: session.name,
        adminEmail: session.email,
        ready,
        login,
        logout,
        refresh,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}
