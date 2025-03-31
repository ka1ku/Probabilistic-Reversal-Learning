// components/Results.tsx
import React, { FC } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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
  startGame: (prolificID: string) => void;
  resetGame: () => void;
}

const Results: FC<ResultsProps> = ({
  gameState,
  TOTAL_TRIALS,
  startGame,
  resetGame,
}) => {
  if (!gameState.gameOver) return null;

  const reversalTrial = gameState.history.findIndex(
    (trial) => trial.wasReversalTrial
  );
  const preReversalTrials =
    reversalTrial !== -1 ? gameState.history.slice(0, reversalTrial) : [];
  const postReversalTrials =
    reversalTrial !== -1 ? gameState.history.slice(reversalTrial) : [];

  const preReversalAccuracy =
    preReversalTrials.length > 0
      ? (
          (preReversalTrials.filter((t) => t.won).length /
            preReversalTrials.length) *
          100
        ).toFixed(1)
      : "N/A";

  const postReversalAccuracy =
    postReversalTrials.length > 0
      ? (
          (postReversalTrials.filter((t) => t.won).length /
            postReversalTrials.length) *
          100
        ).toFixed(1)
      : "N/A";

  const exportToCSV = async () => {
    const csvContent = [
      [
        "Trial",
        "Score",
        "Your Choice",
        "Correct Button",
        "Outcome",
        "Rule Change?",
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
      .map((e) => e.join(","))
      .join("\n");

  
  };

  const submitScores = async () => {
    try {
      // Generate CSV content from the gameState.history
      const csvContent = [
        [
          "Trial",
          "Score",
          "Your Choice",
          "Correct Button",
          "Outcome",
          "Rule Change?",
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
        .map((row) => row.join(",")) // Join each row with commas
        .join("\n"); // Join rows with newlines
  
        if (!csvContent || csvContent.trim() === "") {
          throw new Error("CSV content is empty or invalid.");
        }
  
        // Send the POST request WITHOUT 'no-cors'
        const response = await fetch(
          "https://us-central1-reversal-b937e.cloudfunctions.net/search",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json", // Keep this!
            },
            // mode: 'no-cors', // REMOVE THIS LINE
            body: JSON.stringify({
              csvContent,
              prolificID: gameState.prolificID,
            }),
          }
        );
  
        // Now you can properly check the response status
        if (!response.ok) {
          // Try to get more error details from the backend response
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            // Response wasn't valid JSON
            errorData = { error: response.statusText };
          }
          console.error("Server responded with error:", response.status, errorData);
          throw new Error(errorData?.error || `Failed to submit scores (HTTP ${response.status})`);
        }
  
        const data = await response.json(); // This should work now
        console.log("Scores submitted successfully:", data);
        alert(`Scores submitted successfully! File ID: ${data.fileId}`); // Give user feedback
  
      } catch (error: any) { // Catch specific error types if needed
        console.error("Error submitting scores:", error);
        alert(`Failed to submit scores: ${error.message}. Please check the console.`);
      }
    };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-lg font-semibold dark:text-white">Game Results</h3>
      <div className="grid grid-cols-2 gap-4">
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
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <div className="font-medium dark:text-white">
            Pre-reversal Accuracy
          </div>
          <div className="text-2xl dark:text-white">{preReversalAccuracy}%</div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <div className="font-medium dark:text-white">
            Post-reversal Accuracy
          </div>
          <div className="text-2xl dark:text-white">{postReversalAccuracy}%</div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-4 dark:text-white">
          Trial History
        </h4>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Trial</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Your Choice</TableHead>
                <TableHead>Correct Button</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Rule Change?</TableHead>
                <TableHead>Duration (ms)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameState.history.map((trial, index) => (
                <TableRow key={index}>
                  <TableCell>{trial.trial}</TableCell>
                  <TableCell>{trial.score}</TableCell>
                  <TableCell>{trial.choice}</TableCell>
                  <TableCell>{trial.rewardingStimulus}</TableCell>
                  <TableCell>
                    {trial.won ? "✓ Won" : "✗ Lost"}
                  </TableCell>
                  <TableCell>
                    {trial.wasReversalTrial ? "Yes" : "No"}
                  </TableCell>
                  <TableCell>{trial.duration}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex space-x-4 mt-4">
        <Button onClick={resetGame}>Play Again</Button>
        <Button onClick={exportToCSV} className="flex items-center">
          <Download className="mr-2" /> Export to CSV
        </Button>
        <Button onClick={submitScores} className="flex items-center">
    Submit Scores
  </Button>
      </div>
    </div>
  );
};

export default Results;
