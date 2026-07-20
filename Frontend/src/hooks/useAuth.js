import { useAppDispatch, useAppSelector } from "./reduxHooks";
import {
  selectCurrentUser,
  selectAuthToken,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
} from "../features/auth/authSelectors";
import {
  loginWithCredentials as loginThunk,
  loginWithGoogle as googleThunk,
  signupWithCredentials as signupThunk,
} from "../features/auth/authThunks";
import { logout as logoutAction } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectCurrentUser);
  const token = useAppSelector(selectAuthToken);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  const login = async (credentials) => {
    return dispatch(loginThunk(credentials)).unwrap();
  };

  const signup = async (details) => {
    return dispatch(signupThunk(details)).unwrap();
  };

  const loginWithGoogle = async (tokenPayload) => {
    return dispatch(googleThunk(tokenPayload)).unwrap();
  };

  const logout = async () => {
    await signOut(auth).catch(() => {});
    dispatch(logoutAction());
    navigate("/login", { replace: true });
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    signup,
    loginWithGoogle,
    logout,
  };
}
