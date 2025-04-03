"use client";
import React, { useState, useEffect, ChangeEvent } from "react";
import { Button } from "../ui/button";
import { useSearchParams } from "next/navigation";

interface StartGameProps {
  onStart: (prolificID: string) => void;
}

const PROLIFIC_ID_LENGTH = 24;

export const validateProlificID = (id: string): boolean => {
  // Prolific IDs are 24 characters long and contain letters and numbers
  const regex = new RegExp(`^[0-9a-zA-Z]{${PROLIFIC_ID_LENGTH}}$`);
  return regex.test(id);
};

const StartGame: React.FC<StartGameProps> = ({ onStart }) => {
  const searchParams = useSearchParams();
  const urlProlificID = searchParams.get("PROLIFIC_PID") || "";
  const [prolificID, setProlificID] = useState<string>(urlProlificID);
  const [error, setError] = useState<string>("");

  // If the URL parameter changes, update the state accordingly.
  useEffect(() => {
    if (urlProlificID) {
      setProlificID(urlProlificID);
    }
  }, [urlProlificID]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setProlificID(e.target.value);
    setError("");
  };

  const handleStart = () => {
    if (!prolificID) {
      setError("Please enter your Prolific ID");
      return;
    }
    if (!validateProlificID(prolificID)) {
      setError(
        "Invalid Prolific ID format. Please paste the correct 24-character ID from Prolific."
      );
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
            Select the Winning Button to Collect Points: In this game, you are
            to choose which of the five colored buttons is rewarded, but you
            won't know which of the colors wins until you make a guess. if your
            score is in the top 25% of other players, you will receive a $10
            bonus payment. In the following game, choose the colored button
            most likely to win you points. The location of the buttons change
            with each trial, but the winning button will remain the same color.
            The winning button will occasionally change though, so please pay
            attention to the game and your strategy. If you select which color
            wins, you get 100 points. If you select the wrong button, you lose
            50 points
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Note – this is a DEMO. Reach out to ka1@uchicago.edu with any
            concerns.
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <label className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">
              Prolific ID:
            </label>
            <input
              type="text"
              value={prolificID}
              onChange={handleInputChange}
              disabled={Boolean(urlProlificID)}
              className={`w-full p-3 rounded-lg border ${
                error
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-600"
              } text-black`}
              placeholder="Enter your Prolific ID"
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
