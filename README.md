# SnapShare

SnapShare is a cross-device photo sharing album built using **React Native** and **Expo**. It allows users to instantly generate shared albums, join via unique character codes, and upload photos on all devices.

It features a unique backend architecture, with **Firebase Firestore** for data synchronization and **Supabase** for image storage.

## Features

*   **Instant Album Creation:** Create a new album and get a join code.
*   **Join via Code:** Join your shared albums instantly.
*   **Real-Time Sync:** Photos appear on all devices seamlessly.
*   **Photo & Video Upload:** Upload from your device library.
*   **Reactions:** React to photos with emojis, featuring a custom confetti animation burst.
*   **Download Media:** Save photos to your device's local gallery.
*   **My Albums:** Saves a history of albums you've created or joined for quick access.

## Tech Stack

*   **Frontend:** React Native, Expo
*   **Navigation:** Expo Router and Custom State Navigation
*   **Database:** Firebase Firestore (metadata, reactions)
*   **Storage:** Supabase Storage (host images)
*   **Local Persistence:**
*   **UI/Animations:** 

## Getting Started

### Prerequisites

*   [Node.js](https://nodejs.org/)
*   [Expo Go](https://expo.dev/go) app 

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/snapshare.git
    cd snapshare
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configuration:**
    *   **Firebase:** Ensure `firebaseConfig.js` has valid Firebase credentials.
    *   **Supabase:** Ensure `supabaseClient.js` has valid Supabase URL and Anon Key.

4.  **Start the app:**
    ```bash
    npx expo start
    ```

5.  **Run on device:**
    *   Scan the QR code with the **Expo Go** app.
    *   Press `a` to open in Android Emulator or `i` for iOS Simulator.

