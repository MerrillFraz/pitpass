const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient, Role, ExpenseType } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing data...');
  // Clear in reverse order of dependency
  await prisma.raceResult.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.note.deleteMany({});
  await prisma.tripStop.deleteMany({});
  await prisma.trip.deleteMany({});
  await prisma.teamMembership.deleteMany({});
  await prisma.car.deleteMany({});
  await prisma.track.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.team.deleteMany({});


  console.log('Seeding new data...');

  // 1. Create a Team
  const team = await prisma.team.create({
    data: {
      name: 'Vortex Racing',
    },
  });

  // 2. Create a User
  const user = await prisma.user.create({
    data: {
      email: 'merrill@vortex.com',
      password: 'password', // In a real app, this would be hashed
      firstName: 'Merrill',
      lastName: 'B',
    },
  });

  // 3. Link User and Team
  await prisma.teamMembership.create({
    data: {
      teamId: team.id,
      userId: user.id,
      role: Role.OWNER,
    },
  });

  // 4. Create some Tracks
  const tracks = [];
  for (let i = 0; i < 5; i++) {
    const track = await prisma.track.create({
      data: {
        name: `${faker.location.city()} Raceway`,
        location: `${faker.location.city()}, ${faker.location.state({ abbreviated: true })}`,
      },
    });
    tracks.push(track);
  }

  // 5. Create Trips
  for (let i = 0; i < 10; i++) {
    const tripDate = faker.date.past({ years: 2 });
    const trip = await prisma.trip.create({
      data: {
        name: `${faker.company.name()} Tour`,
        date: tripDate,
        location: faker.location.city(),
        userId: user.id,
        teamId: team.id,
      },
    });

    // Create a few notes for the trip
    for (let n = 0; n < faker.number.int({ min: 0, max: 3 }); n++) {
      await prisma.note.create({
        data: {
          tripId: trip.id,
          content: faker.lorem.paragraph(),
          date: faker.date.between({ from: tripDate, to: new Date() }),
        },
      });
    }

    // Create some expenses for the trip
    for (let k = 0; k < faker.number.int({ min: 2, max: 10 }); k++) {
      await prisma.expense.create({
        data: {
          tripId: trip.id,
          type: faker.helpers.arrayElement(Object.values(ExpenseType)),
          amount: faker.number.float({ min: 20, max: 1000, multipleOf: 0.01 }),
          date: faker.date.between({ from: tripDate, to: new Date() }),
        },
      });
    }

    // Create a few stops for the trip
    const stopCount = faker.number.int({ min: 1, max: 3 });
    for (let j = 0; j < stopCount; j++) {
      await prisma.tripStop.create({
        data: {
          tripId: trip.id,
          trackId: faker.helpers.arrayElement(tracks).id,
          startDate: faker.date.soon({ days: 2, refDate: tripDate }),
          endDate: faker.date.soon({ days: 4, refDate: tripDate }),
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });