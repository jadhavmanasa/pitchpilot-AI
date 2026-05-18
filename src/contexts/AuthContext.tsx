import { createContext, type ReactNode, useContext, useState } from "react";
import { AuthUser, deleteAccount, getCurrentUser, login, logout, signUp } from "../lib/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loginUser: (email: string, password: string) => AuthUser;
  signUpUser: (name: string, email: string, password: string) => AuthUser;
  logoutUser: () => void;
  deleteCurrentUser: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getCurrentUser());

  const loginUser = (email: string, password: string) => {
    const loggedInUser = login(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const signUpUser = (name: string, email: string, password: string) => {
    const createdUser = signUp(name, email, password);
    setUser(createdUser);
    return createdUser;
  };

  const logoutUser = () => {
    logout();
    setUser(null);
  };

  const deleteCurrentUser = () => {
    if (!user) return;
    deleteAccount(user.email);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: Boolean(user), loginUser, signUpUser, logoutUser, deleteCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
