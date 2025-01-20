"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Results from "./Results";
import StartGame from "./StartGame";
import { Sun, Moon } from "lucide-react";

const ProbabilisticReversalLearning = () => {
  const [gameState, setGameState] = useState({
    isStarted: false,
    trial: 0,
    score: 0,
    consecutiveCorrect: 0,
    rewardingStimulus: Math.floor(Math.random() * 5),
    numReversals: 0,
    lastFeedback: null as null | boolean,
    history: [] as any[],
    gameOver: false,
  });

  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const TOTAL_TRIALS = 20;
  const REVERSAL_THRESHOLD = 0.8;

  const handleChoice = (choice: number) => {
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

    let rewardingStimulus = gameState.rewardingStimulus;
    let numReversals = gameState.numReversals;
    if (Math.random() > REVERSAL_THRESHOLD) {
      rewardingStimulus = Math.floor(Math.random() * 5);
      numReversals++;
    }

    const newHistoryEntry = {
      trial: gameState.trial + 1,
      score,
      choice,
      rewardingStimulus: gameState.rewardingStimulus,
      won: lastFeedback,
      wasReversalTrial: rewardingStimulus !== gameState.rewardingStimulus,
    };

    setGameState((prevState) => ({
      ...prevState,
      trial: prevState.trial + 1,
      gameOver,
      rewardingStimulus,
      numReversals,
      consecutiveCorrect,
      lastFeedback,
      score,
      history: [...prevState.history, newHistoryEntry],
    }));
  };

  const startGame = () => {
    setGameState({
      isStarted: true,
      trial: 0,
      score: 0,
      consecutiveCorrect: 0,
      rewardingStimulus: Math.floor(Math.random() * 5),
      numReversals: 0,
      lastFeedback: null,
      history: [],
      gameOver: false,
    });
  };

  return (
    <Card className="w-full max-w-5xl mx-auto">
      <CardContent>
        <div className="flex justify-end mb-4 pt-4">
          <Button onClick={() => setIsDarkMode(!isDarkMode)}>
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>
        </div>
        {!gameState.isStarted ? (
          <StartGame onStart={startGame} />
        ) : (
          <>
            {!gameState.gameOver && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="dark:text-white">
                    Trial: {gameState.trial + 1}/{TOTAL_TRIALS}
                  </div>
                  <div className="dark:text-white">Score: {gameState.score}</div>
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
                        : "✗ Incorrect! No points."}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-4 justify-center flex-wrap">
                  {["red", "blue", "green", "yellow", "purple"].map(
                    (color, index) => (
                      <Button
                        key={index}
                        onClick={() => handleChoice(index)}
                        className="w-20 h-20 text-2xl hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: color }}
                      ></Button>
                    )
                  )}
                </div>
              </div>
            )}

            {gameState.gameOver && (
              <Results
                gameState={gameState}
                TOTAL_TRIALS={TOTAL_TRIALS}
                startGame={startGame}
              />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProbabilisticReversalLearning;