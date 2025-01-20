import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const Results = ({ gameState, TOTAL_TRIALS, startGame }) => {
  if (!gameState.gameOver) return null;

  const reversalTrial = gameState.history.findIndex(trial => trial.wasReversalTrial);
  const preReversalTrials = gameState.history.slice(0, reversalTrial);
  const postReversalTrials = gameState.history.slice(reversalTrial);

  const preReversalAccuracy = preReversalTrials.length > 0
    ? (preReversalTrials.filter(t => t.won).length / preReversalTrials.length * 100).toFixed(1)
    : 'N/A';
  
  const postReversalAccuracy = postReversalTrials.length > 0
    ? (postReversalTrials.filter(t => t.won).length / postReversalTrials.length * 100).toFixed(1)
    : 'N/A';

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
            {((gameState.history.filter(t => t.won).length / TOTAL_TRIALS) * 100).toFixed(1)}%
          </div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <div className="font-medium dark:text-white">Pre-reversal Accuracy</div>
          <div className="text-2xl dark:text-white">{preReversalAccuracy}%</div>
        </div>
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <div className="font-medium dark:text-white">Post-reversal Accuracy</div>
          <div className="text-2xl dark:text-white">{postReversalAccuracy}%</div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-4 dark:text-white">Trial History</h4>
        <div className="max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Trial</TableHead>
                <TableHead>Your Choice</TableHead>
                <TableHead>Correct Button</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Rule Change?</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gameState.history.map((trial, index) => (
                <TableRow key={index}>
                  <TableCell>{trial.trial}</TableCell>
                  <TableCell>{trial.choice}</TableCell>
                  <TableCell>{trial.rewardingStimulus}</TableCell>
                  <TableCell>
                    {trial.won ? "✓ Won" : "✗ Lost"}
                  </TableCell>
                  <TableCell>
                    {trial.wasReversalTrial ? "Yes" : "No"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Button onClick={startGame} className="mt-4">Play Again</Button>
    </div>
  );
};

export default Results;