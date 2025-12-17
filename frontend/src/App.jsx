import { useState, useEffect } from 'react'

// Alamat Backend Go kita
const API_URL = "http://localhost:8080/todos"

function App() {
  const [todos, setTodos] = useState([])
  const [newTitle, setNewTitle] = useState("")

  // 1. Fetch Data (READ)
  // Dijalankan sekali saat aplikasi dibuka
  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL)
      const data = await res.json()
      setTodos(data)
    } catch (error) {
      console.error("Gagal ambil data:", error)
    }
  }

  // 2. Tambah Data (CREATE)
  const handleAdd = async (e) => {
    e.preventDefault()
    if (!newTitle) return

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, completed: false })
    })

    setNewTitle("") // Reset input
    fetchTodos()    // Refresh list
  }

  // 3. Update Status (UPDATE)
  const handleToggle = async (id, currentStatus) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !currentStatus })
    })
    fetchTodos()
  }

  // 4. Hapus Data (DELETE)
  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE"
    })
    fetchTodos()
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto", fontFamily: "sans-serif" }}>
      <h1>Todo List Fullstack</h1>
      
      {/* Form Input */}
      <form onSubmit={handleAdd} style={{ display: "flex", marginBottom: "20px" }}>
        <input 
          type="text" 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Tugas baru..."
          style={{ flex: 1, padding: "10px", fontSize: "16px" }}
        />
        <button type="submit" style={{ padding: "10px 20px", cursor: "pointer" }}>
          Tambah
        </button>
      </form>

      {/* List Todos */}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <li key={todo.id} style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            padding: "10px", 
            borderBottom: "1px solid #eee",
            backgroundColor: todo.completed ? "#f9f9f9" : "white"
          }}>
            <span 
              onClick={() => handleToggle(todo.id, todo.completed)}
              style={{ 
                textDecoration: todo.completed ? "line-through" : "none",
                cursor: "pointer",
                flex: 1,
                color: todo.completed ? "gray" : "black"
              }}
            >
              {todo.title}
            </span>
            <button 
              onClick={() => handleDelete(todo.id)}
              style={{ marginLeft: "10px", color: "red", border: "none", background: "none", cursor: "pointer", fontWeight: "bold" }}
            >
              Hapus
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App