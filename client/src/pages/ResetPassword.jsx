import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Lock, Key } from "lucide-react";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      return setMessage("Please fill all fields.");
    }
    if (newPassword !== confirmPassword) {
      return setMessage("Passwords do not match.");
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/reset-password/${token}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        setMessage("Password reset successful! Redirecting...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-zinc-900">
      <div className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-amber-400 mb-6 flex items-center gap-3 justify-center">
          <Lock className="w-6 h-6" /> Reset Password
        </h2>

        <div className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            className="w-full bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:border-orange-500 focus:outline-none"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            onClick={handleResetPassword}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-600 text-black font-medium px-4 py-2 rounded-lg transition-colors w-full"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          {message && (
            <p
              className={`text-center text-sm mt-3 ${
                message.includes("successful")
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
