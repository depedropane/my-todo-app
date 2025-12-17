package main

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// --- PERBAIKAN: Definisikan Key Context Sendiri ---
type contextKey string
const UserIDKey contextKey = "userID"
// --------------------------------------------------

var SecretKey = []byte("kunci_rahasia_ini_harus_aman")

type User struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// REGISTER
func Register(w http.ResponseWriter, r *http.Request) {
	var u User
	if err := json.NewDecoder(r.Body).Decode(&u); err != nil {
		http.Error(w, "Input tidak valid", http.StatusBadRequest)
		return
	}

	hashedPwd, _ := bcrypt.GenerateFromPassword([]byte(u.Password), bcrypt.DefaultCost)
	_, err := DB.Exec("INSERT INTO users (username, password_hash) VALUES (?, ?)", u.Username, hashedPwd)
	
	if err != nil {
		http.Error(w, "Username mungkin sudah dipakai", http.StatusConflict)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

// LOGIN
func Login(w http.ResponseWriter, r *http.Request) {
	var u User
	json.NewDecoder(r.Body).Decode(&u)

	var id int
	var dbHash string
	// Cari user di DB
	err := DB.QueryRow("SELECT id, password_hash FROM users WHERE username = ?", u.Username).Scan(&id, &dbHash)
	
	// Cek Password
	if err != nil || bcrypt.CompareHashAndPassword([]byte(dbHash), []byte(u.Password)) != nil {
		http.Error(w, "Username atau Password salah", http.StatusUnauthorized)
		return
	}

	// Buat Token JWT
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": id,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	})
	tokenString, _ := token.SignedString(SecretKey)

	json.NewEncoder(w).Encode(map[string]string{"token": tokenString})
}

// MIDDLEWARE (Satpam)
func AuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Butuh Login", http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return SecretKey, nil
		})

		if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid && err == nil {
			// PERBAIKAN: Gunakan UserIDKey saat menyimpan ke context
			ctx := context.WithValue(r.Context(), UserIDKey, int(claims["user_id"].(float64)))
			next(w, r.WithContext(ctx))
		} else {
			http.Error(w, "Token Salah/Expired", http.StatusUnauthorized)
		}
	}
}