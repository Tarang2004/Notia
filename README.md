 # Notia
 
 A modern and clean note-taking application built with React, TypeScript, and Tailwind CSS.
 
 ## ✨ Features
 
 *   Clean, intuitive, and responsive user interface.
 *   Client-side routing for a seamless single-page application (SPA) experience.
 *   Efficient server-state management.
 
 ## 🛠️ Tech Stack
 
 *   **Frontend:**
     *   [React](https://react.dev/)
     *   [TypeScript](https://www.typescriptlang.org/)
     *   [Vite](https://vitejs.dev/) - Next-generation frontend tooling.
     *   [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework.
     *   [shadcn/ui](https://ui.shadcn.com/) - Re-usable components built using Radix UI and Tailwind CSS.
 *   **Routing:**
     *   [Wouter](https://github.com/molefrog/wouter) - A minimalist routing library for React.
 *   **Data Fetching & State Management:**
     *   [TanStack Query (React Query)](https://tanstack.com/query/latest) - For fetching, caching, and updating server state.
 
 ## 🚀 Getting Started
 
 Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.
 
 ### Prerequisites
 
 Make sure you have Node.js and a package manager (like npm or yarn) installed.
 
 *   [Node.js](https://nodejs.org/) (v18.x or later is recommended)
 *   [npm](https://www.npmjs.com/get-npm)
 
 ### Installation
 
 1.  **Clone the repository:**
     ```bash
     git clone <your-repository-url>
     cd Notia
     ```
 
 2.  **Navigate to the client directory and install dependencies:**
     ```bash
     cd client
     npm install
     ```
 
 3.  **Run the development server:**
     ```bash
     npm run dev
     ```
 
     The application will be available at `http://localhost:5173` (or the next available port).
 
 ## 📁 Project Structure
 
 The main application code is located within the `client/src` directory.
 
 ```
 client/src
 ├── components/      # Shared and UI components
 ├── lib/             # Library files and utilities (e.g., queryClient)
 ├── pages/           # Page components for different routes
 │   ├── notes.tsx
 │   └── not-found.tsx
 ├── App.tsx          # Root component with providers and router setup
 ├── main.tsx         # Application entry point
 └── index.css        # Global styles
 ```
