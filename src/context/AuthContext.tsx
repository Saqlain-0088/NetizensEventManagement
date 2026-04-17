import { createContext, useContext, useState, ReactNode } from "react";

export interface Role {
  id: string;
  name: string;
  permissions: {
    canView: boolean;
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
  };
}

export interface AuthUser {
  username: string;
  roleId: string;
  allowedProperties: string[];
}

interface AuthContextType {
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  user: AuthUser | null;
  users: (AuthUser & { password: string })[];
  addUser: (u: AuthUser & { password: string }) => void;
  updateUser: (username: string, updates: Partial<AuthUser & { password: string }>) => void;
  removeUser: (username: string) => void;
  roles: Role[];
  addRole: (r: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ROLES: Role[] = [
  { id: "role_admin", name: "Administrator", permissions: { canView: true, canAdd: true, canEdit: true, canDelete: true } },
  { id: "role_editor", name: "Editor", permissions: { canView: true, canAdd: true, canEdit: true, canDelete: false } },
  { id: "role_viewer", name: "Viewer Only", permissions: { canView: true, canAdd: false, canEdit: false, canDelete: false } },
];

const VALID_USERS: (AuthUser & { password: string })[] = [
  { username: "admin", password: "admin@123", roleId: "role_admin", allowedProperties: ["all"] },
  { username: "netizens", password: "netizens@2024", roleId: "role_admin", allowedProperties: ["all"] },
  { username: "manager", password: "user@123", roleId: "role_editor", allowedProperties: ["prop1"] },
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [users, setUsers] = useState<(AuthUser & { password: string })[]>(VALID_USERS);
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = sessionStorage.getItem("auth_user_data");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username: string, password: string): boolean => {
    const match = users.find(
      (u) => u.username === username.trim() && u.password === password
    );
    if (match) {
      const { password, ...authUser } = match;
      setUser(authUser);
      sessionStorage.setItem("auth_user_data", JSON.stringify(authUser));
      return true;
    }
    return false;
  };

  const addUser = (u: AuthUser & { password: string }) => {
    setUsers((prev) => [...prev, u]);
  };

  const updateUser = (username: string, updates: Partial<AuthUser & { password: string }>) => {
    setUsers((prev) => prev.map((u) => (u.username === username ? { ...u, ...updates } : u)));
    // If the currently logged in user is the one being updated, update their session too
    if (user?.username === username) {
      const updated = { ...user, ...updates };
      delete (updated as any).password;
      setUser(updated as AuthUser);
      sessionStorage.setItem("auth_user_data", JSON.stringify(updated));
    }
  };

  const removeUser = (username: string) => {
    if (user?.username === username) return; // Cannot delete self
    setUsers((prev) => prev.filter((u) => u.username !== username));
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem("auth_user_data");
  };

  const addRole = (r: Role) => setRoles((prev) => [...prev, r]);
  const updateRole = (id: string, updates: Partial<Role>) => setRoles((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  const deleteRole = (id: string) => setRoles((prev) => prev.filter((r) => r.id !== id));

  return (
    <AuthContext.Provider value={{ isLoggedIn: !!user, login, logout, user, users, addUser, updateUser, removeUser, roles, addRole, updateRole, deleteRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
