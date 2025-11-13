# Kewbo 
Minimal offline web app for two webhooks

A tiny Progressive Web App (PWA) with two customizable buttons that each send an HTTP POST to a webhook primary designed for 
[Home Assistant](https://www.home-assistant.io/) to trigger an automation with webhooks which opens doors for people who are not within my Home Assitant

All settings are stored locally; you can also set a custom background image and your own names for the buttons.

## Features

Two buttons with user-defined labels (e.g., “front door” / “back yard”).

Webhook calls via HTTP POST for each button.

Offline-ready PWA: the app shell and assets are cached for use without a network connection.

Settings modal (gear icon, top-right):

Edit button labels

Set webhook URLs (masked in the UI)

Upload your own background (GIF/PNG/JPG), stored locally and applied immediately


## Security & privacy

Webhook URLs are saved in localStorage and masked in the UI after saving.
They are not encrypted. If you need real encryption, a passphrase-based approach with client-side crypto would be required (not included).

No telemetry, no external trackers.

Background images are stored locally as data URLs.

## Usage

Visit the site. [Kewbo.Tech-industries.de](Kewbo.Tech-industries.de)

Click the gear icon → Settings.

Enter names and webhook URLs for Button 1 & 2.

The webhook inputs are password-type fields and remain blank when reopening; only new entries overwrite stored values.

(Optional) Background → “Choose image” → select GIF/PNG/JPG → applied instantly and works offline.

Click Save.

Install as a PWA (browser menu: Install app / Add to Home Screen).

The app works offline; webhook POSTs naturally require a network connection.

## Support Me
If you find this project helpful, consider supporting me:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/A0A41NOGFU)
