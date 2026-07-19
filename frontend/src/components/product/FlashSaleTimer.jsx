import React, { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export default function FlashSaleTimer({ endDate }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endDate) - new Date();
      if (difference <= 0) {
        return { hours: 0, minutes: 0, seconds: 0 };
      }
      return {
        hours: Math.floor(difference / (1000 * 60 * 60)),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const formatNumber = (num) => String(num).padStart(2, '0');

  if (timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
      <Timer size={18} />
      <span className="font-semibold text-sm">Flash Sale Ends In:</span>
      <div className="flex items-center gap-1 font-mono font-bold">
        <span className="bg-red-600 text-white px-2 py-1 rounded">{formatNumber(timeLeft.hours)}</span>
        <span>:</span>
        <span className="bg-red-600 text-white px-2 py-1 rounded">{formatNumber(timeLeft.minutes)}</span>
        <span>:</span>
        <span className="bg-red-600 text-white px-2 py-1 rounded">{formatNumber(timeLeft.seconds)}</span>
      </div>
    </div>
  );
}
