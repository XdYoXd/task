package src

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (api *Api) DeleteBook(c *gin.Context) {
	title := c.Query("title")
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "неверные параметр title",
		})
		return
	}

	n, err := api.Db.DeleteBookByTitle(title)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "internal server error",
		})
		api.Logger.Println("Error in DeleteBook method: " + err.Error())
	}

	if n == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "книга не найдена",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "книг удалено: " + strconv.Itoa(n),
	})

}
