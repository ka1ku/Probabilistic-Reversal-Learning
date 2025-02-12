"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Results from "@/components/main/Results";
import StartGame from "@/components/main/StartGame";
import { Sun, Moon } from "lucide-react";

const initialColors = ["red", "blue", "green", "yellow", "purple"];

// Helper to shuffle array items
const shuffleArray = (array: string[]) => {
  return array.sort(() => Math.random() - 0.5);
};

const ProbabilisticReversalLearning = () => {
  // Performance-based reversal constants
  const [performanceWindowSize, setPerformanceWindowSize] = useState(10);
  const [performanceCriterion, setPerformanceCriterion] = useState(7); 

  // Existing states
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colors, setColors] = useState(shuffleArray([...initialColors]));
  const [totalTrials, setTotalTrials] = useState(20);

  // We add lastReversalIndex to track where to start counting correct trials.
  const [gameState, setGameState] = useState({
    isStarted: false,
    trial: 0,
    score: 0,
    consecutiveCorrect: 0,
    rewardingStimulus: initialColors[Math.floor(Math.random() * initialColors.length)],
    numReversals: 0,
    lastFeedback: null as null | boolean,
    history: [] as any[],
    gameOver: false,
    startTime: Date.now(),
    lastReversalIndex: 0, // ← NEW: we start counting from the beginning
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleChoice = (choice: string) => {
    // Determine if this is the last trial
    const gameOver = gameState.trial + 1 >= totalTrials;

    // Check if participant chose the correct (rewarding) stimulus
    const lastFeedback = (choice === gameState.rewardingStimulus);

    let consecutiveCorrect = gameState.consecutiveCorrect;
    let score = gameState.score;

    if (lastFeedback) {
      consecutiveCorrect += 1;
      score += 1;
    } else {
      consecutiveCorrect = 0;
      score -= 1;
    }

    // Build a new history entry for this trial
    const trialDuration = Date.now() - gameState.startTime;
    const newHistoryEntry = {
      trial: gameState.trial + 1,
      score,
      choice,
      rewardingStimulus: gameState.rewardingStimulus,
      won: lastFeedback,
      wasReversalTrial: false,
      duration: trialDuration,
    };

    // Append to history
    let updatedHistory = [...gameState.history, newHistoryEntry];

    // Copy over some values we might update
    let rewardingStimulus = gameState.rewardingStimulus;
    let numReversals = gameState.numReversals;
    let lastReversalIndex = gameState.lastReversalIndex;

    // 1) Take the slice of trials *since the last reversal*.
    //    Then optionally limit to 'performanceWindowSize' from that point.
    const historySinceLastReversal = updatedHistory.slice(lastReversalIndex);
    const recentSlice = historySinceLastReversal.slice(-performanceWindowSize);

    // 2) Count how many correct in that slice
    const correctCount = recentSlice.filter((t) => t.won).length;

    // 3) If the criterion (e.g., 7 out of last 10) is met, do a reversal
    if (correctCount >= performanceCriterion) {
      // Trigger a reversal
      const newStimulus = initialColors[Math.floor(Math.random() * initialColors.length)];

      rewardingStimulus = newStimulus;
      numReversals += 1;
      newHistoryEntry.wasReversalTrial = true;

      // 4) Update lastReversalIndex so future checks only look at new rule trials
      lastReversalIndex = updatedHistory.length;
    }

    // Finally, set the new game state
    setGameState((prevState) => ({
      ...prevState,
      trial: prevState.trial + 1,
      gameOver,
      rewardingStimulus,
      numReversals,
      consecutiveCorrect,
      lastFeedback,
      score,
      history: updatedHistory,
      startTime: Date.now(),
      lastReversalIndex, // Store the updated index
    }));

    // Shuffle button colors for the next trial
    setColors(shuffleArray([...initialColors]));
  };

  const startGame = (
    totalTrials: number,
    performanceWindow: number,
    criterion: number
  ) => {
    // Configure settings from user input or defaults
    setPerformanceWindowSize(performanceWindow);
    setPerformanceCriterion(criterion);
    setTotalTrials(totalTrials);

    setGameState({
      isStarted: true,
      trial: 0,
      score: 0,
      consecutiveCorrect: 0,
      rewardingStimulus: initialColors[Math.floor(Math.random() * initialColors.length)],
      numReversals: 0,
      lastFeedback: null,
      history: [],
      gameOver: false,
      startTime: Date.now(),
      lastReversalIndex: 0, // reset
    });
    setColors(shuffleArray([...initialColors]));
  };

  const resetGame = () => {
    setGameState({
      isStarted: false,
      trial: 0,
      score: 0,
      consecutiveCorrect: 0,
      rewardingStimulus: initialColors[Math.floor(Math.random() * initialColors.length)],
      numReversals: 0,
      lastFeedback: null,
      history: [],
      gameOver: false,
      startTime: Date.now(),
      lastReversalIndex: 0,
    });
    setColors(shuffleArray([...initialColors]));
  };

  return (
    <Card className="w-full max-w-5xl mx-auto border-0">
      <CardContent>
        {/* Toggle Dark Mode */}
        <div className="flex justify-end mb-4 pt-4">
          <Button onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>
        </div>

        {/* Start Screen vs. Game Screen */}
        {!gameState.isStarted ? (
          <StartGame onStart={startGame} />
        ) : (
          <>
            {/* Game in progress */}
            {!gameState.gameOver && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="dark:text-white">
                    Trial: {gameState.trial + 1}/{totalTrials}
                  </div>
                  <div className="dark:text-white">Score: {gameState.score}</div>
                </div>

                {/* Show feedback on last trial */}
                {gameState.lastFeedback !== null && (
                  <Alert
                    className={
                      gameState.lastFeedback
                        ? "bg-green-50 dark:bg-green-900"
                        : "bg-red-50 dark:bg-red-900"
                    }
                  >
                    <AlertDescription className="dark:text-white">
                      {gameState.lastFeedback
                        ? "✓ Correct! You won 1 point!"
                        : "✗ Incorrect! You lost 1 point!"}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Buttons to click */}
                <div className="flex gap-4 justify-center flex-wrap">
                  {colors.map((color, index) => (
                    <Button
                      key={index}
                      onClick={() => handleChoice(color)}
                      className="w-20 h-20 text-2xl hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Game over */}
            {gameState.gameOver && (
              <Results
                gameState={gameState}
                TOTAL_TRIALS={totalTrials}
                startGame={startGame}
                resetGame={resetGame}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProbabilisticReversalLearning;
