<!-- PROJECT LOGO -->
<br />
<p align="center">
  <img src="github/logo.png"/>
  <h3 align="center">
  Smash Soda Overlay
  </h3>

  <p align="center">
    Overlay application to accompany Smash Soda
    <br />
    <a href="https://github.com/MickeyUK/SmashSoda/releases">Latest Release</a>
    ·
    <a href="https://github.com/MickeyUK/SmashSoda/issues">Report Bug</a>
    ·
    <a href="https://github.com/MickeyUK/SmashSoda/issues">Request Feature</a>
  </p>
</p>

<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
    </li>
    <li><a href="#Setup Development Environment">Setup Development Environment</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#obs">OBS</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>


## About the Project

Here is the source code for the overlay application included with <a href="https://github.com/mickeyuk/SmashSoda">Smash Soda</a>. It has been developed with <a href="https://wails.io/">Wails</a>. It is not intended to be run standalone, and won't work with <a href="https://github.com/v6ooo/ParsecSodaV">Parsec Soda V</a>'s Web Sockets widget. The overlay uses <a href="https://developer.microsoft.com/en-gb/microsoft-edge/webview2/?form=MA13LH">WebView2</a>. Instructions for using the overlay with Smash Soda can be found <a href="https://github.com/soda-arcade/smash-soda/wiki/overlay">here</a>.

The source code is made public in case anybody wants to modify and compile for their own purposes (or contribute to the project!).

Issues and feature requests should be made in the <a href="https://github.com/MickeyUK/SmashSoda/issues">Smash Soda repository</a>.

<table>
    <tr>
        <td align="center">
           <a href="https://github.com/MickeyUK/SmashSoda/releases">
               <img src="https://raw.githubusercontent.com/MickeyUK/SmashSoda/master/github/Icons/download.png">
               <div>Download</div>
           </a>
           <div>Download latest<br>version</div>
        </td>
        <td align="center">
           <a href="https://github.com/MickeyUK/SmashSoda/issues">
               <img width="60px" src="https://raw.githubusercontent.com/MickeyUK/SmashSoda/master/github/Icons/fix.png">
               <div>Issues</div>
           </a>
           <div>Report issues and<br>request features</div>
        </td>
        <td align="center">
           <a href="https://discord.gg/9ZHmwce">
               <img width="60px" src="https://raw.githubusercontent.com/MickeyUK/SmashSoda/master/github/Icons/discord.png">
               <div>Discord</div>
           </a>
           <div>Join the Discord<br>community!</div>
        </td>
        <td align="center">
           <a href="https://github.com/MickeyUK/SmashSoda/wiki">
               <img width="60px" src="https://raw.githubusercontent.com/MickeyUK/SmashSoda/master/github/Icons/help.png">
               <div>Wiki</div>
           </a>
           <div>Read the full wiki<br>guide here!</div>
        </td>
    </tr>
</table>

## Setup Development Environment

The overlay is built in the <a href="https://wails.io/">Wails</a> framemwork. Follow their guide for setting up a development environment <a href="https://wails.io/docs/next/gettingstarted/installation">here</a>. (Note this overlay is compatible with Smash Soda version 6 onwards).

Once wails is installed, clone the project, cd in to the frontend subfolder, and install the node packages.

```
git clone https://github.com/Smash-Soda-Team/smash-soda-overlay
cd smash-soda-overlay/frontend
npm install
```

To run the overlay in dev mode:

```
wails dev
```

To build the application:

```
wails build
```

----

Socket messages from Smash Soda to come in this JSON format:
```json
{
  "event": "event name",
  "data": {}
}
```
This is than transmitted across the app with the eventBus, which I just hooked on to the window object to keep things simple. You can then listen to events like:
```ts
window.$eventBus.on('event name', (data: any) => {
  // Do thing
});
```

## Testing

The overlay has a new theming system. You can put custom CSS files inside the themes folder alongside the built app, and select themes in Smash Soda. When developing a theme, you can run the overlay in "design mode". This will stop the overlay from trying to connect to Smash Soda and display some placeholder widgets on the overlay:

```
wails dev -appargs design
```

You can display the browser inspector in dev mode by passing the inspector argument:

```
wails dev -appargs inspector
```

The overlay has a built in websocket server if you have your own testing setup for the websocket messages:

```
wails dev -appargs server
```

The server is served at:

```
ws://localhost:8080/ws
```

When providing multiple arguments, put inside quotes:

```
wails dev -appargs "design inspector server"
```

## OBS

The Smash Soda overlay application is primarily intended for users who want to see details about their room at all times and only have one monitor. For those wishing to build their own OBS overlays, it's as simple as connecting to the websocket server that Smash Soda creates when hosting, and then displaying the info how you want.

Check out the obs_example.html for a very basic example of how to make a static HTML with vanilla JavaScript, to render data from Smash Soda.

Here is a static web page template for displaying your Parsec room chat in OBS...it'll also broadcast display Twitch chat in your Parsec room!

[https://github.com/soda-arcade/twitch-overlay-widget](https://github.com/soda-arcade/twitch-overlay-widget)

## Contributing

See the [open issues](https://github.com/MickeyUK/SmashSoda/issues) for a list of proposed features (and known issues).

Would you like to contribute to the project? That's great! Here's what you do:


1. Open a new issue reporting what you're going to do.
2. Fork this repository.
3. Create a branch for your feature.
4. Make your local changes.
5. Submit a pull request.

If this is helpful to you and you'd like to say thanks, you could <a href="https://ko-fi.com/mickeyuk">buy me a coffee</a> if you want!

## License

See `LICENSE.txt` for more information.


## Contact


Project Link: [https://github.com/MickeyUK/SmashSoda](https://github.com/MickeyUK/SmashSoda)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements

* [MickeyUK] - [GitHub](https://github.com/MickeyUK) - Smash Soda Project Lead
