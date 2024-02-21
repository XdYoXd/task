package src

import (
	"database/sql"
	"os"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type Database struct {
	Db *sql.DB
}

type Book struct {
	Title        string
	Author       string
	Genre        string
	Description  string
	AddTimestamp time.Time
}

/*
init database
*/
func (api *Api) DatabaseInit(dbPath string) (*Database, error) {

	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		api.Logger.Println(dbPath + " not found. Creating...")
		os.Create(dbPath)
		return api.DatabaseInit(dbPath)
	}

	if db.Ping() != nil {
		return nil, err
	}

	s, err := db.Prepare("CREATE TABLE IF NOT EXISTS books (" +
		"id INTEGER PRIMARY KEY, " +
		"title COLLATE NOCASE, " +
		"author COLLATE NOCASE, " +
		"genre COLLATE NOCASE, " +
		"description COLLATE NOCASE, " +
		"add_timestamp TIMESTAMP" +
		")")

	if err != nil {
		return nil, err
	}

	_, err = s.Exec()
	if err != nil {
		return nil, err
	}

	return &Database{
		Db: db,
	}, nil

}

/*
Get only unique genres
*/
func (db *Database) GetGenres() ([]string, error) {
	rows, err := db.Db.Query("SELECT DISTINCT genre FROM books")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var genres []string

	for rows.Next() {
		var genre string
		if err := rows.Scan(&genre); err != nil {
			return nil, err
		}
		genres = append(genres, genre)
	}

	return genres, nil
}

/*
Add book to the database (books table)
*/
func (db *Database) AddBook(bookTitle, author, genre, description string) error {
	_, err := db.Db.Exec("INSERT OR REPLACE INTO books (title, author, genre, description, add_timestamp ) VALUES (?, ?, ?, ?, ?)", bookTitle, author, genre, description, time.Now())
	return err

}

/*
Get book
*/
func GetBook(title, author, genre, keyPhrase string, db *Database) ([]*Book, error) {
	var books []*Book
	var rows *sql.Rows
	var err error

	if keyPhrase != "" {
		rows, err = db.Db.Query("SELECT * FROM books WHERE author LIKE LOWER(?) OR LOWER(title) LIKE LOWER(?)", "%"+keyPhrase+"%", "%"+keyPhrase+"%")
	} else if title != "" && author != "" {
		rows, err = db.Db.Query("SELECT * FROM books WHERE LOWER(title) = LOWER(?) AND LOWER(author) = LOWER(?)", title, author)
	} else if title != "" {
		rows, err = db.Db.Query("SELECT * FROM books where LOWER(title) = LOWER(?)", title)
	} else if author != "" {
		rows, err = db.Db.Query("SELECT * FROM books WHERE LOWER(author) = LOWER(?)", author)
	}

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	for rows.Next() {
		var id int
		var title, author, genre, description string
		var timestamp time.Time

		err := rows.Scan(&id, &title, &author, &genre, &description, &timestamp)
		if err != nil {
			return nil, err
		}

		books = append(books, &Book{
			Title:        title,
			Author:       author,
			Genre:        genre,
			Description:  description,
			AddTimestamp: timestamp,
		})
	}

	return books, nil
}

/* view books */
func (db *Database) ViewBooks() ([]*Book, error) {
	var books []*Book

	rows, err := db.Db.Query("SELECT * FROM books")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var id int
		var title, author, genre, description string
		var timestamp time.Time

		err := rows.Scan(&id, &title, &author, &genre, &description, &timestamp)
		if err != nil {
			return nil, err
		}

		books = append(books, &Book{
			Title:        title,
			Author:       author,
			Genre:        genre,
			Description:  description,
			AddTimestamp: timestamp,
		})
	}

	return books, nil
}

/* delete book by title */
func (db *Database) DeleteBookByTitle(title string) (int, error) {
	stmt, err := db.Db.Prepare("DELETE FROM books WHERE LOWER(title) = LOWER(?)")
	if err != nil {
		return 0, err
	}
	defer stmt.Close()

	result, err := stmt.Exec(title)
	if err != nil {
		return 0, err
	}

	ra, err := result.RowsAffected()
	if err != nil {
		return 0, err
	}

	return int(ra), err
}

func (db *Database) GetBookByTitle(title string) ([]*Book, error) {
	return GetBook(title, "", "", "", db)
}

func (db *Database) GetBookByAuthor(author string) ([]*Book, error) {
	return GetBook("", author, "", "", db)
}

func (db *Database) GetBookByTitleAndAuthor(title, author string) ([]*Book, error) {
	return GetBook(title, author, "", "", db)
}

func (db *Database) GetBookByKeyPhrase(phrase string) ([]*Book, error) {
	return GetBook("", "", "", phrase, db)
}
