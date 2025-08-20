import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { localApi } from "@/lib/localApi";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  if (res.ok) return res;

  // Fallback to local API for common endpoints when server is unavailable in production
  try {
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;

    if (method === "POST" && path === "/api/users") {
      const created = await localApi.createUser(data as any);
      return new Response(JSON.stringify(created), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "PUT" && path.startsWith("/api/users/")) {
      const id = path.split("/").pop() as string;
      const updated = await localApi.updateUser(id, data as any);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "POST" && path === "/api/expenses") {
      const created = await localApi.createExpense(data as any);
      return new Response(JSON.stringify(created), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "PUT" && path.startsWith("/api/expenses/")) {
      const id = path.split("/").pop() as string;
      const updated = await localApi.updateExpense(id, data as any);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "DELETE" && path.startsWith("/api/expenses/")) {
      const id = path.split("/").pop() as string;
      await localApi.deleteExpense(id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST" && path === "/api/vendors") {
      const created = await localApi.createVendor(data as any);
      return new Response(JSON.stringify(created), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "PUT" && path.startsWith("/api/vendors/")) {
      const id = path.split("/").pop() as string;
      const updated = await localApi.updateVendor(id, data as any);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "DELETE" && path.startsWith("/api/vendors/")) {
      const id = path.split("/").pop() as string;
      await localApi.deleteVendor(id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST" && path === "/api/guests") {
      const created = await localApi.createGuest(data as any);
      return new Response(JSON.stringify(created), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "PUT" && path.startsWith("/api/guests/")) {
      const id = path.split("/").pop() as string;
      const updated = await localApi.updateGuest(id, data as any);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "DELETE" && path.startsWith("/api/guests/")) {
      const id = path.split("/").pop() as string;
      await localApi.deleteGuest(id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST" && path === "/api/tasks") {
      const created = await localApi.createTask(data as any);
      return new Response(JSON.stringify(created), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "PUT" && path.startsWith("/api/tasks/")) {
      const id = path.split("/").pop() as string;
      const updated = await localApi.updateTask(id, data as any);
      return new Response(JSON.stringify(updated), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "DELETE" && path.startsWith("/api/tasks/")) {
      const id = path.split("/").pop() as string;
      await localApi.deleteTask(id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (method === "POST" && path === "/api/inspirations") {
      const created = await localApi.createInspiration(data as any);
      return new Response(JSON.stringify(created), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    if (method === "DELETE" && path.startsWith("/api/inspirations/")) {
      const id = path.split("/").pop() as string;
      await localApi.deleteInspiration(id);
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
    }
  } catch {}

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const endpoint = queryKey.join("/") as string;
    const res = await fetch(endpoint, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    if (res.ok) return await res.json();

    // Fallback for lists
    try {
      const urlObj = new URL(endpoint, window.location.origin);
      const path = urlObj.pathname;
      const parts = path.split("/").filter(Boolean);
      if (parts[0] === "api" && parts[1] === "users" && parts[3]) {
        const userId = parts[2];
        const resource = parts[3];
        if (resource === "expenses") return await localApi.listExpenses(userId);
        if (resource === "vendors") return await localApi.listVendors(userId);
        if (resource === "guests") return await localApi.listGuests(userId);
        if (resource === "tasks") return await localApi.listTasks(userId);
        if (resource === "inspirations") return await localApi.listInspirations(userId);
      }
    } catch {}

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
