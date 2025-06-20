import React, { useState } from 'react';
import { AiFillStar } from "react-icons/ai"; // Import for star icons

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  userId: string;
  onFeedbackSubmitted: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  eventId,
  userId,
  onFeedbackSubmitted,
}) => {
  const [testimonial, setTestimonial] = useState('');
  const [rating, setRating] = useState<number>(0); // Initialize with 0 for no star selected
  const [locationClear, setLocationClear] = useState<boolean | null>(null);
  const [orgRating, setOrgRating] = useState<number>(0);
  const [volunteerImpactFelt, setVolunteerImpactFelt] = useState<number>(0);
  const [wouldAttendAgain, setWouldAttendAgain] = useState<boolean | null>(null);
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (rating === 0) {
      setError('Please provide a general rating (1-5 stars).');
      setLoading(false);
      return;
    }

    // Require locationClear to be selected
    if (locationClear === null) {
      setError('Please answer if the location was easy to find.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/drive-completion/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId,
          userId,
          testimonial,
          rating,
          locationClear,
          orgRating: orgRating === 0 ? null : orgRating, // Send null if no rating selected
          volunteerImpactFelt: volunteerImpactFelt === 0 ? null : volunteerImpactFelt, // Send null if no rating selected
          wouldAttendAgain,
          suggestions,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit feedback');
      }

      setSuccess(data.message || 'Feedback submitted successfully!');
      onFeedbackSubmitted();
      setTimeout(() => {
        onClose();
        setTestimonial('');
        setRating(0);
        setLocationClear(null);
        setOrgRating(0);
        setVolunteerImpactFelt(0);
        setWouldAttendAgain(null);
        setSuggestions('');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center text-[#0E6E5C]">Give Feedback</h2>
        <form onSubmit={handleSubmit}>
          {/* General Rating */} 
          <div className="mb-4">
            <label htmlFor="rating" className="block text-gray-700 text-sm font-bold mb-2">Overall Rating (1-5 Stars):</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <AiFillStar
                  key={star}
                  className={`cursor-pointer text-3xl transition-colors duration-200
                    ${star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}
                  `}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>

          {/* Location Easy to Find? */} 
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Was the location easy to find?</label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#0E6E5C]"
                  name="locationClear"
                  value="true"
                  checked={locationClear === true}
                  onChange={() => setLocationClear(true)}
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-red-600"
                  name="locationClear"
                  value="false"
                  checked={locationClear === false}
                  onChange={() => setLocationClear(false)}
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Drive Well Organized? */} 
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">How well organized was the drive? (1-5 Stars)</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <AiFillStar
                  key={star}
                  className={`cursor-pointer text-3xl transition-colors duration-200
                    ${star <= orgRating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}
                  `}
                  onClick={() => setOrgRating(star)}
                />
              ))}
            </div>
          </div>

          {/* Volunteer Impact Felt? */} 
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Did you feel your volunteer impact? (1-5 Stars)</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <AiFillStar
                  key={star}
                  className={`cursor-pointer text-3xl transition-colors duration-200
                    ${star <= volunteerImpactFelt ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}
                  `}
                  onClick={() => setVolunteerImpactFelt(star)}
                />
              ))}
            </div>
          </div>

          {/* Would You Attend Again? */} 
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Would you attend another drive?</label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-[#0E6E5C]"
                  name="wouldAttendAgain"
                  value="true"
                  checked={wouldAttendAgain === true}
                  onChange={() => setWouldAttendAgain(true)}
                />
                <span className="ml-2 text-gray-700">Yes</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio text-red-600"
                  name="wouldAttendAgain"
                  value="false"
                  checked={wouldAttendAgain === false}
                  onChange={() => setWouldAttendAgain(false)}
                />
                <span className="ml-2 text-gray-700">No</span>
              </label>
            </div>
          </div>

          {/* Testimonial */} 
          <div className="mb-4">
            <label htmlFor="testimonial" className="block text-gray-700 text-sm font-bold mb-2">Your Experience (required):</label>
            <textarea
              id="testimonial"
              value={testimonial}
              onChange={(e) => setTestimonial(e.target.value)}
              placeholder="Share your experience with this drive..."
              rows={5}
              required
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
            ></textarea>
          </div>

          {/* Optional Suggestions */} 
          <div className="mb-6">
            <label htmlFor="suggestions" className="block text-gray-700 text-sm font-bold mb-2">Optional Suggestions:</label>
            <textarea
              id="suggestions"
              value={suggestions}
              onChange={(e) => setSuggestions(e.target.value)}
              placeholder="Any additional thoughts or suggestions?"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline resize-none"
            ></textarea>
          </div>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {success && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-8 rounded-lg shadow-xl text-center">
                <div className="text-[#0E6E5C] text-2xl font-bold mb-3">✓ Success!</div>
                <p className="text-gray-800 text-lg">{success}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-full transition duration-300"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#0E6E5C] hover:bg-[#0a5748] text-white font-bold py-2 px-4 rounded-full transition duration-300"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal; 