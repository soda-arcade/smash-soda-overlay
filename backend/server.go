package backend

import (
	"fmt"
	"net/http"

	"github.com/gorilla/websocket"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

var (
	stopServer chan bool
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

func handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer ws.Close()

	for {
		// Read message from browser
		_, msg, err := ws.ReadMessage()
		if err != nil {
			fmt.Println(err)
			break
		}
		// Print the message to the console
		//fmt.Printf("Received: %s\n", msg)

		msgString := string(msg)

		runtime.EventsEmit(Ctx, "app:socket", msgString)

	}
}

func StartServer() {
	stopServer = make(chan bool)

	http.HandleFunc("/ws", handleConnections)
	server := &http.Server{Addr: ":8080"}

	go func() {
		fmt.Println("Server started on :8080")
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			fmt.Printf("ListenAndServe: %v\n", err)
		}
	}()

	<-stopServer
	if err := server.Close(); err != nil {
		fmt.Printf("Server Close: %v\n", err)
	}
	fmt.Println("Server stopped")
}

func StopServer() {
	stopServer <- true
}
