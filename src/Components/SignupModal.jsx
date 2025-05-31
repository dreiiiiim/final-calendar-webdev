// SignupModal.jsx
import React, { useState } from "react";
import { supabase } from "./client";

const SignupModal = ({ onClose, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setLoading(false);

      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        // Check for already registered email
        if (
          error.message.toLowerCase().includes("user already registered") ||
          error.message.toLowerCase().includes("user already exists") ||
          error.message.toLowerCase().includes("email")
        ) {
          setError(
            "This email is already registered. Please log in or use a different email."
          );
        } else {
          setError(error.message);
        }
        setLoading(false);
        return;
      }
      console.log("Signed up successfully:", data);
      onClose(); // Close modal on successful signup
    } catch (error) {
      console.error("Error signing up:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((prevFormData) => {
      const newFormData = {
        ...prevFormData,
        [name]: value,
      };
      return newFormData;
    });
  }

  async function handleGoogleSignIn() {
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });

      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-white p-12 rounded-lg shadow-lg w-full max-w-lg relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">MyCalendar</h1>
          <p className="text-xl">
            Every Date Holds a Story. Start Telling Yours.
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="signup-email"
              className="block text-xl mb-2 font-medium"
            >
              Email Address
            </label>
            <input
              name="email"
              type="email"
              id="signup-email"
              className="w-full p-4 border border-gray-300 rounded-lg text-lg"
              placeholder="Enter your email"
              required
              onChange={handleChange}
              value={formData.email}
            />
          </div>
          <div>
            <label
              htmlFor="signup-password"
              className="block text-xl mb-2 font-medium"
            >
              Password
            </label>
            <input
              name="password"
              type="password"
              id="signup-password"
              className="w-full p-4 border border-gray-300 rounded-lg text-lg"
              placeholder="********"
              required
              onChange={handleChange}
              value={formData.password}
            />
          </div>
          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-xl mb-2 font-medium"
            >
              Confirm Password
            </label>
            <input
              name="confirmPassword"
              type="password"
              id="signup-confirm-password"
              className="w-full p-4 border border-gray-300 rounded-lg text-lg"
              placeholder="********"
              required
              onChange={handleChange}
              value={formData.confirmPassword}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-redcolor hover:bg-red-800 text-white py-4 px-4 rounded-lg text-xl font-medium transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Sign up"}
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 w-full mt-4 border border-gray-300 bg-white hover:bg-gray-100 text-black py-4 px-4 rounded-lg text-xl font-medium transition-colors duration-300"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 533.5 544.3"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M533.5 278.4c0-17.4-1.6-34.1-4.6-50.3H272v95.2h146.9c-6.3 34.2-25.1 63.2-53.6 82.6v68h86.7c50.8-46.8 81.5-115.7 81.5-195.5z"
                fill="#4285F4"
              />
              <path
                d="M272 544.3c72.9 0 134-24.2 178.6-65.8l-86.7-68c-24.1 16.1-55 25.7-91.9 25.7-70.6 0-130.5-47.7-151.8-111.6H32.1v70.3C76.4 486.5 167.6 544.3 272 544.3z"
                fill="#34A853"
              />
              <path
                d="M120.2 324.6c-10.1-30.2-10.1-62.7 0-92.9v-70.3H32.1c-41.3 82.2-41.3 181.3 0 263.5l88.1-70.3z"
                fill="#FBBC05"
              />
              <path
                d="M272 107.7c39.7-.6 77.7 13.6 106.9 39.3l80.1-80.1C405.6 24.4 343.5 0 272 0 167.6 0 76.4 57.8 32.1 141.4l88.1 70.3C141.5 155.4 201.4 107.7 272 107.7z"
                fill="#EA4335"
              />
            </svg>
            Sign up with Google
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-lg">
            Already Have An Account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-redcolor hover:underline"
            >
              Log in
            </button>
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-800 text-lg absolute top-4 right-4"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default SignupModal;
