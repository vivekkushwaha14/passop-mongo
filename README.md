# PassOp Mongo

PassOp Mongo is a simple password manager built with React, Vite, Tailwind CSS, Express, and MongoDB. It lets you save website login details, view saved entries, copy fields to the clipboard, edit existing records, and delete records from a MongoDB collection.

> Security note: this project currently stores password values as plain text in MongoDB. Treat it as a learning/demo project until encryption, authentication, and production hardening are added.

## Features

- Add website, username, and password records
- View saved passwords from MongoDB
- Copy site, username, or password values to the clipboard
- Edit an existing saved password
- Delete saved passwords
- Show or hide the password while entering it
- Toast notifications for save, delete, and copy actions
- Responsive React UI powered by Tailwind CSS

## Tech Stack

- Frontend: React 19, Vite 7, Tailwind CSS 4
- Backend: Node.js, Express, MongoDB driver
- Utilities: React Toastify, UUID

## Project Structure

```text
.
├── backend/
│   ├── server.js          # Express API connected to MongoDB
│   ├── package.json       # Backend dependencies
│   └── .env               # MongoDB connection string
├── public/
│   └── icons/             # UI icons
├── src/
│   ├── components/        # Navbar, Manager, Footer
│   ├── App.jsx
│   └── main.jsx
├── package.json           # Frontend scripts and dependencies
└── vite.config.js
```

## Requirements

- Node.js 18 or newer
- npm
- A MongoDB database connection string

## Setup

Install frontend dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Create `backend/.env` and add your MongoDB URI:

```env
MONGO_URI=your_mongodb_connection_string
```

## Running Locally

Start the backend API from the `backend` folder:

```bash
node server.js
```

The backend runs on:

```text
http://localhost:3000
```

In a second terminal, start the frontend from the project root:

```bash
npm run dev
```

Vite will print the local frontend URL, usually:

```text
http://localhost:5173
```

## API Endpoints

The frontend currently calls the backend at `http://localhost:3000/`.

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/` | Fetch all saved password records |
| `POST` | `/` | Save a password record |
| `DELETE` | `/` | Delete a password record by request body |

Example record shape:

```json
{
  "id": "uuid",
  "site": "https://example.com",
  "username": "user@example.com",
  "password": "password-value"
}
```

## Available Frontend Scripts

```bash
npm run dev      # Start Vite development server
npm run build    # Build production assets
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

## Recommended Improvements

- Encrypt passwords before storing them in MongoDB
- Add user authentication and per-user records
- Move API base URL into an environment variable
- Add backend validation and error handling
- Add backend start scripts such as `npm start` or `npm run dev`
- Add tests for API routes and password manager behavior

