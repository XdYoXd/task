package src

import (
	"log"
	random "math/rand"
	"testing"
	"time"
)

type testBook struct {
	title       string
	author      string
	genre       string
	description string
}

var books = make([]testBook, 0)

const booksCount = 10000

func TestDatabaseInit(t *testing.T) {
	api := Api{
		Server: "127.0.0.1",
		Logger: *log.Default(),
	}

	db, err := api.DatabaseInit("../../database/database.db")
	if err != nil {
		t.Error(err)
		return
	}
	if db == nil {
		t.Error("db == nil")
		return
	}

	api.Db = db
	t.Run("TestAddBook", api.TestAddBook)
	t.Run("TestGetBook", api.TestGetBook)
	t.Run("TestDeleteBookByTitle", api.TestDeleteBookByTitle)
}

func (api *Api) TestAddBook(t *testing.T) {
	for i := 0; i <= booksCount; i++ {
		var b = testBook{title: randomString(15), author: randomString(5), genre: randomString(5), description: randomString(30)}
		err := api.Db.AddBook(b.title, b.author, b.genre, b.description)
		if err != nil {
			t.Error(err)
			return
		}
		books = append(books, b)
	}
}

func (api *Api) TestDeleteBookByTitle(t *testing.T) {
	for _, i := range books {
		n, err := api.Db.DeleteBookByTitle(i.title)
		if err != nil {
			t.Error(err)
			return
		}
		if n == 0 {
			t.Error("n == 0 ")
			return
		}
	}
}

func (api *Api) TestGetBook(t *testing.T) {
	for _, i := range books {
		// test case 1:
		b, err := GetBook(i.title, "", "", "", api.Db)
		if err != nil {
			t.Error(err)
			return
		}
		if b == nil {
			t.Error("Book not found")
			return
		}

		// test case 2:
		b, err = GetBook("", i.author, "", "", api.Db)
		if err != nil {
			t.Error(err)
			return
		}
		if b == nil {
			t.Error("Book not found")
			return
		}

		//  test case 3:
		b, err = GetBook(i.title, i.author, "", "", api.Db)
		if err != nil {
			t.Error(err)
			return
		}
		if b == nil {
			t.Error("Book not found")
			return
		}

		// test case 4:
		// use i.author, cause the key phrase is not specified, and the search by key phrase is searched in the author and title fields
		b, err = GetBook("", "", "", i.author, api.Db)
		if err != nil {
			t.Error(err)
			return
		}
		if b == nil {
			t.Error("Book not found")
			return
		}

	}

}
func randomString(length int) string {
	s1 := random.NewSource(time.Now().UnixNano())
	r1 := random.New(s1)
	const chars = "qwertyuioasdfghjkzxcvbnmQWERTYUIOASDFGHJKZXCVBNM1234567890"
	result := make([]byte, length)
	for i := 0; i < length; i++ {
		result[i] = chars[r1.Intn(len(chars))]
	}
	return string(result)
}
