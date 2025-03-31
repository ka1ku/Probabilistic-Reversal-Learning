"use client";
import React, { useState, useEffect, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Results from "@/components/main/Results";
import StartGame from "@/components/main/StartGame";
import { Sun, Moon } from "lucide-react";

const initialColors = ["red", "blue", "green", "yellow", "purple"];

const shuffleArray = (array: string[]) => {
  return array.sort(() => Math.random() - 0.5);
};

const ProbabilisticReversalLearning = () => {
  const PERFORMANCE_WINDOW_SIZE = 10;
  const PERFORMANCE_CRITERION = 8;
  const TOTAL_TRIALS = 140;

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colors, setColors] = useState(shuffleArray([...initialColors]));

  const [gameState, setGameState] = useState({
    isStarted: false,
    trial: 0,
    score: 0,
    consecutiveCorrect: 0,
    rewardingStimulus:
      initialColors[Math.floor(Math.random() * initialColors.length)],
    numReversals: 0,
    lastFeedback: null as null | boolean,
    history: [] as any[],
    gameOver: false,
    startTime: Date.now(),
    lastReversalIndex: 0,
    prolificID: "",
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleChoice = (choice: string) => {
    const gameOver = gameState.trial + 1 >= TOTAL_TRIALS;
    const lastFeedback = choice === gameState.rewardingStimulus;

    let consecutiveCorrect = gameState.consecutiveCorrect;
    let score = gameState.score;

    if (lastFeedback) {
      consecutiveCorrect += 1;
      score += 1;
    } else {
      consecutiveCorrect = 0;
      score -= 1;
    }

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

    let updatedHistory = [...gameState.history, newHistoryEntry];

    let rewardingStimulus = gameState.rewardingStimulus;
    let numReversals = gameState.numReversals;
    let lastReversalIndex = gameState.lastReversalIndex;

    const historySinceLastReversal = updatedHistory.slice(lastReversalIndex);
    const recentSlice = historySinceLastReversal.slice(
      -PERFORMANCE_WINDOW_SIZE
    );

    const correctCount = recentSlice.filter((t) => t.won).length;
    if (correctCount >= PERFORMANCE_CRITERION) {
      const newStimulus =
        initialColors[Math.floor(Math.random() * initialColors.length)];

      rewardingStimulus = newStimulus;
      numReversals += 1;
      newHistoryEntry.wasReversalTrial = true;

      lastReversalIndex = updatedHistory.length;
    }

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
      lastReversalIndex,
    }));
    setColors(shuffleArray([...initialColors]));
  };

  const startGame = (prolificID: string) => {
    setGameState({
      isStarted: true,
      trial: 0,
      score: 0,
      consecutiveCorrect: 0,
      rewardingStimulus:
        initialColors[Math.floor(Math.random() * initialColors.length)],
      numReversals: 0,
      lastFeedback: null,
      history: [],
      gameOver: false,
      startTime: Date.now(),
      lastReversalIndex: 0,
      prolificID,
    });
    setColors(shuffleArray([...initialColors]));
  };

  const resetGame = () => {
    setGameState({
      isStarted: false,
      trial: 0,
      score: 0,
      consecutiveCorrect: 0,
      rewardingStimulus:
        initialColors[Math.floor(Math.random() * initialColors.length)],
      numReversals: 0,
      lastFeedback: null,
      history: [],
      gameOver: false,
      startTime: Date.now(),
      lastReversalIndex: 0,
      prolificID: "",
    });
    setColors(shuffleArray([...initialColors]));
  };

  return (
    <Card className="w-full max-w-5xl mx-auto border-0">
      <CardContent>
        <div className="flex justify-end mb-4 pt-4">
          <Button onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>
        </div>
        {!gameState.isStarted ? (
          <Suspense fallback={<div>Loading...</div>}>
            <StartGame onStart={startGame} />
          </Suspense>
        ) : (
          <>
            {!gameState.gameOver && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="dark:text-white">
                    Trial: {gameState.trial + 1}/{TOTAL_TRIALS}
                  </div>
                  <div className="dark:text-white">
                    Score: {gameState.score}
                  </div>
                </div>

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
              </div>
            )}

            {gameState.gameOver && (
              <Results gameState={gameState} TOTAL_TRIALS={TOTAL_TRIALS} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProbabilisticReversalLearning;
