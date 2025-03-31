import React, { FC, useState, useEffect, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TrialHistory {
  trial: number;
  score: number;
  choice: string;
  rewardingStimulus: string;
  won: boolean;
  wasReversalTrial: boolean;
  duration: number;
}

interface GameState {
  score: number;
  history: TrialHistory[];
  gameOver: boolean;
  prolificID: string;
}

interface ResultsProps {
  gameState: GameState;
  TOTAL_TRIALS: number;
}

type SubmissionStatus = "idle" | "submitting" | "success" | "error";

const Results: FC<ResultsProps> = ({ gameState, TOTAL_TRIALS }) => {
  const [status, setStatus] = useState<SubmissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Use a ref as a flag so the submission is only triggered once.
  const submittedRef = useRef(false);

  useEffect(() => {
    if (gameState.gameOver && !submittedRef.current) {
      submittedRef.current = true;
      setStatus("submitting");

      const submitScores = async () => {
        try {
          const csvContent = [
            [
              "Trial",
              "Score",
              "Your Choice",
              "Correct Button",
              "Outcome",
              "Was Reversal?",
              "Duration (ms)",
            ],
            ...gameState.history.map((trial) => [
              trial.trial,
              trial.score,
              trial.choice,
              trial.rewardingStimulus,
              trial.won ? "Won" : "Lost",
              trial.wasReversalTrial ? "Yes" : "No",
              trial.duration,
            ]),
          ]
            .map((row) => row.join(","))
            .join("\n");

          if (!csvContent || csvContent.trim() === "") {
            throw new Error("CSV content is empty or invalid.");
          }

          if (!gameState.prolificID || gameState.prolificID.trim() === "") {
            throw new Error("Prolific ID is missing.");
          }

          console.log("Submitting scores for:", gameState.prolificID);
          const response = await fetch(
            "https://us-central1-reversal-b937e.cloudfunctions.net/search",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                csvContent,
                prolificID: gameState.prolificID,
              }),
            }
          );

          if (!response.ok) {
            let errorData;
            try {
              errorData = await response.json();
            } catch (e) {
              errorData = { error: response.statusText };
            }
            console.error("Server responded with error:", response.status, errorData);
            throw new Error(
              errorData?.error || `Failed to submit scores (HTTP ${response.status})`
            );
          }

          const data = await response.json();
          console.log("Scores submitted successfully:", data);
          setStatus("success");
  
        } catch (error: any) {
          console.error("Error during submission process:", error);
          setErrorMessage(error.message || "An unknown error occurred.");
          setStatus("error");
        }
      };

      submitScores();
    }
  }, [gameState.gameOver, gameState.history, gameState.prolificID]);

  if (!gameState.gameOver) return null;

  return (
    <div className="space-y-6 mt-6 text-center">
      <h3 className="text-lg font-semibold dark:text-white">Game Complete</h3>
      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <div className="font-medium dark:text-white">Total Score</div>
          <div className="text-2xl dark:text-white">{gameState.score}</div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <div className="font-medium dark:text-white">Accuracy</div>
          <div className="text-2xl dark:text-white">
            {(
              (gameState.history.filter((t) => t.won).length / TOTAL_TRIALS) *
              100
            ).toFixed(1)}
            %
          </div>
        </div>
      </div>
      <div className="mt-8">
        {status === "submitting" && (
          <div className="flex flex-col items-center space-y-2">
            <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
              Submitting results... Please wait.
            </p>
            <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        {status === "success" && (
          <Alert variant="default" className="bg-green-100 dark:bg-green-900 border-green-400 dark:border-green-600">
            <AlertTitle className="text-green-800 dark:text-green-200">Submission Successful!</AlertTitle>
            <AlertDescription className="text-green-700 dark:text-green-300">
              Your results have been recorded. You may now close this window.
            </AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert variant="destructive">
            <AlertTitle>Submission Failed</AlertTitle>
            <AlertDescription>
              There was an error submitting your results: {errorMessage}
              <br />
              Please contact the researcher or try refreshing the page.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default Results;