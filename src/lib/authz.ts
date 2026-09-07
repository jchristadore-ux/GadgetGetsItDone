import type { Role } from "@prisma/client";

export type SessionUser = {
  id: string;
  email?: string | null;
  role?: Role | string | null;
};

export function isAdmin(user?: SessionUser | null): boolean {
  if (!user?.role) return false;
  return user.role === "ADMIN" || user.role === "SUPER_ADMIN";
}

export function isSuperAdmin(user?: SessionUser | null): boolean {
  return user?.role === "SUPER_ADMIN";
}

export function requireAuth(user?: SessionUser | null): SessionUser {
  if (!user?.id) throw new Error("UNAUTHORIZED");
  return user;
}

export function requireAdmin(user?: SessionUser | null): SessionUser {
  const u = requireAuth(user);
  if (!isAdmin(u)) throw new Error("FORBIDDEN");
  return u;
}

export function canAccessCustomer(
  user: SessionUser | null | undefined,
  customerUserId: string
): boolean {
  if (!user?.id) return false;
  if (isAdmin(user)) return true;
  return user.id === customerUserId;
}

export function canAccessBooking(params: {
  user?: SessionUser | null;
  bookingCustomerUserId: string;
  purchaserIds?: string[];
}): boolean {
  const { user, bookingCustomerUserId, purchaserIds = [] } = params;
  if (!user?.id) return false;
  if (isAdmin(user)) return true;
  if (user.id === bookingCustomerUserId) return true;
  return purchaserIds.includes(user.id);
}
