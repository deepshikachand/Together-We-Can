"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";

export default function ReviewBlogPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = Array.isArray(params?.eventId) ? params.eventId[0] : params?.eventId;
  const [blog, setBlog] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!eventId) return;
    setLoading(true);
    fetch(`/api/blog/by-event?eventId=${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (data.blog) {
          setBlog(data.blog);
          setTitle(data.blog.title);
          setContent(data.blog.content);
        } else {
          setError("Blog not found for this event.");
        }
      })
      .catch(() => setError("Failed to fetch blog."))
      .finally(() => setLoading(false));
  }, [eventId]);

  const handleSave = async () => {
    setSuccess("");
    setError("");
    try {
      const res = await fetch("/api/blog/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, title, content }),
      });
      let data: any = {};
      try {
        data = await res.json();
      } catch (e) {
        // If response is empty, ignore
      }
      if (res.ok) {
        setSuccess("Blog updated successfully!");
        setTimeout(() => {
          router.push(`/drives/${eventId}`);
        }, 1000);
      } else {
        setError(data.error || "Failed to update blog.");
      }
    } catch (err) {
      setError("Failed to update blog.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;

  return (
    <>
      <Navbar />
      <div className="page-container min-h-screen bg-[#0E6E5C] flex flex-col items-center" style={{ paddingTop: '5rem' }}>
        <div className="form-container bg-white p-10 rounded-2xl shadow-lg max-w-3xl w-full" style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2" style={{ color: '#0E6E5C' }}>✍️ Review & Edit Blog</h2>
          <div className="mb-4">
            <label className="block font-semibold mb-1" style={{ color: '#0E6E5C' }}>Title</label>
            <input
              className="input w-full p-3 rounded-lg border-none text-black text-base mb-2 focus:ring-2 focus:ring-[#0E6E5C] focus:outline-none"
              style={{ background: '#f9f9f9' }}
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block font-semibold mb-1" style={{ color: '#0E6E5C', marginTop: '1rem' }}>Content</label>
            <textarea
              className="textarea w-full p-3 rounded-lg border-none text-black text-base mb-2 focus:ring-2 focus:ring-[#0E6E5C] focus:outline-none"
              style={{ background: '#f9f9f9', minHeight: '350px', resize: 'vertical' }}
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
          <button
            className="save-btn bg-[#f78b3f] text-white px-6 py-3 rounded-lg font-bold transition-colors duration-300 hover:bg-[#f57c20]"
            onClick={handleSave}
          >
            Save
          </button>
          {success && <div className="mt-4 text-green-600">{success}</div>}
          {error && <div className="mt-4 text-red-600">{error}</div>}
        </div>
      </div>
    </>
  );
}
