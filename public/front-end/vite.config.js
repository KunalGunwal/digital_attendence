 import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react'; // Make sure you have this plugin installed

    // https://vitejs.dev/config/
    export default defineConfig({
      // Vite plugins you are using (e.g., React plugin)
      plugins: [react()],

      // Development server options
      server: {
        port: 5173, // This is the port your React dev server will run on (default for Vite)
        open: true, // Automatically opens the browser when the dev server starts

        // --- Proxy configuration ---
        proxy: {
          // Whenever the frontend makes a request that starts with '/api'
          '/api': {
            // Forward that request to your Node.js backend server
            target: 'http://localhost:8000', // <--- IMPORTANT: Replace with your actual backend URL/Port
            changeOrigin: true, // Required for virtual hosted sites
            // If your backend API routes start with `/api/attendence_tracker/`
            // and your frontend requests also start with `/api/attendence_tracker/`,
            // no `rewrite` is strictly needed here if the prefix matches.
            // Example: A request from frontend: /api/attendence_tracker/loginTeacher
            // Becomes: http://localhost:8000/api/attendence_tracker/loginTeacher
          },
          // You can add more proxy rules if you have other API prefixes
          // '/uploads': {
          //   target: 'http://localhost:8000',
          //   changeOrigin: true,
          // }
        },
      },

      // If your project uses different base paths for deployment
      // base: '/',
    });
    