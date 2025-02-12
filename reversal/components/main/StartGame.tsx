import { Button } from "../ui/button";
import { Slider } from "../ui/slider";
import { useState } from "react";

const StartGame = ({ onStart }) => {
  const [totalTrials, setTotalTrials] = useState(20);
  const [performanceWindowSize, setPerformanceWindowSize] = useState(10);
  const [performanceCriterion, setPerformanceCriterion] = useState(7);

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
              Total Trials: <span className="text-blue-600">{totalTrials}</span>
            </label>
            <Slider
              value={[totalTrials]}
              onValueChange={([value]) => setTotalTrials(value)}
              max={200}
              step={1}
              min={5}
              className="w-full"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <label className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">
              Performance Window Size: <span className="text-blue-600">{performanceWindowSize}</span>
            </label>
            <Slider
              value={[performanceWindowSize]}
              onValueChange={([value]) => setPerformanceWindowSize(value)}
              max={20}
              step={1}
              min={1}
              className="w-full"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
            <label className="block mb-3 text-lg font-medium text-gray-900 dark:text-white">
              Performance Criterion: <span className="text-blue-600">{performanceCriterion}</span>
            </label>
            <Slider
              value={[performanceCriterion]}
              onValueChange={([value]) => setPerformanceCriterion(value)}
              max={performanceWindowSize}
              step={1}
              min={1}
              className="w-full"
            />
          </div>
        </div>

        <Button 
          onClick={() => onStart(totalTrials, performanceWindowSize, performanceCriterion)}
          className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Start Game
        </Button>
      </div>
    </div>
  );
};

export default StartGame;