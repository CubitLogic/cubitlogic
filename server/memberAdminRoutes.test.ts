import { describe, expect, it, vi } from "vitest";
import type { NextFunction, Request, Response } from "express";
import { requireSameOriginRequest } from "./memberAdminRoutes";

function createRequest(headers: Record<string, string>, protocol = "http"): Request {
  const normalizedHeaders = Object.fromEntries(
    Object.entries(headers).map(([name, value]) => [name.toLowerCase(), value]),
  );

  return {
    protocol,
    get(name: string) {
      return normalizedHeaders[name.toLowerCase()];
    },
  } as Request;
}

function createResponse() {
  const response = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      response.statusCode = code;
      return response;
    },
    json(body: unknown) {
      response.body = body;
      return response;
    },
  };

  return response as unknown as Response & typeof response;
}

describe("requireSameOriginRequest", () => {
  it("accepts a direct same-origin request", () => {
    const request = createRequest({
      host: "cubitlogic.com",
      origin: "https://cubitlogic.com",
    }, "https");
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    requireSameOriginRequest(request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });

  it("accepts a same-origin request behind the hosting proxy", () => {
    const request = createRequest({
      host: "internal-app:3000",
      origin: "https://cubitlogic.com",
      "x-forwarded-host": "cubitlogic.com",
      "x-forwarded-proto": "https",
    });
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    requireSameOriginRequest(request, response, next);

    expect(next).toHaveBeenCalledOnce();
    expect(response.statusCode).toBe(200);
  });

  it("rejects a cross-site request", () => {
    const request = createRequest({
      host: "cubitlogic.com",
      origin: "https://malicious.example",
    }, "https");
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    requireSameOriginRequest(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual({
      error: "This administrative request must come from Cubit Logic.",
    });
  });

  it("rejects a request without an origin", () => {
    const request = createRequest({ host: "cubitlogic.com" }, "https");
    const response = createResponse();
    const next = vi.fn() as NextFunction;

    requireSameOriginRequest(request, response, next);

    expect(next).not.toHaveBeenCalled();
    expect(response.statusCode).toBe(403);
  });
});
