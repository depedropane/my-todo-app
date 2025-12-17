import { useState, useEffect } from "react";
import { loginAPI, registerAPI, getTodos, createTodo, updateTodo, deleteTodo } from "./api/client";
import TodoForm from "./components/TodoForm";
import TodoItem from "./components/TodoItem";
import { 
  FaTasks, FaSignOutAlt, FaUserCircle, 
  FaCalendarDay, FaFire, FaCheckDouble, 
  FaList, FaPlusCircle 
} from "react-icons/fa";
import "./App.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [todos, setTodos] = useState([]);
  
  // State Navigasi (Default: 'all')
  // Opsi: 'add', 'all', 'today', 'high', 'completed'
  const [activePage, setActivePage] = useState("all");

  // State Login
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    if (token) loadTodos();
  }, [token]);

  const loadTodos = async () => {
    const data = await getTodos();
    setTodos(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setTodos([]);
    setActivePage("all");
  };

  // Saat tambah sukses, pindah ke halaman 'all'
  const handleAdd = async (todoData) => {
    await createTodo(todoData);
    await loadTodos();
    setActivePage("all"); // Redirect ke halaman utama
    alert("Tugas berhasil ditambahkan!");
  };

  const handleToggle = async (id, status) => {
    await updateTodo(id, status);
    loadTodos();
  };

  const handleDelete = async (id) => {
    if (confirm("Hapus tugas ini?")) {
      await deleteTodo(id);
      loadTodos();
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isRegister) {
      if (await registerAPI(username, password)) alert("Register berhasil! Silakan login.");
    } else {
      if (await loginAPI(username, password)) setToken(localStorage.getItem("token"));
      else alert("Login Gagal");
    }
  };

  // --- LOGIKA FILTERING ---
  const getFilteredTodos = () => {
    const todayStr = new Date().toISOString().split('T')[0];

    return todos.filter((todo) => {
      if (activePage === "today") return todo.due_date === todayStr;
      if (activePage === "high") return todo.priority === "high" && !todo.completed;
      if (activePage === "completed") return todo.completed;
      return true; // Untuk 'all'
    });
  };

  // --- PENGATUR KONTEN HALAMAN ---
  const renderContent = () => {
    // 1. Jika Halaman Tambah Tugas
    if (activePage === "add") {
      return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2 style={{marginBottom: "20px", color: "#4f46e5"}}>✍️ Buat Tugas Baru</h2>
            <p style={{marginBottom: "20px", color: "#6b7280"}}>
                Isi detail di bawah ini untuk menambahkan target produktivitas baru.
            </p>
            <TodoForm onAdd={handleAdd} />
        </div>
      );
    }

    // 2. Jika Halaman List (All, Today, High, Completed)
    const filteredTodos = getFilteredTodos();
    
    // Tentukan Judul Halaman
    let title = "Semua Tugas";
    if (activePage === "today") title = "📅 Tugas Hari Ini";
    if (activePage === "high") title = "🔥 Prioritas Tinggi";
    if (activePage === "completed") title = "✅ Riwayat Selesai";

    return (
      <>
        <header className="header">
          <h1>{title}</h1>
          <span style={{color: "#6b7280", fontWeight: "500"}}>
             {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </header>

        {/* List Tugas */}
        <ul className="todo-list-container">
          {filteredTodos.length === 0 ? (
              <div style={{textAlign: "center", padding: "60px", color: "#9ca3af"}}>
                  <p style={{fontSize: "1.2rem", marginBottom: "10px"}}>📭</p>
                  Belum ada tugas di kategori ini.
                  {activePage !== 'completed' && (
                      <div 
                        style={{color: "#4f46e5", cursor: "pointer", marginTop: "10px", fontWeight: "bold"}}
                        onClick={() => setActivePage('add')}
                      >
                        + Buat Tugas Baru
                      </div>
                  )}
              </div>
          ) : (
            filteredTodos.map((todo) => (
                <TodoItem 
                key={todo.id} 
                todo={todo} 
                onToggle={handleToggle} 
                onDelete={handleDelete} 
                />
            ))
          )}
        </ul>
      </>
    );
  };

  // --- HALAMAN LOGIN ---
  if (!token) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h2 style={{marginBottom: "20px", color: "#111827", fontWeight: "800"}}>
            TaskPro Login
          </h2>
          <form onSubmit={handleAuth} style={{display: "flex", flexDirection:"column", gap: "10px"}}>
            <input 
                placeholder="Username" 
                value={username} 
                onChange={e=>setUsername(e.target.value)} 
                className="main-input"
            />
            <input 
                type="password" 
                placeholder="Password" 
                value={password} 
                onChange={e=>setPassword(e.target.value)} 
                className="main-input"
            />
            <button type="submit" className="btn-add" style={{justifyContent: "center", marginTop: "10px", width: "100%"}}>
              {isRegister ? "Daftar" : "Masuk"}
            </button>
          </form>
          <p onClick={() => setIsRegister(!isRegister)} style={{marginTop: "20px", color: "#4f46e5", cursor: "pointer"}}>
            {isRegister ? "Sudah punya akun? Login" : "Belum punya akun? Daftar"}
          </p>
        </div>
      </div>
    );
  }

  // --- HALAMAN DASHBOARD ---
  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="brand">
          <FaTasks size={24} /> TaskPro
        </div>
        
        {/* Tombol Besar Tambah */}
        <div style={{marginBottom: "20px"}}>
            <button 
                className="btn-add" 
                style={{width: "100%", justifyContent: "center", background: "#4f46e5"}}
                onClick={() => setActivePage('add')}
            >
                <FaPlusCircle /> Tambah Tugas
            </button>
        </div>

        <nav>
          <div 
            className={`menu-item ${activePage === 'all' ? 'active' : ''}`} 
            onClick={() => setActivePage('all')}
          >
            <FaList style={{marginRight: "8px"}}/> Semua Tugas
          </div>
          
          <div 
            className={`menu-item ${activePage === 'today' ? 'active' : ''}`}
            onClick={() => setActivePage('today')}
          >
            <FaCalendarDay style={{marginRight: "8px"}}/> Hari Ini
          </div>
          
          <div 
            className={`menu-item ${activePage === 'high' ? 'active' : ''}`}
            onClick={() => setActivePage('high')}
          >
            <FaFire style={{marginRight: "8px"}}/> Prioritas Tinggi
          </div>
          
          <div 
            className={`menu-item ${activePage === 'completed' ? 'active' : ''}`}
            onClick={() => setActivePage('completed')}
          >
            <FaCheckDouble style={{marginRight: "8px"}}/> Selesai
          </div>
        </nav>

        <div className="user-profile">
            <div style={{display: "flex", alignItems: "center", gap: "10px", marginBottom: "15px"}}>
                <FaUserCircle size={32} color="#9ca3af"/>
                <div>
                    <div style={{fontWeight: "bold", color: "#374151"}}>User</div>
                    <div style={{fontSize: "0.8rem", color: "#6b7280"}}>Online</div>
                </div>
            </div>
            <button onClick={handleLogout} className="btn-add" style={{background: "#fee2e2", color: "#ef4444", width: "100%", justifyContent: "center"}}>
                <FaSignOutAlt /> Logout
            </button>
        </div>
      </aside>

      {/* CONTENT UTAMA */}
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;