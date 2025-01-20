import { Button } from "../ui/button";

const StartGame = ({ onStart }) => {
  return (
    <div className="space-y-4">
      <p>In this task, you will choose between five options (1-5) over 20 trials.</p>
      <p>The rewarding button may change during the game - try to find and stick to the most rewarding option!</p>
      <Button onClick={onStart}>Start Game</Button>
    </div>
  );
};

export default StartGame