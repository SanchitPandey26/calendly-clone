# Calendly Clone

A full-stack, timezone-aware scheduling application inspired by Calendly, built with **Next.js**, **Express**, and **Prisma**.

## 🚀 Overview

This project is a multi-user scheduling platform that allows users to create event types, set availability, and share public booking links. It features a robust timezone conversion system that ensures both hosts and guests can coordinate across different regions seamlessly.

## 🛠 Tech Stack

- **Frontend**: Next.js 15+, React 19, TypeScript, Lucide React, Tailwind CSS (for base utilities), Vanilla CSS (for custom ribbons and complex UI).
- **Backend**: Node.js, Express, TypeScript, Prisma ORM.
- **Database**: PostgreSQL (via Prisma Client).
- **Communication**: Axios for API interactions.

## ✨ Features

### Admin Features (Event Owner)
- **Event Type Management**: Create, edit, and delete event types with custom durations.
- **Availability Settings**: Configure weekly availability windows (hours and days) for scheduling.
- **Meetings Dashboard**: View upcoming and past bookings in the host's local timezone.
- **Rescheduling**: Host can reschedule upcoming meetings to a new date and time directly from the dashboard.
- **Smart URL Slugs**: Automatic slug generation for event types to create shareable links.

### Public Booking Features
- **Public Booking Pages**: Responsive pages for guests to choose dates and times.
- **Timezone Awareness**: Guests can select their own timezone; slot times are automatically converted for display.
- **Real-time Filtering**: Past time slots are automatically hidden based on the selected timezone's current time.
- **Booking Flow**: A seamless 3-step process (Date/Time Selection → Guest Details Form → Confirmation).

## ⚙️ Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL database
- npm

### 1. Clone the repository
```bash
git clone <repository-url>
cd calendly-clone
```

### 2. Backend Setup
```bash
cd backend
npm install
```
- Create a `.env` file in the `backend` folder:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/calendly_db"
PORT=8000
```
- Initialize the database:
```bash
npx prisma db push
npx prisma generate
npx prisma db seed # Optional: seed initial data
```
- Start the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```
- Create a `.env` file in the `frontend` folder:
```env
NEXT_PUBLIC_BASE_URL="http://localhost:8000/api"
```
- Start the frontend:
```bash
npm run dev
```

## 🧠 Key Assumptions & Design Decisions

### Timezone Strategy ("Fake UTC")
To maintain simplicity and consistency, the backend encodes the host's local availability time directly into UTC ISO strings (e.g., if a host is available at 09:00 AM local time, it is stored as `T09:00:00.000Z` regardless of the host's actual offset). 

The frontend then interprets these strings as "availability-local" times and uses a custom `timezoneUtils.ts` to:
1. Convert these times to the guest's selected timezone for display.
2. Filter out past slots based on the "now" time in the guest's selected timezone.
3. Ensure the admin always sees meeting times in their own availability timezone by neutralizing browser-local offsets.

### Design Aesthetics
The UI uses a premium design approach with:
- **Custom Ribbons**: A precise "Powered by Calendly" badge with CSS transforms and strictly horizontal/vertical edges.
- **Dynamic Response**: Interactive hover effects, smooth transitions, and a responsive sidebar that collapses on smaller screens.
