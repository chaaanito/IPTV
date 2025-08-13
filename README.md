# IPTV WebApp

An IPTV web application built with Vite + Svelte, powered by DexieJS, PeerJS, and Video.js.

## 📌 Overview

This project is a lightweight IPTV player with a built-in channel manager.
It’s designed to run seamlessly on devices like Android TV while letting you manage channels from another device — no cloud required.

## 🛠 Tech Stack

### Vite + Svelte

Fast, modern frontend development with Svelte’s reactivity and Vite’s blazing-fast bundling.

### Video.js

Used as the core player for smooth playback of HLS and DASH streams, with cross-platform compatibility.

### DexieJS

IndexedDB wrapper for local storage of channels — ensures your channel list stays available offline.

### PeerJS

Enables peer-to-peer communication between devices.
Example: Add or remove channels from your Android TV’s IPTV app directly from your phone.

## 💡 How It Works

Local Backend Panel – Accessible via QR code from the main screen.

Two-Way Sync – Devices connected with PeerJS instantly share changes (additions/deletions) to the channel list.

## 🤔 Why?

Because… why not?
It’s fun, minimal, and gets the job done without bloated dependencies or heavy servers.
