import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@togetherwecan.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@togetherwecan.com',
      password: 'password', // In production, use a hashed password!
      age: 30,
      gender: 'Other',
      city: 'Mumbai',
      phone: '9999999999',
      role: 'admin',
    },
  });

  // Create categories
  const categories = [
    { id: '1', name: 'Education', description: 'Events related to teaching, learning, and knowledge sharing.' },
    { id: '2', name: 'Environment', description: 'Activities focused on sustainability and environmental conservation.' },
    { id: '3', name: 'Health', description: 'Health and wellness initiatives, including fitness drives and medical camps.' },
    { id: '4', name: 'Community Service', description: 'Social drives to help the underprivileged or support local communities.' },
    { id: '5', name: 'Arts and Culture', description: 'Promoting art, music, theater, and cultural heritage.' },
    { id: '6', name: 'Sports', description: 'Events related to physical activities, competitions, and sportsmanship.' },
  ];
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: { id: cat.id, categoryName: cat.name },
    });
  }

  // Create cities
  const cities = [
    { id: '1', cityName: 'Mumbai', state: 'Maharashtra', country: 'India' },
    { id: '2', cityName: 'Delhi', state: 'Delhi', country: 'India' },
    { id: '3', cityName: 'Bangalore', state: 'Karnataka', country: 'India' },
    { id: '4', cityName: 'Hyderabad', state: 'Telangana', country: 'India' },
    { id: '5', cityName: 'Chennai', state: 'Tamil Nadu', country: 'India' },
    { id: '6', cityName: 'Kolkata', state: 'West Bengal', country: 'India' },
    { id: '7', cityName: 'Pune', state: 'Maharashtra', country: 'India' },
    { id: '8', cityName: 'Ahmedabad', state: 'Gujarat', country: 'India' },
    { id: '9', cityName: 'Jaipur', state: 'Rajasthan', country: 'India' },
    { id: '10', cityName: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  ];
  for (const city of cities) {
    await prisma.city.upsert({
      where: { id: city.id },
      update: {},
      create: city,
    });
  }

  // Generate 50 sample events
  const sampleTitles = [
    'Beach Cleanup Drive', 'Tree Plantation', 'Blood Donation Camp', 'Book Donation', 'Health Awareness Walk',
    'Art for Change', 'Sports for All', 'Community Kitchen', 'Senior Citizen Support', 'Plastic Free Rally',
    'Yoga in the Park', 'STEM Workshop', 'Music for a Cause', 'Food Distribution', 'River Cleaning',
    'Coding Bootcamp', 'Women Empowerment Talk', 'Mental Health Seminar', 'First Aid Training', 'Animal Shelter Visit',
    'Gardening Day', 'Science Fair', 'Marathon for Health', 'Cultural Fest', 'Career Guidance',
    'Disaster Relief Prep', 'Blood Pressure Check', 'Nutrition Workshop', 'Dance for Joy', 'Clean Streets Campaign',
    'Charity Run', 'Recycling Drive', 'Art Therapy', 'Sports Day', 'Book Reading',
    'Medical Camp', 'Child Safety Workshop', 'Green Energy Talk', 'Music Night', 'Fitness Bootcamp',
    'Elderly Care', 'Beach Yoga', 'Coding for Kids', 'Art Competition', 'Community Debate',
    'Public Speaking', 'Chess Tournament', 'Drama Workshop', 'Photography Walk', 'Language Exchange'
  ];
  const events = [];
  for (let i = 0; i < 50; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const daysFromNow = Math.floor(Math.random() * 60) + 1;
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const expected = Math.floor(Math.random() * 100) + 20;
    const current = Math.floor(Math.random() * expected);
    events.push({
      id: (i + 1).toString(),
      eventName: sampleTitles[i % sampleTitles.length] + ' #' + (i + 1),
      description: `This is a sample event: ${sampleTitles[i % sampleTitles.length]}. Join us to make a difference!`,
      date,
      time: `${8 + (i % 10)}:00`,
      location: `${city.cityName} Community Center`,
      cityId: city.id,
      categoryIds: [category.id],
      expectedParticipants: expected,
      currentParticipants: current,
      status: 'UPCOMING',
      creatorId: demoUser.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
  for (const event of events) {
    await prisma.event.upsert({
      where: { id: event.id },
      update: {},
      create: event,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 