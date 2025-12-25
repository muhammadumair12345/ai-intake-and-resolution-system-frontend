# AI Intake & Resolution System - Frontend

This is the frontend dashboard for the AI Intake & Resolution System, built with Next.js 14, Tailwind CSS, and Redux Toolkit.

## Prerequisites

- Node.js (v18 or higher)
- Backend API running (usually on port 5000)

## Getting Started

1.  **Navigate to the frontend directory:**

    ```bash
    cd ai-intake-and-resolution-system/frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the `frontend` directory:

    ```env
    # URL of the backend API
    NEXT_PUBLIC_API_URL="http://localhost:5000/api"
    ```

4.  **Running the Application:**

    - **Development Mode:**

      ```bash
      npm run dev
      ```

      Open [http://localhost:3000](http://localhost:3000) in your browser.

    - **Production Build:**
      ```bash
      npm run build
      npm start
      ```

## Key Features

- **Public Ticket Submission:** `/`
- **Admin Dashboard:** `/admin/triage` (Requires Login)
- **Manager Dashboard:** `/manager/tickets` (Requires Login)
- **Authentication:** Role-based access control (Admin/Manager).

## Project Structure

- `src/app`: Next.js App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/lib/redux`: Redux store, slices, and RTK Query API definitions.
- `src/middleware.ts`: Route protection middleware.

## Credentials (Default Seed)

If you ran the backend seed script, use these default credentials:

- **Admin:** `admin@aisupport.com` / `Admin@123`
- **Manager:** `manager1@aisupport.com` / `Manager@123`
