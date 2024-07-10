package main

import (
	"embed"
	"flag"
	"log"
	"strings"

	"github.com/go-gl/glfw/v3.3/glfw"
	"github.com/gorilla/websocket"
	"github.com/lxn/win"
	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.design/x/hotkey"

	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"syscall"
)

//go:embed frontend/dist
var assets embed.FS

var hwnd win.HWND
var config map[string]interface{}
var designMode bool
var monitors []*glfw.Monitor
var cssThemes map[string]string
var isClickThrough bool
var conn *websocket.Conn

func readConfig() (map[string]interface{}, bool) {
	// Get the %appdata% directory
	appData := os.Getenv("APPDATA")
	if appData == "" {
		fmt.Println("Error: APPDATA environment variable not set")
		return nil, false
	}

	// Construct the path to the config file
	configPath := filepath.Join(appData, "SmashSodaTwo", "config.json")

	// Read the file content
	data, err := ioutil.ReadFile(configPath)
	if err != nil {
		fmt.Println("Error reading config file:", err)
		return nil, false
	}

	// Parse the JSON content
	var jsonData map[string]interface{}
	if err := json.Unmarshal(data, &jsonData); err != nil {
		fmt.Println("Error parsing JSON:", err)
		return nil, false
	}

	// Return the JSON data
	return jsonData, true
}

func getProp(group, key string) (interface{}, bool) {
	if groupMap, ok := config[group].(map[string]interface{}); ok {
		if value, ok := groupMap[key]; ok {
			return value, true
		}
	}
	return nil, false
}

func getExecutableDir() (string, error) {
	exePath, err := os.Executable()
	if err != nil {
		return "", err
	}
	return filepath.Dir(exePath), nil
}

func toggleClickThrough() {
	if hwnd == 0 {
		fmt.Println("Window not found")
		return
	}

	exStyle := win.GetWindowLong(hwnd, win.GWL_EXSTYLE)
	if isClickThrough {
		// Remove WS_EX_TRANSPARENT to make the window interactable
		exStyle &^= win.WS_EX_TRANSPARENT
	} else {
		// Add WS_EX_TRANSPARENT to make the window click-through
		exStyle |= win.WS_EX_TRANSPARENT
	}
	win.SetWindowLong(hwnd, win.GWL_EXSTYLE, exStyle)
	isClickThrough = !isClickThrough
}

// Set the window to be click-through
func focus() {
	if designMode {
		return
	}
	exStyle := win.GetWindowLong(hwnd, win.GWL_EXSTYLE)
	exStyle &^= win.WS_EX_TRANSPARENT
	win.SetWindowLong(hwnd, win.GWL_EXSTYLE, exStyle)
}

// Set the window to be interactable
func blur() {
	if designMode {
		return
	}
	exStyle := win.GetWindowLong(hwnd, win.GWL_EXSTYLE)
	exStyle |= win.WS_EX_TRANSPARENT
	win.SetWindowLong(hwnd, win.GWL_EXSTYLE, exStyle)
}

func startup(ctx context.Context) {
	hwnd = win.FindWindow(nil, syscall.StringToUTF16Ptr("smash-soda-overlay"))
	exStyle := win.GetWindowLong(hwnd, win.GWL_EXSTYLE)
	exStyle |= win.WS_EX_LAYERED | win.WS_EX_TOOLWINDOW // Add WS_EX_TOOLWINDOW to hide from taskbar
	// Don't hide from taskbar in design mode
	if !designMode {
		exStyle &^= win.WS_EX_APPWINDOW
	}
	win.SetWindowLong(hwnd, win.GWL_EXSTYLE, exStyle)

	// Set the window to be click-through
	if !designMode {
		toggleClickThrough()
	}

	// Set window position
	if monitor, ok := getProp("Overlay", "monitor"); ok {

		// Initialize the GLFW library
		if glfwError := glfw.Init(); glfwError != nil {
			log.Fatalln("Failed to initialize GLFW:", glfwError)
		}
		defer glfw.Terminate()

		// Get the list of monitors
		monitors := glfw.GetMonitors()
		if len(monitors) == 0 {
			fmt.Println("No monitors found")
			return
		}
		for i, monitor := range monitors {
			name := monitor.GetName()
			mode := monitor.GetVideoMode()
			fmt.Printf("Monitor %d: %s\n", i+1, name)
			fmt.Printf("Resolution: %dx%d\n", mode.Width, mode.Height)

			// Add monitor to global list
			monitors = append(monitors, monitor)
		}

		monitorIndex := int(monitor.(float64))
		println("Monitor index:", monitorIndex)
		windowX := 0
		windowY := 0

		// Find the monitor
		if monitorIndex < len(monitors) {
			windowX, windowY = monitors[monitorIndex].GetPos()
			win.SetWindowPos(hwnd, 0, int32(windowX), int32(windowY), 0, 0, win.SWP_NOSIZE|win.SWP_NOZORDER)
			println("Window position set to", windowX, windowY)
		} else {
			fmt.Println("Monitor index out of range")
		}

	}

	// Register hotkeys
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	go registerChatHotkey(ctx)
	go registerZoomInHotkey(ctx)
	go registerZoomOutHotkey(ctx)
	go registerOpacityInHotkey(ctx)
	go registerOpacityOutHotkey(ctx)

}

