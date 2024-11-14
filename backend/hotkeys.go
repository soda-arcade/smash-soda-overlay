package backend

import (
	"context"
	"fmt"

	"github.com/wailsapp/wails/v2/pkg/runtime"
	"golang.design/x/hotkey"
)

// Registers all hotkeys
func RegisterHotkeys(context context.Context) {

	// Register hotkeys
	registerHotkey([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.KeyC, "chat:input")
	registerHotkey([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.Key(0xBB), "zoom:in")
	registerHotkey([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.Key(0xBD), "zoom:out")
	registerHotkey([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.Key0, "zoom:reset")
	registerHotkey([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.KeyUp, "opacity:in")
	registerHotkey([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.KeyDown, "opacity:out")

}

// Registers a hotkey
func registerHotkey(mods []hotkey.Modifier, key hotkey.Key, event string) {

	hk := hotkey.New(mods, key)
	err := hk.Register()
	if err != nil {
		return
	}

	<-hk.Keydown()
	fmt.Printf("hotkey: %v is down\n", hk)

	runtime.WindowShow(Ctx)
	runtime.EventsEmit(Ctx, "app:shortcut", event)

	hk.Unregister()

	registerHotkey(mods, key, event)

}
