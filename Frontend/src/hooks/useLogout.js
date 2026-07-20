import { useAuth } from "./useAuth";

export function useLogout() {
  const { logout } = useAuth();
  return logout;
}
