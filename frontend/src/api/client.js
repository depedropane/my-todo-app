const API_URL = "http://localhost:8080";

const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  
  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.reload();
  }
  return res;
};

// --- AUTH ---
export const loginAPI = async (username, password) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("token", data.token);
    return true;
  }
  return false;
};

export const registerAPI = async (username, password) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.ok;
};

// --- TODOS ---
export const getTodos = async () => {
  const res = await fetchWithAuth("/todos");
  return res.ok ? res.json() : [];
};

// UPDATE BAGIAN INI: Menerima object data (bukan cuma title)
export const createTodo = (todoData) => {
  return fetchWithAuth("/todos", {
    method: "POST",
    body: JSON.stringify(todoData) 
  });
};

export const updateTodo = (id, status) => fetchWithAuth(`/todos/${id}`, {
  method: "PUT", body: JSON.stringify({ completed: !status })
});

export const deleteTodo = (id) => fetchWithAuth(`/todos/${id}`, { method: "DELETE" });