package main

import (
	"fmt"
	"net/http"
)

func main() {
	InitDB() // Panggil fungsi dari db.go
	
	mux := http.NewServeMux()

	// Route Publik (Bisa diakses siapa saja)
	mux.HandleFunc("POST /register", Register)
	mux.HandleFunc("POST /login", Login)

	// Route Terkunci (Harus Login / Pakai AuthMiddleware)
	mux.HandleFunc("GET /todos", AuthMiddleware(GetTodos))
	mux.HandleFunc("POST /todos", AuthMiddleware(CreateTodo))
	mux.HandleFunc("PUT /todos/{id}", AuthMiddleware(UpdateTodo))
	mux.HandleFunc("DELETE /todos/{id}", AuthMiddleware(DeleteTodo))

	// CORS (Agar React bisa akses)
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		mux.ServeHTTP(w, r)
	})

	fmt.Println("Server jalan di port 8080...")
	http.ListenAndServe(":8080", handler)
}