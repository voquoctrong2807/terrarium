<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1KydAl1IOjiNJpBu2RbMTqZjjLKt2FaCG

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env.local` file in the root directory and add your Google AI Studio API key:
   ```
   GOOGLE_AI_STUDIO_API_KEY=AIzaSy...YOUR_KEY...
   ```
   **Note:** The `.env.local` file is already in `.gitignore` and will not be committed.

3. Run both the Vite dev server and API server:
   ```bash
   npm run dev:all
   ```
   
   Or run them separately in two terminals:
   ```bash
   # Terminal 1: Vite dev server (port 3000)
   npm run dev
   
   # Terminal 2: API server (port 3001)
   npm run dev:server
   ```

4. Open your browser to `http://localhost:3000`

## API Route

The API route `/api/render-terrarium` is handled by the Express server on port 3001. Vite is configured to proxy `/api/*` requests to the Express server.

**Note:** The model name in `server.js` is set to `"nano-banana-pro"`. You may need to adjust this to match the exact model name available in your Google AI Studio account.
