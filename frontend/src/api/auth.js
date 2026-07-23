import api, { setTokens, clearTokens } from "./axios";

export async function login(username, password) {
  const { data } = await api.post("/auth/login/", { username, password });
  setTokens({ access: data.access, refresh: data.refresh });
  return data.user;
}

export function logout() {
  clearTokens();
}

export async function fetchMe() {
  const { data } = await api.get("/auth/me/");
  return data;
}

export async function fetchEmployees(params = {}) {
  const { data } = await api.get("/auth/employees/", { params });
  return data;
}

export async function register(payload) {
  const { data } = await api.post("/auth/register/", payload);
  return data;
}

export async function fetchManagers() {
  const { data } = await api.get("/auth/managers/");
  return data;
}

