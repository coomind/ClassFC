const host = window.location.hostname;

let API_BASE;
if (host === "localhost" || host === "127.0.0.1" || host === "") {
  API_BASE = "http://127.0.0.1:3001";
} else {
  API_BASE = "https://classfc-api.onrender.com";
}

export default API_BASE;