func getThemes() (map[string]string, error) {
	// Get the executable directory
	dir, err := getExecutableDir()
	if err != nil {
		return nil, fmt.Errorf("error getting executable directory: %w", err)
	}

	// Construct the path to the "themes" folder
	themesDir := filepath.Join(dir, "themes")
	if _, err := os.Stat(themesDir); os.IsNotExist(err) {
		return nil, nil
	}

	// Read all CSS files in the "themes" folder
	cssThemes := make(map[string]string)
	err = filepath.Walk(themesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if !info.IsDir() && filepath.Ext(info.Name()) == ".css" {
			themeName := strings.TrimSuffix(info.Name(), filepath.Ext(info.Name()))
			cssThemes[themeName] = path
			fmt.Println("Found CSS theme:", themeName)
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("error reading themes directory: %w", err)
	}

	return cssThemes, nil
}

func getThemeContent(themeName string) (string, error) {
	themes, err := getThemes()
	if err != nil {
		return "", fmt.Errorf("error getting themes: %w", err)
	}

	themePath, exists := themes[themeName]
	if !exists {
		return "", fmt.Errorf("theme %s not found", themeName)
	}

	content, err := ioutil.ReadFile(themePath)
	if err != nil {
		return "", fmt.Errorf("error reading theme file: %w", err)
	}

	return string(content), nil
}

func registerChatHotkey(ctx context.Context) {

	hk := hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.KeyC)
	err := hk.Register()
	if err != nil {
		return
	}

	<-hk.Keydown()
	fmt.Printf("hotkey: %v is down\n", hk)

	runtime.WindowShow(ctx)
	runtime.EventsEmit(ctx, "app:shortcut", "chat:input")

	hk.Unregister()

	registerChatHotkey(ctx)

}

func registerZoomInHotkey(ctx context.Context) {

	hk := hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.Key(0xBB))
	err := hk.Register()
	if err != nil {
		return
	}

	<-hk.Keydown()
	fmt.Printf("hotkey: %v is down\n", hk)

	runtime.EventsEmit(ctx, "app:shortcut", "zoom:in")

	hk.Unregister()

	registerZoomInHotkey(ctx)

}

func registerZoomOutHotkey(ctx context.Context) {

	hk := hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.Key(0xBD))
	err := hk.Register()
	if err != nil {
		return
	}

	<-hk.Keydown()
	fmt.Printf("hotkey: %v is down\n", hk)

	runtime.EventsEmit(ctx, "app:shortcut", "zoom:out")

	hk.Unregister()

	registerZoomOutHotkey(ctx)

}

func registerOpacityInHotkey(ctx context.Context) {

	hk := hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.KeyUp)
	err := hk.Register()
	if err != nil {
		return
	}

	<-hk.Keydown()
	fmt.Printf("hotkey: %v is down\n", hk)

	runtime.EventsEmit(ctx, "app:shortcut", "opacity:in")

	hk.Unregister()

	registerOpacityInHotkey(ctx)

}

func registerOpacityOutHotkey(ctx context.Context) {

	hk := hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.KeyDown)
	err := hk.Register()
	if err != nil {
		return
	}

	<-hk.Keydown()
	fmt.Printf("hotkey: %v is down\n", hk)

	runtime.EventsEmit(ctx, "app:shortcut", "opacity:out")

	hk.Unregister()

	registerOpacityOutHotkey(ctx)

}

// Send string to Smash Soda
func sendMessage(message string) {
	if !designMode && conn != nil {
		// Send the message to Smash Soda
		if err := conn.WriteMessage(websocket.TextMessage, []byte(message)); err != nil {
			fmt.Println("Failed to send message to Smash Soda:", err)
		} else {
			fmt.Println("Message sent to Smash Soda")
		}
	}
}

