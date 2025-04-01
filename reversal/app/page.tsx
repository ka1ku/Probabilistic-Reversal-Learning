"use client";
import React, { useState, useEffect, Suspense, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Results from "@/components/main/Results";
import StartGame from "@/components/main/StartGame";
import { Sun, Moon } from "lucide-react";

// --- Constants ---
const COLORS = ["red", "blue", "green", "yellow", "purple"];
const PROBABILITIES = [0.90, 0.55, 0.40, 0.25, 0.10]; // Highest to lowest reward probability
const REWARD_AMOUNT = 100;
const PUNISHMENT_AMOUNT = -50;
const REVERSAL_WINDOW_SIZE = 10; // How many trials to look back for reversal criterion
const REVERSAL_CRITERION = 9;   // How many times the correct deck must be chosen in the window
const TOTAL_TRIALS = 140;

// --- Types ---
interface DeckProbabilities {
  [color: string]: number;
}

interface TrialHistoryEntry {
  trial: number;
  score: number;
  choice: string;
  correctDeck: string; // Color of the deck with the highest probability
  rewarded: boolean;   // Did the player receive a reward?
  scoreChange: number; // +100 or -50
  duration: number;
  probabilities: DeckProbabilities; // Store probabilities for this trial (before potential reversal)
}

interface GameState {
  isStarted: boolean;
  trial: number;
  score: number;
  deckProbabilities: DeckProbabilities;
  currentCorrectDeck: string;
  numReversals: number;
  lastOutcome: { rewarded: boolean; scoreChange: number } | null;
  history: TrialHistoryEntry[];
  recentChoiceHistory: string[]; // Tracks last N choices for reversal check
  gameOver: boolean;
  startTime: any;
  prolificID: string;
}

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
  // Fisher-Yates shuffle
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const assignProbabilities = (colors: string[], probabilities: number[]): DeckProbabilities => {
  const shuffledProbs = shuffleArray(probabilities);
  const assignment: DeckProbabilities = {};
  colors.forEach((color, index) => {
    assignment[color] = shuffledProbs[index];
  });
  return assignment;
};

const getCorrectDeck = (probabilities: DeckProbabilities): string => {
  let correctDeck = "";
  let maxProb = -1;
  for (const color in probabilities) {
    if (probabilities[color] > maxProb) {
      maxProb = probabilities[color];
      correctDeck = color;
    }
  }
  return correctDeck;
};

// --- Component ---
const ProbabilisticReversalLearning = () => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  // Keep track of the visual order of buttons
  const [displayColors, setDisplayColors] = useState(shuffleArray([...COLORS]));
  const [gameState, setGameState] = useState<GameState>({
    isStarted: false,
    trial: 0,
    score: 0,
    deckProbabilities: {},
    currentCorrectDeck: "",
    numReversals: 0,
    lastOutcome: null,
    history: [],
    recentChoiceHistory: [],
    gameOver: false,
    startTime: null,
    prolificID: "",
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // --- Game Logic ---

  const initializeNewPhase = useCallback((previousCorrectDeck: string | null = null): { newProbabilities: DeckProbabilities; newCorrectDeck: string } => {
    let newProbabilities: DeckProbabilities;
    let newCorrectDeck: string;

    // Ensure the new correct deck is different after a reversal
    do {
      newProbabilities = assignProbabilities(COLORS, PROBABILITIES);
      newCorrectDeck = getCorrectDeck(newProbabilities);
    } while (previousCorrectDeck !== null && newCorrectDeck === previousCorrectDeck);

    return { newProbabilities, newCorrectDeck };
  }, []);


  const handleChoice = (choice: string) => {
    if (gameState.gameOver || !gameState.startTime) return; // Prevent actions if game over or not started

    const currentTrial = gameState.trial;
    const currentProbabilities = gameState.deckProbabilities;
    const currentCorrectDeck = gameState.currentCorrectDeck;
    const trialStartTime = gameState.startTime;

    const choiceProbability = currentProbabilities[choice];
    const rewarded = Math.random() < choiceProbability;
    const scoreChange = rewarded ? REWARD_AMOUNT : PUNISHMENT_AMOUNT;
    const newScore = gameState.score + scoreChange;
    const trialDuration = Date.now() - trialStartTime;

    // Update recent choices for reversal check
    const updatedRecentChoiceHistory = [...gameState.recentChoiceHistory, choice].slice(-REVERSAL_WINDOW_SIZE);

    let nextProbabilities = currentProbabilities;
    let nextCorrectDeck = currentCorrectDeck;
    let numReversals = gameState.numReversals;

    // Check for reversal condition
    if (updatedRecentChoiceHistory.length >= REVERSAL_WINDOW_SIZE) {
      const correctChoicesInWindow = updatedRecentChoiceHistory.filter(
        (c) => c === currentCorrectDeck
      ).length;

      if (correctChoicesInWindow >= REVERSAL_CRITERION) {
        console.log(`Reversal triggered on trial ${currentTrial + 1}! Correct deck (${currentCorrectDeck}) chosen ${correctChoicesInWindow} times in last ${REVERSAL_WINDOW_SIZE} trials.`);
        const { newProbabilities, newCorrectDeck } = initializeNewPhase(currentCorrectDeck);
        nextProbabilities = newProbabilities;
        nextCorrectDeck = newCorrectDeck;
        numReversals++;
        // Reset recent history *after* reversal, so the *next* phase starts fresh check window
        // updatedRecentChoiceHistory = []; // Let's not reset, the condition is "any 10 consecutive"
        console.log(`New correct deck: ${newCorrectDeck}`);
      }
    }

    const newHistoryEntry: TrialHistoryEntry = {
      trial: currentTrial + 1,
      score: newScore,
      choice,
      correctDeck: currentCorrectDeck, // Log the deck that *was* correct for this trial's choice
      rewarded,
      scoreChange,
      duration: trialDuration,
      probabilities: currentProbabilities, // Log probabilities *before* potential reversal
    };

    const newHistory = [...gameState.history, newHistoryEntry];
    const gameOver = currentTrial + 1 >= TOTAL_TRIALS;

    setGameState((prevState) => ({
      ...prevState,
      trial: currentTrial + 1,
      score: newScore,
      deckProbabilities: nextProbabilities,
      currentCorrectDeck: nextCorrectDeck,
      numReversals,
      lastOutcome: { rewarded, scoreChange },
      history: newHistory,
      recentChoiceHistory: updatedRecentChoiceHistory,
      gameOver,
      startTime: gameOver ? prevState.startTime : Date.now(), // Keep start time for final duration if game over, else reset for next trial RT
    }));

    // Shuffle visual presentation of buttons
    setDisplayColors(shuffleArray([...COLORS]));
  };

  const startGame = (prolificID: string) => {
     console.log("Starting game...");
     const { newProbabilities, newCorrectDeck } = initializeNewPhase();
     console.log("Initial probabilities:", newProbabilities);
     console.log("Initial correct deck:", newCorrectDeck);
     setGameState({
       isStarted: true,
       trial: 0,
       score: 0,
       deckProbabilities: newProbabilities,
       currentCorrectDeck: newCorrectDeck,
       numReversals: 0,
       lastOutcome: null,
       history: [],
       recentChoiceHistory: [],
       gameOver: false,
       startTime: Date.now(),
       prolificID,
     });
     setDisplayColors(shuffleArray([...COLORS]));
   };

  const resetGame = () => {
    // This function might not be needed if StartGame handles initialization fully
    // For now, it simply sets back to the non-started state
    setGameState({
        isStarted: false,
        trial: 0,
        score: 0,
        deckProbabilities: {},
        currentCorrectDeck: "",
        numReversals: 0,
        lastOutcome: null,
        history: [],
        recentChoiceHistory: [],
        gameOver: false,
        startTime: null,
        prolificID: "",
    });
    setDisplayColors(shuffleArray([...COLORS]));
  };

  // --- Rendering ---
  return (
    <Card className="w-full max-w-5xl mx-auto border-0">
      <CardContent>
        <div className="flex justify-end mb-4 pt-4">
          <Button onClick={() => setIsDarkMode(!isDarkMode)} variant="ghost" size="icon">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
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
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-medium dark:text-white">
                    Trial: {gameState.trial + 1} / {TOTAL_TRIALS}
                  </div>
                   <div className="text-lg font-medium dark:text-white">
                      Reversals: {gameState.numReversals}
                   </div>
                  <div className="text-lg font-medium dark:text-white">
                    Score: {gameState.score}
                  </div>
                </div>

                {/* Feedback Alert */}
                 {gameState.lastOutcome !== null && (
                  <Alert
                    className={
                      gameState.lastOutcome.rewarded
                        ? "bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700"
                        : "bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700"
                    }
                  >
                    <AlertDescription className={`text-center font-semibold ${
                      gameState.lastOutcome.rewarded
                       ? "text-green-800 dark:text-green-200"
                       : "text-red-800 dark:text-red-200"
                      }`}>
                      {gameState.lastOutcome.rewarded
                        ? `Reward! +${REWARD_AMOUNT} points!`
                        : `Punishment! ${PUNISHMENT_AMOUNT} points!`}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Deck Buttons */}
                <div className="flex gap-4 justify-center flex-wrap pt-4">
                  {displayColors.map((color) => (
                    <Button
                      key={color} // Use color as key since position changes
                      onClick={() => handleChoice(color)}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg shadow-lg text-white font-bold text-xl hover:opacity-85 transition-opacity duration-150 ease-in-out"
                      style={{
                         backgroundColor: color,
                         // Add a subtle border that works in light/dark mode
                         border: `2px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)'}`
                       }}
                       aria-label={`Choose ${color} deck`}
                    >
                      {/* Optionally display color name if needed, but usually not */}
                      {/* {color.charAt(0).toUpperCase() + color.slice(1)} */}
                    </Button>
                  ))}
                </div>


              </div>
            )}

            {/* Results Screen */}
            {gameState.gameOver && (
              // Pass the modified gameState and history structure to Results
              <Results gameState={gameState as any} TOTAL_TRIALS={TOTAL_TRIALS} />
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ProbabilisticReversalLearning;