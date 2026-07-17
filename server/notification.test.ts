import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";
import {
  alertOwner,
  createBroadcastNotification,
  createNotification,
} from "./notificationRouter";

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

    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

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

    (getDb as ReturnType<typeof vi.fn>).mockResolvedValue(mockDb);

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
    await alertOwner("Test Alert", "Something happened");

    expect(notifyOwner).toHaveBeenCalledWith({
      title: "Test Alert",
      content: "Something happened",
    });
  });

  it("alertOwner does not throw when notifyOwner fails", async () => {
    (notifyOwner as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("Service down"));

    // Should not throw
    await expect(alertOwner("Fail Test", "Should not crash")).resolves.toBeUndefined();
  });
});