func main() {

	// Get the themes
	cssThemes, themesErr := getThemes()
	if themesErr != nil {
		fmt.Println(themesErr)
		return
	}

	// Print the CSS themes
	for _, theme := range cssThemes {
		fmt.Println("Found CSS theme:", theme)
	}

	// Parse command line arguments
	flag.Parse()
	for _, arg := range flag.Args() {
		if arg == "design" {
			designMode = true
		}
	}

	// Read the config file
	var success bool
	config, success = readConfig()
	if !success {
		fmt.Println("Failed to read config")
		return
	}

	// Create an instance of the app structure
	app := NewApp()

	// Create application with options
	err := wails.Run(&options.App{
		Title:            "smash-soda-overlay",
		Frameless:        !designMode,
		WindowStartState: options.Maximised,
		AlwaysOnTop:      true,
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		OnStartup: startup,
		OnDomReady: func(ctx context.Context) {

			// Get initial theme
			themeContent := ""
			themeError := error(nil)
			theme, ok := getProp("Overlay", "theme")
			if ok {
				themeName := theme.(string)
				themeContent, themeError = getThemeContent(themeName)
				if themeError != nil {
					fmt.Println(themeError)
				}
			}

			// Update frontend with config
			runtime.EventsEmit(ctx, "app:start", map[string]interface{}{
				"designMode": designMode,
				"config":     config,
				"theme":      themeContent,
			})

			// On theme change
			runtime.EventsOn(ctx, "app:theme", func(optionalData ...interface{}) {
				if len(optionalData) > 0 {
					if themeName, ok := optionalData[0].(string); ok {
						themeContent, themeError = getThemeContent(themeName)
						if themeError != nil {
							fmt.Println(themeError)
						} else {
							runtime.EventsEmit(ctx, "app:theme", themeContent)
						}
					}
				}
			})

			// Listen for events from the frontend
			runtime.EventsOn(ctx, "app:focus", func(optionalData ...interface{}) {
				focus()
			})
			runtime.EventsOn(ctx, "app:blur", func(optionalData ...interface{}) {
				blur()
			})
			runtime.EventsOn(ctx, "app:message", func(optionalData ...interface{}) {
				// Send the message to Smash Soda
				if len(optionalData) > 0 {
					if message, ok := optionalData[0].(string); ok {
						sendMessage(message)
					}
				}
			})

			// Start a goroutine to continuously read messages from the WebSocket server
			if !designMode {

				// Connect to Smash Soda
				if port, ok := getProp("Socket", "port"); ok {
					fmt.Printf("Socket port: %v\n", port)

					// Connect to the Smash Soda WebSocket server
					var connError error
					conn, _, connError = websocket.DefaultDialer.Dial(fmt.Sprintf("ws://localhost:%v", port), nil)
					if connError != nil {
						fmt.Println("Failed to connect to Smash Soda:", connError)
						// Quit the application
						runtime.Quit(ctx)
					} else {

						// Set a custom close handler
						conn.SetCloseHandler(func(code int, text string) error {
							fmt.Printf("WebSocket closed with code: %d, text: %s\n", code, text)
							runtime.Quit(ctx)
							return nil
						})

						// Start a goroutine to read messages from the WebSocket server
						go func() {
							for {
								_, message, err := conn.ReadMessage()
								if err != nil {
									if websocket.IsCloseError(err, websocket.CloseNormalClosure, websocket.CloseGoingAway) {
										fmt.Println("WebSocket closed normally.")
									} else {
										fmt.Println("Failed to read message from Smash Soda:", err)
										runtime.Quit(ctx)
									}
									return
								}

								// If message was app:config
								if string(message) == "app:config" {
									runtime.EventsEmit(ctx, "app:config", config)
									var success bool
									config, success = readConfig()
									if !success {
										fmt.Println("Failed to read config")
									}

									// Get initial theme
									themeContent := ""
									if success {
										themeError := error(nil)
										theme, ok := getProp("Overlay", "theme")
										if ok {
											themeName := theme.(string)
											themeContent, themeError = getThemeContent(themeName)
											if themeError != nil {
												fmt.Println(themeError)
											}
										}
									}

									// Update frontend with config
									runtime.EventsEmit(ctx, "app:config", map[string]interface{}{
										"config": config,
										"theme":  themeContent,
									})
									fmt.Println("Sent config to frontend")

								} else {
									runtime.EventsEmit(ctx, "app:socket", string(message))
									fmt.Printf("Received message: %v\n", string(message))
								}
							}
						}()

					}
				} else {
					fmt.Println("'Socket.port' not found in config")
					runtime.Quit(ctx)
				}
			}
		},
		OnShutdown: func(ctx context.Context) {
			fmt.Println("Shutting down")
			if conn != nil {
				conn.Close()
			}
		},
		Bind: []interface{}{
			app,
		},
		Windows: &windows.Options{
			WebviewIsTransparent:              true,
			WindowIsTranslucent:               false,
			DisablePinchZoom:                  false,
			DisableWindowIcon:                 false,
			DisableFramelessWindowDecorations: true,
			IsZoomControlEnabled:              true,
			ZoomFactor:                        1.0,
		},
		Debug: options.Debug{
			OpenInspectorOnStartup: false,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}

}
