# TogetherWeCan - Social Drives & Volunteer Platform

A modern web platform that connects users to social drives and volunteer opportunities in their local communities.

---

## Features

- 🌍 City-based volunteer drive search and filtering
- 📝 Event creation, editing, and management (with participant minimums and status auto-updates)
- 🧑‍🤝‍🧑 User authentication (NextAuth.js, email verification)
- 🏷️ Category-based event organization
- 📊 Blog/Reports section (AI-powered blog generation)
- 📅 Responsive calendar and date pickers
- 📈 Participant tracking and feedback system (including for event creators)
- 🏆 Dynamic homepage with wavy background animation
- 📱 Responsive design for all devices

---

## Tech Stack

- **Next.js** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS**
- **Prisma ORM** (with MongoDB)
- **NextAuth.js** (authentication)
- **Google Generative Language API** (AI blog generation)
- **Nodemailer** (email)
- **React Datepicker**
- **Node.js**

---

## Database Models (Prisma)

- **User**: Authentication, profile, and participation
- **Event**: Drives with status, participants, categories, city, and more
- **Participant**: Join table for users and events
- **Category**: Event categories
- **City**: City and state info
- **Blog**: AI-generated and user-reviewed blogs
- **DriveCompletion**: Stores completion data, testimonials, highlights, etc.
- **Testimonial**: Feedback from users
- **Notification, Media, VerificationToken**: Supporting features

---

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/TogetherWeCan.git
   cd TogetherWeCan
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up your environment variables**
   - Create a `.env` file in the root directory.
   - Add your MongoDB connection string and any required API keys:
     ```
     DATABASE_URL="your-mongodb-connection-string"
     GOOGLE_API_KEY="your-google-api-key"
     EMAIL_SERVER="smtp://user:pass@smtp.example.com:587"
     NEXTAUTH_SECRET="your-nextauth-secret"
     ```
   - (Check your codebase for any other required variables.)

4. **Run database migrations and generate Prisma client**
   ```bash
   npx prisma generate
   # (If you have migrations: npx prisma migrate deploy)
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

- `npm run dev` – Start the development server
- `npm run build` – Build for production
- `npm run start` – Start the production server
- `npm run lint` – Lint the codebase

---

## Development Notes

- Uses **Next.js App Router** and React Server Components
- Type safety throughout with TypeScript and Prisma
- Tailwind CSS for rapid, modern UI development
- Prisma ORM for type-safe database access
- MongoDB as the primary database
- Email verification and authentication via NextAuth.js
- AI blog generation via Google Generative Language API

---
## Deployment Status

Due to a series of technical challenges with Prisma, authentication setup, and build errors, the live deployment is currently on hold. However, the project is fully functional locally.

To run the project locally:
1. Clone the repo
2. Run `npm install`
3. Set up your `.env` file (see `.env.example`)
4. Run `npm run dev`
   
---
## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

---

## License

This project is licensed under the MIT License.

---

**Questions?**  
Open an issue or contact the maintainer!
