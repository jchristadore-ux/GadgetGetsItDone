import { describe, expect, it } from "vitest";
import {
  canAccessBooking,
  canAccessCustomer,
  isAdmin,
  requireAdmin,
  requireAuth,
} from "@/lib/authz";

describe("authz", () => {
  it("detects admins", () => {
    expect(isAdmin({ id: "1", role: "ADMIN" })).toBe(true);
    expect(isAdmin({ id: "1", role: "SUPER_ADMIN" })).toBe(true);
    expect(isAdmin({ id: "1", role: "CUSTOMER" })).toBe(false);
  });

  it("requireAuth / requireAdmin", () => {
    expect(() => requireAuth(null)).toThrow(/UNAUTHORIZED/);
    expect(() => requireAdmin({ id: "1", role: "CUSTOMER" })).toThrow(/FORBIDDEN/);
    expect(requireAdmin({ id: "1", role: "ADMIN" }).id).toBe("1");
  });

  it("customer isolation", () => {
    expect(canAccessCustomer({ id: "u1", role: "CUSTOMER" }, "u1")).toBe(true);
    expect(canAccessCustomer({ id: "u1", role: "CUSTOMER" }, "u2")).toBe(false);
    expect(canAccessCustomer({ id: "a1", role: "ADMIN" }, "u2")).toBe(true);
  });

  it("supported household purchaser access", () => {
    expect(
      canAccessBooking({
        user: { id: "purchaser", role: "CUSTOMER" },
        bookingCustomerUserId: "parent",
        purchaserIds: ["purchaser"],
      })
    ).toBe(true);
    expect(
      canAccessBooking({
        user: { id: "stranger", role: "CUSTOMER" },
        bookingCustomerUserId: "parent",
        purchaserIds: ["purchaser"],
      })
    ).toBe(false);
  });
});
