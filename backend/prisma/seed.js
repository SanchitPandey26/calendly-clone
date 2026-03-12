"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Start seeding...');
    // Clear existing data to ensure idempotent seeding
    await prisma.booking.deleteMany();
    await prisma.availability.deleteMany();
    await prisma.eventType.deleteMany();
    // 1. Create Event Types
    const event15 = await prisma.eventType.create({
        data: {
            name: '15 Minute Quick Sync',
            slug: '15-min-quick-sync',
            duration: 15,
        },
    });
    const event30 = await prisma.eventType.create({
        data: {
            name: '30 Minute Discovery Call',
            slug: '30-min-discovery-call',
            duration: 30,
        },
    });
    const event60 = await prisma.eventType.create({
        data: {
            name: '60 Minute Technical Interview',
            slug: '60-min-technical-interview',
            duration: 60,
        },
    });
    console.log('Created Event Types');
    // 2. Create Availability (Mon-Fri, 9am - 5pm EST)
    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];
    for (const day of days) {
        await prisma.availability.create({
            data: {
                dayOfWeek: day,
                startTime: '09:00',
                endTime: '17:00',
                timezone: 'America/New_York',
            },
        });
    }
    console.log('Created Availability Settings');
    // 3. Create Bookings (some past, some upcoming)
    const now = new Date();
    // Past meeting (2 days ago)
    const pastDate = new Date(now);
    pastDate.setDate(now.getDate() - 2);
    pastDate.setHours(10, 0, 0, 0); // 10:00 AM
    const pastEndTime = new Date(pastDate);
    pastEndTime.setMinutes(pastEndTime.getMinutes() + 30);
    await prisma.booking.create({
        data: {
            eventTypeId: event30.id,
            inviteeName: 'Alice Johnson',
            inviteeEmail: 'alice.johnson@example.com',
            date: pastDate,
            startTime: pastDate,
            endTime: pastEndTime,
            status: client_1.BookingStatus.SCHEDULED, // Even past ones were scheduled and occurred
        },
    });
    // Upcoming meeting (3 days from now)
    const futureDate = new Date(now);
    futureDate.setDate(now.getDate() + 3);
    futureDate.setHours(14, 0, 0, 0); // 2:00 PM
    const futureEndTime = new Date(futureDate);
    futureEndTime.setMinutes(futureEndTime.getMinutes() + 60);
    await prisma.booking.create({
        data: {
            eventTypeId: event60.id,
            inviteeName: 'Bob Smith',
            inviteeEmail: 'bob.smith@example.com',
            date: futureDate,
            startTime: futureDate,
            endTime: futureEndTime,
            status: client_1.BookingStatus.SCHEDULED,
        },
    });
    // Cancelled meeting (5 days from now)
    const cancelledDate = new Date(now);
    cancelledDate.setDate(now.getDate() + 5);
    cancelledDate.setHours(16, 0, 0, 0); // 4:00 PM
    const cancelledEndTime = new Date(cancelledDate);
    cancelledEndTime.setMinutes(cancelledEndTime.getMinutes() + 15);
    await prisma.booking.create({
        data: {
            eventTypeId: event15.id,
            inviteeName: 'Charlie Davis',
            inviteeEmail: 'charlie.davis@example.com',
            date: cancelledDate,
            startTime: cancelledDate,
            endTime: cancelledEndTime,
            status: client_1.BookingStatus.CANCELLED,
        },
    });
    console.log('Created Bookings (Past, Upcoming, Cancelled)');
    console.log('Seeding finished successfully.');
}
main()
    .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
