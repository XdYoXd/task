package src

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func (api *Api) ViewBooks(c *gin.Context) {
	var booksJSON []map[string]any

	v := c.Query("fields")
	if v == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "неверные параметры",
		})
	}

	fields := strings.Split(v, ",") /*  field1,field2,field3 */

	__offset := c.Query("offset")
	var offset int

	if __offset != "" {
		var err error

		offset, err = strconv.Atoi(__offset)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"error":   true,
				"message": "неверный параметр offset",
			})
			return
		}
	}

	__count := c.Query("count")
	count, err := strconv.Atoi(__count)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "неверный параметр count",
		})
		return
	}

	books, err := api.Db.ViewBooks()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "internal server error",
		})
		api.Logger.Println("Error in ViewBooks method: " + err.Error())
		return
	}

	var b_count int
	for x, b := range books {
		if x != 0 {
			if x <= offset {
				continue
			}
		}

		b_count++

		if count != -1 {
			if b_count > count {
				break
			}
		}

		var bookMap = make(map[string]interface{})

		for _, v := range fields {
			if v == "title" {
				bookMap[v] = b.Title
			}
			if v == "author" {
				bookMap[v] = b.Author
			}
			if v == "genre" {
				bookMap[v] = b.Genre
			}
			if v == "description" {
				bookMap[v] = b.Description
			}
			if v == "addTimestamp" {
				bookMap[v] = b.AddTimestamp
			}
		}
		booksJSON = append(booksJSON, bookMap)
	}

	c.JSON(200, gin.H{
		"error": false,
		"books": booksJSON,
	})

}
