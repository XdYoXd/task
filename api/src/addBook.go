package src

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *Api) AddBook(c *gin.Context) {

	title := c.Query("title")
	author := c.Query("author")
	genre := c.Query("genre")
	description := c.Query("description")

	if title == "" || author == "" || genre == "" || description == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "неверные параметры",
		})
		return
	}

	status, _ := api.Db.GetBookByTitleAndAuthor(title, author)
	if status != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "книга уже сохранена",
		})
		return
	}

	err := api.Db.AddBook(title, author, genre, description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Internal server error",
		})
		api.Logger.Println("Error in addBook method: " + err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "книга успешно сохранена",
	})

}
