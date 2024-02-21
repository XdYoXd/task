package src

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (api *Api) GetGenres(c *gin.Context) {

	genres, err := api.Db.GetGenres()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "internal server error",
		})
		api.Logger.Println("Error in GetGenres method: " + err.Error())
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"genres": genres,
	})

}
