"use client";

import React from "react";
import { Navbar } from "@/components/navigation/navbar";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#0E6E5C]">
      <Navbar />
      
      {/* Hero Section Container with Border */}
      <div className="border-b border-white/40">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 max-w-lg">
              <p className="text-white/80 text-lg">Connect, Volunteer, Make a Difference</p>
              <h1 className="text-6xl font-bold text-white">Together We Can</h1>
              <p className="text-white/80 text-lg">
                <b>Join hands to build a better tomorrow.</b><br/>
                Whether it's planting trees, helping communities, or spreading awareness, be the reason someone believes in kindness again.<br/>
                <b>Together, we rise. Together, we can.</b>
              </p>
            </div>

            {/* Right Images */}
            <div className="relative h-[500px]">
              {/* Main Image */}
              <div className="absolute right-0 top-0 w-[80%] h-[400px] rounded-[2rem] overflow-hidden bg-white/10">
                <Image
                  src="/images/hero-1.jpg"
                  alt="Happy children"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-[2rem]"
                />
              </div>
              {/* Secondary Image */}
              <div className="absolute right-[60%] bottom-0 w-[60%] h-[300px] rounded-[2rem] overflow-hidden bg-white/10">
                <Image
                  src="/images/hero-2.jpg"
                  alt="Smiling child"
                  layout="fill"
                  objectFit="cover"
                  className="rounded-[2rem]"
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Featured Drives Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">Featured Drives</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Join our most impactful community initiatives</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Tree Plantation Drive */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src="/images/tree-plantation.jpeg"
                  alt="Tree Plantation Drive"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#0E6E5C]">Environment</span>
                  <span className="text-sm text-gray-500">200 participants</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Tree Plantation Drive in Delhi</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  In the heart of Delhi, volunteers gathered to plant over 500 trees in local parks, contributing to environmental sustainability.
                </p>
                <button 
                  onClick={() => router.push('/blog/1')}
                  className="w-full bg-[#0E6E5C] text-white px-4 py-2 rounded-lg hover:bg-[#0a5748] transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Beach Cleanup Drive */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src="/images/beach-cleanup.jpg"
                  alt="Beach Cleanup Drive"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#0E6E5C]">Environment</span>
                  <span className="text-sm text-gray-500">200 participants</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Clean Up Drive at Marine Drive</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Over 200 participants joined hands to clean the iconic Marine Drive, making the beach cleaner and more eco-friendly.
                </p>
                <button 
                  onClick={() => router.push('/blog/2')}
                  className="w-full bg-[#0E6E5C] text-white px-4 py-2 rounded-lg hover:bg-[#0a5748] transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Educational Workshop */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48">
                <Image
                  src="/images/education-workshop.jpg"
                  alt="Educational Workshop"
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#0E6E5C]">Education</span>
                  <span className="text-sm text-gray-500">150 participants</span>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">Educational Workshop for Children</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">
                  Volunteers conducted workshops for over 100 underprivileged children, helping them with basic education and career guidance.
                </p>
                <button 
                  onClick={() => router.push('/blog/3')}
                  className="w-full bg-[#0E6E5C] text-white px-4 py-2 rounded-lg hover:bg-[#0a5748] transition-colors"
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#0E6E5C] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-white">How It Works</h2>
          <p className="text-xl text-white/80 text-center mb-12">Simple steps to start making a difference</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Find a Drive",
                description: "Browse through various social drives happening in your city",
                icon: "/images/search-icon.jpeg",
              },
              {
                title: "Register",
                description: "Sign up for the drive that matches your interests",
                icon: "/images/register-icon.jpg",
              },
              {
                title: "Participate",
                description: "Join the community and create positive change together",
                icon: "/images/participate-icon.jpg",
              },
            ].map((step, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center hover:bg-white/20 transition-colors">
                <div className="w-20 h-20 mx-auto mb-6 relative">
                  <Image
                    src={step.icon}
                    alt={step.title}
                    layout="fill"
                    objectFit="contain"
                  />
                </div>
                <h3 className="text-2xl font-semibold mb-4 text-white">{step.title}</h3>
                <p className="text-white/80">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">What Our Volunteers Say</h2>
          <p className="text-xl text-gray-600 text-center mb-12">Hear from people who are making a difference</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Environmental Volunteer",
                image: "/images/testimonial-1.avif",
                quote: "Being part of the tree plantation drive was an incredible experience. It's amazing to see how small actions can create such a big impact.",
              },
              {
                name: "Rahul Sharma",
                role: "Education Mentor",
                image: "/images/testimonial-2.webp",
                quote: "Teaching children and seeing their eyes light up with understanding is the most rewarding experience. Every session makes a difference.",
              },
              {
                name: "Priya Patel",
                role: "Community Leader",
                image: "/images/testimonial-3.jpg",
                quote: "Together We Can has created a platform where passionate individuals can come together and create real change in our communities.",
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden relative mr-4">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-[#0E6E5C]">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-blue-600 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Make a Difference?</h2>
          <div className="space-x-4">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-100">
              Explore Drives
            </button>
            <button className="border-2 border-white px-8 py-3 rounded-md hover:bg-blue-700">
              Create an Event
            </button>
          </div>
        </div>
      </section>
    </main>
  );
} 