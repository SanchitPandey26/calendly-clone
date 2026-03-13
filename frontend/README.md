# Calendly Clone - Frontend

The user interface for the Calendly Clone, built with **Next.js** and **React**.

## 🏗 Architecture

The frontend leverages the **Next.js App Router** and a modular component structure to provide a fast, responsive user experience.

### Folder Structure

- **`/app`**: Contains all pages and layouts.
    - **`(admin)`**: Protected routes for the host (Dashboard, Availability, Meetings).
    - **`user/[event_slug]`**: Public-facing booking pages dynamically generated per event.
- **`/components`**: Reusable UI elements.
    - **`/ui`**: Base design elements (Buttons, Inputs, Modals, Ribbons).
    - **`/events`**: Logic-heavy components related to event management.
- **`/services`**: Clean API abstraction layer using Axios.
- **`/utils`**: Business logic helpers, including the critical `timezoneUtils.ts`.
- **`/hooks`**: Custom React hooks for global state like Toasts and Context.

## 🔄 Control Flow

1.  **State Management**: Uses React hooks (`useState`, `useEffect`) and Context API for managing event and session data.
2.  **Navigation**: Facilitated by `next/navigation` for fast client-side transitions.
3.  **Data Fetching**: Performed in Client Components using Axios services, with systematic error handling and toast notifications.

## 🌍 Timezone Management

One of the project's most complex systems is located in `frontend/utils/timezoneUtils.ts`. It works by:
- Neutralizing the browser's local timezone offset when communicating with the "fake UTC" backend.
- Dynamically shifting slot times when a user selects a different timezone from the UI dropdown.
- Calculating "isToday" and "isPast" relative to the **selected** timezone, not the guest's browser clock.

## 🛠 Tech Stack

- **Framework**: Next.js 15+
- **Library**: React 19
- **Aesthetics**: Vanilla CSS + Tailwind base utilities.
- **Icons**: Lucide React
- **API Client**: Axios

## 🧪 Development

- **Run in dev mode**: `npm run dev`
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## 🎨 Premium UI Features

- **Responsive Sidebar**: Automatically collapses on tablets/phones and expands on desktops to maximize workspace.
- **Custom Delete Modals**: Replaces native alerts with themed confirmation boxes.
- **Micro-animations**: Smooth transitions for timezone dropdowns, modal fades, and hover scales.
- **Powered-by Badge**: A pixel-perfect recreation of the Calendly ribbon, implemented with absolute positioning and CSS transforms.
