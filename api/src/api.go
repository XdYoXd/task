package src

import (
	"fmt"
	"log"

	"github.com/gin-gonic/gin"
)

type Api struct {
	Server string
	Logger log.Logger
	Db     *Database
}

func RunApi() {
	gin.SetMode(gin.ReleaseMode)

	api := Api{
		Server: "127.0.0.1",
		Logger: *log.Default(),
	}

	/*  Connect to the database */
	db, err := api.DatabaseInit("../database/database.db")
	if err != nil {
		api.Logger.Println("Database error: " + err.Error())
		return
	}

	api.Db = db
	api.Logger.Println("Successfully connected to the database")

	/*  Start gin */
	router := gin.Default()

	router.GET("/getBook", api.GetBook)
	router.GET("/getGenres", api.GetGenres)
	router.GET("/addBook", api.AddBook)
	router.GET("/deleteBook", api.DeleteBook)
	router.GET("/viewBooks", api.ViewBooks)

	err = router.Run("127.0.0.1:8888")
	if err != nil {
		fmt.Println(err)
	}

}
