import React from "react";

const TimeStart = ({timeStart}:{timeStart: string}) => {
  return (
    <div className="flex justify-center">
      <div className="px-4 py-2 bg-[#2A4DD0] text-white rounded-lg shadow-md">
        <span className="font-bold text-lg">Start: </span>
        <span className="text-lg">{timeStart}</span>
      </div>
    </div>
  );
};

export default TimeStart;
