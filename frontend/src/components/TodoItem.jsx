import { FaTrash, FaCheckCircle, FaRegCircle } from "react-icons/fa";

function TodoItem({ todo, onToggle, onDelete }) {
  
  // Fungsi memilih warna badge
  const getBadgeColor = (p) => {
    if (p === "high") return "#ef4444"; // Merah
    if (p === "medium") return "#f59e0b"; // Kuning/Orange
    return "#10b981"; // Hijau
  };

  return (
    <li className={`todo-item ${todo.completed ? "completed" : ""}`}>
      <div className="todo-left" onClick={() => onToggle(todo.id, todo.completed)}>
        {/* Ikon Checkbox */}
        <span className="check-icon">
          {todo.completed ? 
            <FaCheckCircle size={20} color="#10b981" /> : 
            <FaRegCircle size={20} color="#d1d5db" />
          }
        </span>
        
        {/* Detail Tugas */}
        <div className="todo-details">
          <span className="todo-title">{todo.title}</span>
          
          <div className="todo-meta">
            {/* Badge Priority */}
            <span className="badge" style={{ backgroundColor: getBadgeColor(todo.priority) }}>
              {todo.priority}
            </span>
            
            {/* Tampilan Tanggal */}
            {todo.due_date && (
               <span className="date-badge">
                 📅 {todo.due_date}
               </span>
            )}
          </div>
        </div>
      </div>

      {/* Tombol Hapus */}
      <button onClick={() => onDelete(todo.id)} className="delete-btn">
        <FaTrash />
      </button>
    </li>
  );
}

export default TodoItem;