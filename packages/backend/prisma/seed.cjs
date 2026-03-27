const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient, Role, ExpenseType, SessionType } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing data...');
  // Clear in reverse order of dependency
  await prisma.raceResult.deleteMany({});
  await prisma.carSetup.deleteMany({});
  await prisma.maintenanceEvent.deleteMany({});
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

  // 2. Create Users
  const hashedPassword = await bcrypt.hash('password', 10);
  const user = await prisma.user.create({
    data: {
      email: 'merrill@vortex.com',
      password: hashedPassword,
      firstName: 'Merrill',
      lastName: 'B',
    },
  });

  const driver = await prisma.user.create({
    data: {
      email: 'driver@vortex.com',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Driver',
    },
  });

  // 3. Link Users and Team
  await prisma.teamMembership.create({
    data: {
      teamId: team.id,
      userId: user.id,
      role: Role.OWNER,
      isPrimary: true,
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

  // 5. Create a Car for the team
  const car = await prisma.car.create({
    data: {
      teamId: team.id,
      make: 'Chevrolet',
      model: 'Monte Carlo',
      year: 2003,
      color: 'Blue',
    },
  });

  // 5a. Create maintenance events for the car
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  await prisma.maintenanceEvent.create({
    data: {
      carId: car.id,
      type: 'Motor Rebuild',
      date: twoYearsAgo,
      notes: 'Full rebuild: new pistons, rings, bearings. Started fresh.',
      lapInterval: 500,
    },
  });
  await prisma.maintenanceEvent.create({
    data: {
      carId: car.id,
      type: 'Valve Spring Replacement',
      date: oneYearAgo,
      notes: 'Replaced inner and outer valve springs.',
    },
  });

  // 5b. Create a car setup record
  await prisma.carSetup.create({
    data: {
      carId: car.id,
      tireCompound: 'Hoosier D55',
      tireSizeFront: '27.5 x 8-15',
      tireSizeRear: '90/14-15',
      springRateFront: 750,
      springRateRear: 225,
      rideHeightFront: 3.5,
      rideHeightRear: 5.0,
      gearRatio: '5.14',
      notes: 'Baseline setup for flat tracks.',
    },
  });

  // 7. Create Trips
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
      const stop = await prisma.tripStop.create({
        data: {
          tripId: trip.id,
          trackId: faker.helpers.arrayElement(tracks).id,
          startDate: faker.date.soon({ days: 2, refDate: tripDate }),
          endDate: faker.date.soon({ days: 4, refDate: tripDate }),
        },
      });

      // Add a qualifying result and a feature result for the first stop
      if (j === 0) {
        await prisma.raceResult.create({
          data: {
            tripStopId: stop.id,
            carId: car.id,
            sessionType: SessionType.QUALIFYING,
            laps: 2,
            bestLapTime: faker.number.float({ min: 14.0, max: 18.0, multipleOf: 0.001 }),
            position: faker.number.int({ min: 1, max: 20 }),
            notes: 'Qualifying run.',
          },
        });
        await prisma.raceResult.create({
          data: {
            tripStopId: stop.id,
            carId: car.id,
            sessionType: SessionType.FEATURE,
            startPosition: faker.number.int({ min: 1, max: 12 }),
            laps: faker.number.int({ min: 20, max: 40 }),
            bestLapTime: faker.number.float({ min: 14.0, max: 18.0, multipleOf: 0.001 }),
            position: faker.number.int({ min: 1, max: 20 }),
            notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }),
          },
        });
      }
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