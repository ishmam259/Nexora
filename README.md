# Spring Boot + React Native (Expo) Starter Project

This project contains a full-stack configuration combining a Spring Boot REST API backend with a React Native (Expo) mobile/web frontend.

## Project Structure

```text
├── backend/       # Spring Boot Maven application (Java 21)
└── frontend/      # React Native Expo application (TypeScript)
```

---

## Getting Started

### 1. Prerequisite Checks
Ensure you have the following installed on your machine:
*   **Java JDK 17+** (JDK 24 detected on host)
*   **Node.js LTS** (Node v24.12 detected on host)
*   **NPM** or another package manager

---

### 2. Running the Spring Boot Backend

The backend is configured to run a REST API on port `8080` with pre-configured CORS to allow frontend connections.

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Run the application:
   *   **Windows (PowerShell):**
       ```powershell
       .\mvnw.cmd spring-boot:run
       ```
   *   **macOS / Linux:**
       ```bash
       ./mvnw spring-boot:run
       ```

The backend API will be available at [http://localhost:8080/api/hello](http://localhost:8080/api/hello).

---

### 3. Running the React Native Frontend

The frontend is an Expo SDK 57 application configured with dynamic URL inputs so you can connect to local or physical backend servers.

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Start the development server:
   ```bash
   npm run start
   ```
3. Open the app:
   *   **Web (Browser):** Press `w` in the terminal to run in the web browser.
   *   **Android (Emulator/Device):** Press `a` or scan the QR code using the Expo Go app.
   *   **iOS (Simulator/Device):** Press `i` or scan the QR code using the Expo Go app.

---

## Connecting Frontend to Backend

In the React Native app UI, configure the target backend URL:
*   **iOS Simulator / Web browser:** Use `http://localhost:8080/api/hello`.
*   **Android Emulator:** Use `http://10.0.2.2:8080/api/hello` (this routes directly to your computer's localhost).
*   **Physical Mobile Devices:** Run `ipconfig` (Windows) or `ifconfig` (macOS/Linux) to find your local computer IP address (e.g. `192.168.1.123`) and set the endpoint to `http://<your-local-ip>:8080/api/hello`.
