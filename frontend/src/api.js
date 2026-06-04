import API_BASE from "./config";

function authHeaders(json) {
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem("classfc_token");
  if (token) headers["Authorization"] = "Bearer " + token;
  return headers;
}

async function get(path) {
  const res = await fetch(API_BASE + path, { headers: authHeaders(false) });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "HTTP " + res.status);
  }
  return res.json();
}

async function post(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(body || {})
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "HTTP " + res.status);
  }
  return res.json();
}

async function put(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(body || {})
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "HTTP " + res.status);
  }
  return res.json();
}

async function del(path) {
  const res = await fetch(API_BASE + path, {
    method: "DELETE",
    headers: authHeaders(false)
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(e.error || "HTTP " + res.status);
  }
  return res.json();
}

const api = { get, post, put, del };
export default api;
