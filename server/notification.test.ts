import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

// Mock the notification helper
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("Notification Router Helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("createNotification inserts a row into the notifications table", async () => {
    const mockInsert = vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    });
    const mockDb = { insert: mockInsert };

    const { getDb } = await import("./db");
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

    const { createNotification } = await import("./notificationRouter");

    await createNotification({
      userId: 1,
      title: "Test Notification",
      message: "This is a test",
      type: "system",
    });

    expect(mockInsert).toHaveBeenCalled();
  });

  it("createBroadcastNotification uses userId 0 for broadcasts", async () => {
    const mockValues = vi.fn().mockResolvedValue(undefined);
    const mockInsert = vi.fn().mockReturnValue({ values: mockValues });
    const mockDb = { insert: mockInsert };

    const { getDb } = await import("./db");
    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

    const { createBroadcastNotification } = await import("./notificationRouter");

    await createBroadcastNotification({
      title: "Broadcast Test",
      message: "Hello everyone",
    });

    expect(mockInsert).toHaveBeenCalled();
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 0,
        title: "Broadcast Test",
        message: "Hello everyone",
        type: "admin",
      })
    );
  });

  it("alertOwner calls notifyOwner with title and content", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const { alertOwner } = await import("./notificationRouter");

    await alertOwner("Test Alert", "Something happened");

    expect(notifyOwner).toHaveBeenCalledWith({
      title: "Test Alert",
      content: "Something happened",
    });
  });

  it("alertOwner does not throw when notifyOwner fails", async () => {
    const { notifyOwner } = await import("./_core/notification");
    (notifyOwner as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Service down"));

    const { alertOwner } = await import("./notificationRouter");

    // Should not throw
    await expect(alertOwner("Fail Test", "Should not crash")).resolves.toBeUndefined();
  });
});
