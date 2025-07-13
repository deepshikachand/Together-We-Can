"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navigation/navbar";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import { BsFacebook, BsTwitter, BsLinkedin } from "react-icons/bs";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F5F4]">
      <Navbar />

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#003B2F] tracking-tight">
            Get in Touch
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            We'd love to hear from you! Whether you have a question, suggestion, or
            just want to say hello, reach out to us.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-8">
              {submitSuccess ? (
                <div className="text-center py-12 transition-all duration-500">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <h2 className="mt-6 text-2xl font-semibold text-gray-800">
                    Thank you for reaching out!
                  </h2>
                  <p className="mt-2 text-gray-600">
                    We'll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
                    <input type="text" name="name" id="name" value={formData.name} onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0d5d47] focus:ring-2 focus:ring-[#0d5d47] focus:ring-opacity-50 ${errors.name && 'border-red-500'}`} />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Your Email</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0d5d47] focus:ring-2 focus:ring-[#0d5d47] focus:ring-opacity-50 ${errors.email && 'border-red-500'}`} />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
                    <select name="subject" id="subject" value={formData.subject} onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0d5d47] focus:ring-2 focus:ring-[#0d5d47] focus:ring-opacity-50 ${errors.subject && 'border-red-500'}`}>
                      <option value="">Select a subject</option>
                      <option>General Inquiry</option>
                      <option>Event Feedback</option>
                      <option>Partnership</option>
                      <option>Other</option>
                    </select>
                    {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea name="message" id="message" rows={5} value={formData.message} onChange={handleChange}
                      className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#0d5d47] focus:ring-2 focus:ring-[#0d5d47] focus:ring-opacity-50 ${errors.message && 'border-red-500'}`}></textarea>
                    {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                  </div>
                  <div>
                    <button type="submit" disabled={isSubmitting}
                      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-[#f7931e] hover:bg-[#d97c12] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#f7931e] transition-colors duration-300 disabled:bg-gray-400">
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaEnvelope className="w-6 h-6 text-[#0d5d47]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
                  <p className="text-gray-600">contact@togetherwecan.org</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaPhone className="w-6 h-6 text-[#0d5d47]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Call Us</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaMapMarkerAlt className="w-6 h-6 text-[#0d5d47]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Find Us</h3>
                  <p className="text-gray-600">123 Community Lane, Dehradun, India</p>
                </div>
              </div>
              
              {/* Social Icons */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">Follow Us</h3>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="social-icon group">
                    <BsFacebook className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                  </a>
                  <a href="#" className="social-icon group">
                    <BsTwitter className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                  </a>
                  <a href="#" className="social-icon group">
                    <BsLinkedin className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Add some styles to globals.css if they aren't already there
/* In globals.css:
.social-icon {
  @apply bg-gray-100 rounded-full p-3 transition-all duration-300;
}
.social-icon:hover {
  @apply bg-[#f7931e] transform scale-110;
}
*/ 