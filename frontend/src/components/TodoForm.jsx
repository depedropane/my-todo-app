import { useState } from "react";
import { FaPlus, FaFlag } from "react-icons/fa";

function TodoForm({ onAdd }) {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    // Kirim data object ke App.jsx
    onAdd({ title, priority, dueDate });
    
    // Reset form
    setTitle("");
    setPriority("medium");
    setDueDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form-card">
      <div className="input-group-main">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Apa targetmu hari ini?"
          className="main-input"
          autoFocus
        />
      </div>
      
      <div className="form-actions">
        {/* Dropdown Priority */}
        <div className="select-wrapper">
          <FaFlag style={{ color: "#6b7280" }} />
          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium</option>
            <option value="high">High Priority!</option>
          </select>
        </div>

        {/* Input Date */}
        <div className="date-wrapper">
           <input 
             type="date" 
             value={dueDate} 
             onChange={(e) => setDueDate(e.target.value)} 
           />
        </div>

        <button type="submit" className="btn-add">
          <FaPlus /> Tambah
        </button>
      </div>
    </form>
  );
}

export default TodoForm;