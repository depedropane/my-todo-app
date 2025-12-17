package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	// "strconv" // Hapus ini jika tidak dipakai, atau biarkan jika nanti butuh konversi ID
	
	_ "github.com/go-sql-driver/mysql"
)

// Todo struct
type Todo struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}

var db *sql.DB

func main() {
	var err error
	// Pastikan username:password benar
	dsn := "root:@tcp(127.0.0.1:3306)/todo_db"
	db, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatal("Gagal konek database:", err)
	}

	// --- INI BAGIAN PENTING: KITA PAKAI STANDARD LIBRARY (net/http) ---
	// Bukan pakai Gin
	mux := http.NewServeMux()

	mux.HandleFunc("GET /todos", getTodos)
	mux.HandleFunc("POST /todos", createTodo)
	mux.HandleFunc("PUT /todos/{id}", updateTodo)
	mux.HandleFunc("DELETE /todos/{id}", deleteTodo)

	handler := enableCORS(mux)

	fmt.Println("Server Backend (Tanpa Framework) jalan di port 8080...")
	log.Fatal(http.ListenAndServe(":8080", handler))
}

// --- HANDLERS ---

func getTodos(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	rows, err := db.Query("SELECT id, title, completed FROM todos")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var todos []Todo
	for rows.Next() {
		var t Todo
		rows.Scan(&t.ID, &t.Title, &t.Completed)
		todos = append(todos, t)
	}
	if todos == nil {
		todos = []Todo{}
	}

	json.NewEncoder(w).Encode(todos)
}

func createTodo(w http.ResponseWriter, r *http.Request) {
	var t Todo
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	res, err := db.Exec("INSERT INTO todos (title) VALUES (?)", t.Title)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	id, _ := res.LastInsertId()
	t.ID = int(id)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(t)
}

func updateTodo(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")
	
	var t Todo
	if err := json.NewDecoder(r.Body).Decode(&t); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	_, err := db.Exec("UPDATE todos SET completed = ? WHERE id = ?", t.Completed, idStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}

func deleteTodo(w http.ResponseWriter, r *http.Request) {
	idStr := r.PathValue("id")

	_, err := db.Exec("DELETE FROM todos WHERE id = ?", idStr)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}