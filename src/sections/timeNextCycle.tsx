import { formatTime } from "@/helper/formatTime";
import React from "react";
//
const TimeNextCycle = ({timeLeft}:{timeLeft: number}) => {
  return (
    <div className="countdown text-center mt-4">
      {timeLeft > 0 ? (
        <span>Next cycle in: {formatTime(timeLeft)}</span>
      ) : (
        <span>Next cycle endded!</span>
      )}
    </div>
  );
};

export default TimeNextCycle;
