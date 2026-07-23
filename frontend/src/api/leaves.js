import api from "./axios";

export async function fetchMyLeaves(params = {}) {
  const { data } = await api.get("/leaves/", { params });
  return data;
}

export async function applyLeave(payload) {
  const { data } = await api.post("/leaves/", payload);
  return data;
}

export async function cancelLeave(id) {
  const { data } = await api.delete(`/leaves/${id}/`);
  return data;
}

export async function approveLeave(id, decision_note = "") {
  const { data } = await api.post(`/leaves/${id}/approve/`, { decision_note });
  return data;
}

export async function rejectLeave(id, decision_note = "") {
  const { data } = await api.post(`/leaves/${id}/reject/`, { decision_note });
  return data;
}

export async function fetchEmployeeDashboard() {
  const { data } = await api.get("/dashboard/employee/");
  return data;
}

export async function fetchManagerDashboard() {
  const { data } = await api.get("/dashboard/manager/");
  return data;
}

export async function fetchEmployeeStats() {
  const { data } = await api.get("/stats/employees/");
  return data;
}
