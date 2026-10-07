import { beforeEach, describe, expect, it, vi } from "vitest";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { ENVIRONMENT } from "@/infrastructure/config/environment";

const { mockInstance } = vi.hoisted(() => ({
  mockInstance: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
    defaults: {
      headers: {
        common: {} as Record<string, string | undefined>,
      },
    },
  },
}));

vi.mock("axios", () => ({
  default: {
    create: vi.fn(() => mockInstance),
  },
}));

import Http from "@/infrastructure/http/http";

function createResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {} as InternalAxiosRequestConfig,
  };
}

describe("Http", () => {
  beforeEach(() => {
    mockInstance.get.mockReset();
    mockInstance.post.mockReset();
    mockInstance.put.mockReset();
    mockInstance.patch.mockReset();
    mockInstance.delete.mockReset();
    mockInstance.defaults.headers.common = {};
  });

  it("creates an axios instance with the API base URL and JSON content type", () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: ENVIRONMENT.API_BASE_URL,
      timeout: 15_000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  describe("get", () => {
    it("delegates to the axios instance and returns the response", async () => {
      const response = createResponse({ id: "1" });
      mockInstance.get.mockResolvedValueOnce(response);

      const result = await Http.get<{ id: string }>("/items", { params: { q: "test" } });

      expect(mockInstance.get).toHaveBeenCalledWith("/items", { params: { q: "test" } });
      expect(result).toEqual(response);
    });

    it("propagates request failures", async () => {
      const error = new Error("Network Error");
      mockInstance.get.mockRejectedValueOnce(error);

      await expect(Http.get("/items")).rejects.toThrow(error);
    });
  });

  describe("post", () => {
    it("delegates to the axios instance with data and config", async () => {
      const response = createResponse({ created: true });
      const payload = { name: "Ada" };
      const config = { headers: { "X-Request-Id": "abc" } };
      mockInstance.post.mockResolvedValueOnce(response);

      const result = await Http.post<{ created: boolean }>("/items", payload, config);

      expect(mockInstance.post).toHaveBeenCalledWith("/items", payload, config);
      expect(result).toEqual(response);
    });
  });

  describe("put", () => {
    it("delegates to the axios instance with data and config", async () => {
      const response = createResponse({ updated: true });
      const payload = { name: "Grace" };
      mockInstance.put.mockResolvedValueOnce(response);

      const result = await Http.put<{ updated: boolean }>("/items/1", payload);

      expect(mockInstance.put).toHaveBeenCalledWith("/items/1", payload, undefined);
      expect(result).toEqual(response);
    });
  });

  describe("patch", () => {
    it("delegates to the axios instance with data and config", async () => {
      const response = createResponse({ patched: true });
      const payload = { active: false };
      mockInstance.patch.mockResolvedValueOnce(response);

      const result = await Http.patch<{ patched: boolean }>("/items/1", payload);

      expect(mockInstance.patch).toHaveBeenCalledWith("/items/1", payload, undefined);
      expect(result).toEqual(response);
    });
  });

  describe("delete", () => {
    it("delegates to the axios instance and returns the response", async () => {
      const response = createResponse({ deleted: true });
      mockInstance.delete.mockResolvedValueOnce(response);

      const result = await Http.delete<{ deleted: boolean }>("/items/1");

      expect(mockInstance.delete).toHaveBeenCalledWith("/items/1", undefined);
      expect(result).toEqual(response);
    });
  });

  describe("setAuthToken", () => {
    it("sets the Bearer Authorization header on the shared instance", () => {
      Http.setAuthToken("token-123");

      expect(mockInstance.defaults.headers.common["Authorization"]).toBe("Bearer token-123");
    });
  });

  describe("removeAuthToken", () => {
    it("removes the Authorization header from the shared instance", () => {
      Http.setAuthToken("token-123");

      Http.removeAuthToken();

      expect(mockInstance.defaults.headers.common["Authorization"]).toBeUndefined();
    });
  });
});
