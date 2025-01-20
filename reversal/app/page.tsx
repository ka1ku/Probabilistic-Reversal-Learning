"use client";
import React, { useState, useEffect } from "react";
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
  });

  const [isDarkMode, setIsDarkMode] = useState(true);
  const [colors, setColors] = useState(shuffleArray([...initialColors]));
  const [totalTrials, setTotalTrials] = useState(20);
  const [reversalThreshold, setReversalThreshold] = useState(0.8);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const handleChoice = (choice: string) => {
    const gameOver = gameState.trial + 1 >= totalTrials;
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
    if (Math.random() > reversalThreshold) {
      rewardingStimulus = initialColors[Math.floor(Math.random() * initialColors.length)];
      numReversals++;
    }

    const trialDuration = Date.now() - gameState.startTime;

    const newHistoryEntry = {
      trial: gameState.trial + 1,
      score,
      choice,
      rewardingStimulus: gameState.rewardingStimulus,
      won: lastFeedback,
      wasReversalTrial: rewardingStimulus !== gameState.rewardingStimulus,
      duration: trialDuration,
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
      startTime: Date.now(),
    }));

    setColors(shuffleArray([...initialColors]));
  };

  const startGame = (reversalThreshold: number, totalTrials: number) => {
    setReversalThreshold(reversalThreshold);
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
          <StartGame onStart={startGame} />
        ) : (
          <>
            {!gameState.gameOver && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div className="dark:text-white">
                    Trial: {gameState.trial + 1}/{totalTrials}
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
                  {colors.map((color, index) => (
                    <Button
                      key={index}
                      onClick={() => handleChoice(color)}
                      className="w-20 h-20 text-2xl hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: color }}
                    ></Button>
                  ))}
                </div>
              </div>
            )}

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