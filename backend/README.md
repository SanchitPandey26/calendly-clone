# Calendly Clone - Backend

The core API service for the Calendly Clone, built with **Express** and **Prisma**.

## 🏗 Architecture

The backend follows a **layered architecture** to ensure separation of concerns and maintainability:

1.  **Routes Layer** (`/src/routes`): Defines API endpoints and maps them to controller methods.
2.  **Controllers Layer** (`/src/controllers`): Handles HTTP requests, extracting parameters, and calling appropriate services. It is responsible for sending HTTP responses.
3.  **Services Layer** (`/src/services`): Contains the core business logic. All database interactions and complex calculations (like slot generation and conflict detection) live here.
4.  **Data Layer** (`/prisma`): Managed by Prisma ORM. Defines the schema and handles migrations and database seeding.

## 🔄 Control Flow

A typical request follows this path:
`Client Request` → `Express App` → `Router` → `Controller` → `Service` → `Prisma Client` → `Database`

### Key Modules

- **Availability**: Manages the host's operating hours and days.
- **Slot Generation**: Calculates available 15/30/60-min slots for a given date based on availability windows.
- **Booking**: Handles the creation of new meetings and prevents double-booking of the same slot.
- **Event Type**: CRUD operations for different types of meetings (e.g., "15 Minute Meeting").

## 🛠 Tech Stack

- **Framework**: Express.js
- **Runtime**: Node.js
- **ORM**: Prisma
- **Language**: TypeScript
- **Tools**: ts-node-dev (for development), dotenv (env management), cors.

## 📡 API Endpoints (Brief)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/event-types` | `GET/POST/DELETE` | Manage event configurations. |
| `/api/availability` | `GET/POST` | Manage host availability. |
| `/api/slots` | `GET` | Fetch available slots for a specific event and date. |
| `/api/bookings` | `GET/POST/DELETE` | Manage scheduled meetings. |

## 🧪 Development

- **Run in dev mode**: `npm run dev`
- **Build**: `npm run build`
- **Prisma Studio**: `npx prisma studio` (to view database records).

## 📌 Implementation Notes

- **Slot Strategy**: The server generates slots on the fly based on the `Availability` table. It returns "fake UTC" ISO strings to the frontend to ensure the local availability time is preserved regardless of the database server's location.
- **Health Check**: A simple GET `/health` endpoint is available to verify the service status.
