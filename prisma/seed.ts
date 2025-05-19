import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create multiple cities
  const cities = await Promise.all([
    prisma.city.create({
      data: {
        cityName: "Delhi",
        state: "Delhi",
        country: "India",
      },
    }),
    prisma.city.create({
      data: {
        cityName: "Mumbai",
        state: "Maharashtra",
        country: "India",
      },
    }),
    prisma.city.create({
      data: {
        cityName: "Bangalore",
        state: "Karnataka",
        country: "India",
      },
    }),
    prisma.city.create({
      data: {
        cityName: "Chennai",
        state: "Tamil Nadu",
        country: "India",
      },
    }),
    prisma.city.create({
      data: {
        cityName: "Kolkata",
        state: "West Bengal",
        country: "India",
      },
    }),
  ]);

  // Create multiple categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        categoryName: "Education",
      },
    }),
    prisma.category.create({
      data: {
        categoryName: "Healthcare",
      },
    }),
    prisma.category.create({
      data: {
        categoryName: "Environment",
      },
    }),
    prisma.category.create({
      data: {
        categoryName: "Animal Welfare",
      },
    }),
    prisma.category.create({
      data: {
        categoryName: "Community Service",
      },
    }),
  ]);

  console.log("Created cities and categories");

  // Create a demo user
  const demoUser = await prisma.user.create({
    data: {
      name: "Demo User",
      email: "demo@example.com",
      password: "hashedpassword", // In production, use proper password hashing
      age: 25,
      gender: "Other",
      city: "Mumbai",
      phone: "9876543210",
      role: "user"
    },
  });

  // Sample event titles for variety
  const eventTitles = [
    "Clean City Initiative",
    "Education for All",
    "Health Camp",
    "Tree Plantation Drive",
    "Food Distribution",
    "Blood Donation Camp",
    "Animal Shelter Support",
    "Senior Citizen Care",
    "Youth Mentorship Program",
    "Women Empowerment Workshop"
  ];

  // Create 50 sample events
  for (let i = 0; i < 50; i++) {
    const randomCity = cities[Math.floor(Math.random() * cities.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomTitle = eventTitles[Math.floor(Math.random() * eventTitles.length)];
    
    // Generate a random date within the next 3 months
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 90));
    
    // Generate random time
    const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const randomTime = `${hours}:${minutes}`;

    // Generate random participant counts
    const expectedParticipants = Math.floor(Math.random() * 50) + 10;
    const currentParticipants = Math.floor(Math.random() * expectedParticipants);

    await prisma.event.create({
      data: {
        eventName: `${randomTitle} ${i + 1}`,
        description: `Join us for this meaningful ${randomCategory.categoryName.toLowerCase()} initiative in ${randomCity.cityName}. Together we can make a difference!`,
        date: randomDate,
        time: randomTime,
        location: `${randomCity.cityName} Central Area`,
        cityId: randomCity.id,
        categoryIds: [randomCategory.id],
        expectedParticipants,
        currentParticipants,
        status: "upcoming",
        creatorId: demoUser.id,
      },
    });

    console.log(`Created event ${i + 1}: ${randomTitle} ${i + 1}`);
  }

  console.log("Successfully created 50 sample events!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 