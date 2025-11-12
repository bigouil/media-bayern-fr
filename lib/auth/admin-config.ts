export interface AdminUser {
  email: string;
  password: string;
}

const ADMIN_USERS = process.env.ADMIN_USERS || "";
export const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "";

export function getAdminUsers(): AdminUser[] {
  if (!ADMIN_USERS) return [];
  return ADMIN_USERS.split("|")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [email, password] = entry.split(":");
      return { email: email?.trim() || "", password: password?.trim() || "" };
    })
    .filter((user) => user.email && user.password);
}

export function hasAdminUsers() {
  return getAdminUsers().length > 0;
}
