import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { isAdmin } from "../../api/admin";

interface AdminPanelMenuItemProps {
  /** Optioneel: Toon de gebruikersnaam naast het Admin Panel */
  username?: string;
  /** Optioneel: Toon een volledige naam in plaats van username */
  displayName?: string;
}

export const AdminPanelMenuItem = ({ username, displayName }: AdminPanelMenuItemProps) => {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Guards against setting state after unmount and race conditions
  const isMountedRef = useRef(true);
  const lastCheckedUserIdRef = useRef<string | number | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    async function checkAdmin(u: typeof user) {
      setChecked(false);

      if (!u?.id) {
        if (isMountedRef.current) {
          setShow(false);
          setChecked(true);
        }
        return;
      }

      const currentId = u.id as string | number;
      lastCheckedUserIdRef.current = currentId;

      try {
        const result = await isAdmin(currentId);
        if (!isMountedRef.current || lastCheckedUserIdRef.current !== currentId) return;
        setShow(Boolean(result));
      } catch {
        if (!isMountedRef.current || lastCheckedUserIdRef.current !== currentId) return;
        setShow(false);
      } finally {
        if (!isMountedRef.current || lastCheckedUserIdRef.current !== currentId) return;
        setChecked(true);
      }
    }

    checkAdmin(user);
  }, [user]);

  const goAdmin = useCallback(() => {
    navigate("/admin");
  }, [navigate]);

  if (!checked || !user || !show) return null;

  // Detect active state
  const isActive = location.pathname.startsWith("/admin");
  const nameToShow = displayName || username;

  return (
    <button
      type="button"
      onClick={goAdmin}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
        "border border-neon-blue/50 text-neon-blue hover:bg-neon-blue/10 shadow-md",
        isActive && "bg-neon-blue/20 shadow-lg ring-2 ring-neon-blue"
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label="Open admin panel"
    >
      <div className="flex items-center space-x-2">
        <Shield
          className="h-4 w-4 text-white"
          aria-hidden
          style={{
            filter: 'drop-shadow(0 0 8px #B400FF) drop-shadow(0 0 16px #00f0ff)',
          }}
        />
        <span className="font-semibold">Admin Panel</span>
      </div>

      {nameToShow && (
        <span className="text-xs font-medium text-gray-900 dark:text-white truncate">
          {nameToShow}
        </span>
      )}
    </button>
  );
};

export default AdminPanelMenuItem;
