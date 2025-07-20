import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// City coordinates mapping
const cityCoordinates: { [key: string]: [number, number] } = {
  Delhi: [28.6139, 77.2090],
  Mumbai: [19.0760, 72.8777],
  Bangalore: [12.9716, 77.5946],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
};

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
    
    // Generate start and end dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 60));

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + Math.floor(Math.random() * 3)); // 0-2 days later
    
    // Generate random time
    const hours = Math.floor(Math.random() * 24).toString().padStart(2, '0');
    const minutes = Math.floor(Math.random() * 60).toString().padStart(2, '0');
    const randomTime = `${hours}:${minutes}`;

    // Generate random participant counts
    const expectedParticipants = Math.floor(Math.random() * 50) + 10;
    const currentParticipants = Math.floor(Math.random() * expectedParticipants);

    // Generate coordinates with slight random variation
    const [lat, lng] = cityCoordinates[randomCity.cityName];
    const randomLat = lat + (Math.random() * 0.01 - 0.005);
    const randomLng = lng + (Math.random() * 0.01 - 0.005);

    await prisma.event.create({
      data: {
        eventName: `${randomTitle} ${i + 1}`,
        description: `Join us for this meaningful ${randomCategory.categoryName.toLowerCase()} initiative in ${randomCity.cityName}. Together we can make a difference!`,
        startDate,
        endDate,
        time: randomTime,
        location: `${randomCity.cityName} Central Area`,
        fullAddress: `Sector ${Math.floor(Math.random() * 10) + 1}, ${randomCity.cityName} - 1100${i % 10}`,
        latitude: randomLat,
        longitude: randomLng,
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

  // Add drive completion data for 10 events
  const events = await prisma.event.findMany();
  
  for (const event of events.slice(0, 10)) {
    await prisma.driveCompletion.create({
      data: {
        eventId: event.id,
        summary: "The event was a huge success, with volunteers contributing significantly.",
        images: [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        highlights: [
          "Planted 100+ trees",
          "Distributed 200 meals"
        ],
        testimonials: [
          {
            userId: demoUser.id,
            testimonial: "It was a great experience!",
            rating: 5,
            submittedAt: new Date()
          },
          {
            userId: demoUser.id,
            testimonial: "Loved being part of this drive!",
            rating: 5,
            submittedAt: new Date()
          }
        ],
        keywords: ["environment", "community", "trees"],
        userId: demoUser.id,
        status: "pending"
      },
    });
    console.log(`Created drive completion for event: ${event.eventName}`);
  }

  console.log("Successfully created drive completion data!");
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 