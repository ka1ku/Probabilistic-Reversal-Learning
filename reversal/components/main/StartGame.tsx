import { Button } from "../ui/button";
import { useState } from "react";

const StartGame = ({ onStart }) => {
  const [prolificID, setProlificID] = useState("");
  const [error, setError] = useState("");

  const validateProlificID = (id: string) => {
    // Prolific IDs are 24 characters long and contain letters and numbers
    const prolificIDRegex = /^[0-9a-zA-Z]{24}$/;
    return prolificIDRegex.test(id);
  };

  const handleStart = () => {
    if (!prolificID) {
      setError("Please enter your Prolific ID");
      return;
    }
    
    if (!validateProlificID(prolificID)) {
      setError("Invalid Prolific ID format. Please paste the correct 24-character ID from Prolific.");
      return;
    }
    
    setError("");
    onStart(prolificID);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Probabilistic Learning Game
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            The reward button may change during the game - try to find and stick to the most rewarding option to maximize your score!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Note - this is a DEMO reach out to ka1@uchicago.edu with any concerns
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <label className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">
              Enter your Prolific ID:
            </label>
            <input
              type="text"
              value={prolificID}
              onChange={(e) => {
                setProlificID(e.target.value);
                setError("");
              }}
              className={`w-full p-3 rounded-lg border ${
                error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
              } text-black`}
              placeholder="Paste your Prolific ID here"
            />
            {error && (
              <p className="mt-2 text-sm text-red-500 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>

        <Button 
          onClick={handleStart}
          className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default StartGame;