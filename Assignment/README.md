# Roxilier Assignment

This project contains a full-stack application with a backend (Node.js/Express/Sequelize) and a frontend (React/Vite/Tailwind CSS).

## Prerequisites
- Node.js (v16 or above recommended)
- pnpm (recommended) or npm
- MySQL (or compatible database)

---

## Backend Setup
1. Navigate to the backend folder:
   ```powershell
   cd Assignment/backend
   ```
2. Install dependencies:
   ```powershell
   pnpm install
   # or
   npm install
   ```
3. Configure environment variables:
   - Copy or edit `src/env.js` with your database credentials.
4. Run database migrations and seed data:
   ```powershell
   node src/sync.js
   node seed.js
   ```
5. Start the backend server:
   ```powershell
   node src/index.js
   ```
   The backend will run on the port specified in your environment config (default: 3000).

---

## Frontend Setup
1. Open a new terminal and navigate to the frontend folder:
   ```powershell
   cd Assignment/frontend
   ```
2. Install dependencies:
   ```powershell
   pnpm install
   # or
   npm install
   ```
3. Start the frontend development server:
   ```powershell
   npm run dev
   ```
   The frontend will run on [http://localhost:5173](http://localhost:5173) by default.

---

## Tailwind CSS Troubleshooting
- Ensure `tailwindcss` is installed and listed in `package.json`.
- Check that `tailwind.config.js` exists and is properly configured.
- Make sure your main CSS file (e.g., `App.css` or `index.css`) includes:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```
- Restart the dev server after installing/configuring Tailwind.

---

## Common Issues
- If you see PowerShell script execution errors, run:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
  ```
- Ensure your database is running and credentials are correct.
- If ports are busy, change them in your config files.

---

## Project Structure
- `Assignment/backend`: Express API, Sequelize models, routes
- `Assignment/frontend`: React app, Tailwind CSS, Vite config

---

## License
See `LICENSE` file for details.
