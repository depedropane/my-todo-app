package main

import (
	"database/sql"
	"log"

	_ "github.com/go-sql-driver/mysql"
)

var DB *sql.DB

func InitDB() {
	var err error
	// Sesuaikan user:password jika perlu
	dsn := "root:@tcp(127.0.0.1:3306)/todo_db?parseTime=true"
	DB, err = sql.Open("mysql", dsn)
	if err != nil {
		log.Fatal(err)
	}

	if err := DB.Ping(); err != nil {
		log.Fatal("Database tidak merespon:", err)
	}
	log.Println("Database Terkoneksi!")
}