import API_BASE from "./config";

function authHeaders(json) {
  const headers = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  const token = localStorage.getItem("classfc_token");

  if (token) {
    headers["Authorization"] = "Bearer " + token;
  }

  return headers;
}

// 서버 응답 확인
async function checkResponse(res) {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "HTTP " + res.status);
  }

  return res.json();
}

async function get(path) {
  const res = await fetch(API_BASE + path, {
    headers: authHeaders(false),
  });

  return checkResponse(res);
}

async function post(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(body || {}),
  });

  return checkResponse(res);
}

async function put(path, body) {
  const res = await fetch(API_BASE + path, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(body || {}),
  });

  return checkResponse(res);
}

async function del(path) {
  const res = await fetch(API_BASE + path, {
    method: "DELETE",
    headers: authHeaders(false),
  });

  return checkResponse(res);
}

const api = { get, post, put, del };

export default api;
