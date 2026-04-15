// tests/routers/department.test.ts
import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: null }),
}));

vi.mock("@/server/trpc/context", () => ({
  createContext: vi.fn(),
}));

import { departmentRouter } from "@/server/trpc/routers/department";

describe("Department Router", () => {
  let mockContext: any;
  let mockFindFirst: any;
  let mockDelete: any;
  let mockTransaction: any;

  beforeEach(() => {
    // Create mock functions
    mockFindFirst = vi.fn();
    mockDelete = vi.fn();
    mockTransaction = vi.fn();

    // Mock the context
    mockContext = {
      db: {
        department: {
          findFirst: mockFindFirst,
          delete: mockDelete,
        },
        $transaction: mockTransaction,
      },
      user: { id: "user123", email: "test@example.com" },
      org: { id: "org123", name: "Test Org", slug: "test" },
      membership: { role: "ADMIN" },
      isAdmin: true,
      hasActiveAccess: true,
    };
  });

  it("should delete a department", async () => {
    // Setup mocks
    const mockDepartment = {
      id: "dept123",
      name: "Sales",
      orgId: "org123",
    };

    mockFindFirst.mockResolvedValue(mockDepartment);
    mockDelete.mockResolvedValue(mockDepartment);

    // Create a caller with mock context
    const caller = departmentRouter.createCaller(mockContext);

    // Call the mutation
    const result = await caller.delete({
      departmentId: "dept123",
      departmentName: "Sales",
    });

    // Assertions
    expect(result.department).toEqual(mockDepartment);
    expect(mockDelete).toHaveBeenCalledWith({
      where: { id: "dept123" },
    });
  });

  it("should throw error if department not found", async () => {
    mockFindFirst.mockResolvedValue(null);

    const caller = departmentRouter.createCaller(mockContext);

    await expect(
      caller.delete({
        departmentId: "invalid",
        departmentName: "Sales",
      }),
    ).rejects.toThrow();
  });
});
