package main

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type Todo struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"` // Frontend tahunya ini boolean
	Priority  string `json:"priority"`
	DueDate   string `json:"dueDate"`
}

func GetTodos(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)

	// PERBAIKAN: Kita ambil kolom 'status' dari DB, bukan 'completed'
	query := `
		SELECT id, title, status, 
		COALESCE(priority, 'medium'), 
		COALESCE(DATE_FORMAT(due_date, '%Y-%m-%d'), '') 
		FROM todos WHERE user_id = ? ORDER BY id DESC`

	rows, err := DB.Query(query, userID)
	if err != nil {
		fmt.Println("Error Query:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var t Todo
		var statusStr string // Variabel sementara untuk menampung teks status

		// Scan ke statusStr dulu
		if err := rows.Scan(&t.ID, &t.Title, &statusStr, &t.Priority, &t.DueDate); err != nil {
			fmt.Println("Error Scan:", err)
			continue
		}

		// LOGIKA TRANSLASI: DB (String) -> Go (Bool)
		// Jika status di DB 'completed', maka Completed jadi true. Selain itu false.
		t.Completed = (statusStr == "completed")

		todos = append(todos, t)
	}
	
	if todos == nil { todos = []Todo{} }
	json.NewEncoder(w).Encode(todos)
}

func CreateTodo(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(UserIDKey).(int)
	var t Todo
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, "Invalid JSON", http.StatusBadRequest)
		return
	}

	if t.Priority == "" { t.Priority = "medium" }
	
	// Default status untuk tugas baru adalah 'pending'
	status := "pending"

	var err error
	if t.DueDate == "" {
		_, err = DB.Exec("INSERT INTO todos (user_id, title, priority, status) VALUES (?, ?, ?, ?)", 
			userID, t.Title, t.Priority, status)
	} else {
		_, err = DB.Exec("INSERT INTO todos (user_id, title, priority, status, due_date) VALUES (?, ?, ?, ?, ?)", 
			userID, t.Title, t.Priority, status, t.DueDate)
	}

	if err != nil {
		fmt.Println("Error Insert:", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func UpdateTodo(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	var t Todo
	json.NewDecoder(r.Body).Decode(&t)
	
	// LOGIKA TRANSLASI: Go (Bool) -> DB (String)
	statusStr := "pending"
	if t.Completed {
		statusStr = "completed"
	}

	// Update kolom 'status' di database
	_, err := DB.Exec("UPDATE todos SET status = ? WHERE id = ?", statusStr, id)
	if err != nil {
		fmt.Println("Error Update:", err) // Cek error di terminal
	}
}

func DeleteTodo(w http.ResponseWriter, r *http.Request) {
	id := r.PathValue("id")
	DB.Exec("DELETE FROM todos WHERE id = ?", id)
}