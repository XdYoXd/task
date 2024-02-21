package src

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *Api) GetBook(c *gin.Context) {
	var booksJSON []map[string]any
	var books []*Book
	var err error

	title := c.Query("title")
	author := c.Query("author")
	keyPhrase := c.Query("keyPhrase")

	if title == "" && author == "" && keyPhrase == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "неверные параметры",
		})
		return
	}
	if keyPhrase != "" {
		books, err = api.Db.GetBookByKeyPhrase(keyPhrase)
	} else if title != "" && author != "" {
		books, err = api.Db.GetBookByTitleAndAuthor(title, author)
	} else if title != "" {
		books, err = api.Db.GetBookByTitle(title)
	} else if author != "" {
		books, err = api.Db.GetBookByAuthor(author)
	} else {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "неверные параметры",
		})
		return
	}

	if books == nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "не могу найти книгу по вашим параметрам",
		})
		return
	}

	/* check if err != nil ( err var) */
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "internal server error",
		})
		api.Logger.Println("Error in GetBook method: " + err.Error())
		return
	}

	for _, b := range books {
		bookMap := map[string]interface{}{
			"title":        b.Title,
			"author":       b.Author,
			"genre":        b.Genre,
			"description":  b.Description,
			"addTimestamp": b.AddTimestamp.Format("15:04:05"),
		}

		booksJSON = append(booksJSON, bookMap)
	}

	c.JSON(200, gin.H{
		"error": false,
		"books": booksJSON,
	})
}
