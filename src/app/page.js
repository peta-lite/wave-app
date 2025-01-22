'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";

const randomArray = (length) => Array.from({ length }, () => Math.floor(Math.random() * 11) * 10);

const targets = [
  randomArray(3),
  randomArray(3),
  randomArray(3),
];

export default function WavePuzzle() {
  const canvasRef = useRef(null);
  const [wave1, setWave1] = useState(50);
  const [wave2, setWave2] = useState(50);
  const [wave3, setWave3] = useState(50);
  const [currentTarget, setCurrentTarget] = useState(0);
  const [isCleared, setIsCleared] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  const targetAmplitudes = targets[currentTarget];

  const drawWave = (ctx, amplitudes, color) => {
    ctx.beginPath();
    for (let x = 0; x <= 600; x++) {
      const t = (x / 600) * 2 * Math.PI;
      const y = amplitudes.reduce(
          (sum, amp, i) => sum + amp * Math.sin((i + 1) * t),
          0
      ) / 3;
      ctx.lineTo(x, 100 - y);
    }
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, 600, 200);
      drawWave(ctx, targetAmplitudes, 'red');
      drawWave(ctx, [wave1, wave2, wave3], 'blue');
    }
  }, [wave1, wave2, wave3, targetAmplitudes]);

  useEffect(() => {
    if (timeLeft > 0 && !isCleared) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, isCleared]);

  const checkMatch = () => {
    const isMatch = targetAmplitudes.every(
        (target, i) => Math.abs(target - [wave1, wave2, wave3][i]) < 5
    );
    if (isMatch) {
      if (currentTarget + 1 < targets.length) {
        toast.success('Correct! Next level!');
        setCurrentTarget(currentTarget + 1);
      } else {
        setIsCleared(true);
      }
    } else {
      toast.error('Not quite right. Try again!');
    }
  };

  return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-800 text-white">
        <h1 className="text-4xl font-bold mb-6 text-center text-yellow-300 drop-shadow-lg">
          Wave Synthesis Puzzle
        </h1>

        {isCleared ? (
            <div>
              <h2 className="text-3xl font-bold mb-4">You cleared all levels! 🎉</h2>
              <p className="text-xl">Final Score: {timeLeft}</p>
            </div>
        ) : (
            <>
              <div className="text-lg font-bold text-yellow-400 mb-4">
                Time Left: {timeLeft}s
              </div>
              <canvas
                  ref={canvasRef}
                  width="600"
                  height="200"
                  className="border-4 border-red-500 bg-gray-700 rounded-lg shadow-md mb-4"
              ></canvas>

              <div className="w-full max-w-md space-y-4">
                {[wave1, wave2, wave3].map((wave, index) => (
                    <div key={index}>
                      <label
                          htmlFor={`wave${index + 1}`}
                          className="block mb-2"
                      >{`Wave ${index + 1} Amplitude`}</label>
                      <input
                          id={`wave${index + 1}`}
                          type="range"
                          min="0"
                          max="100"
                          step="10"
                          value={wave}
                          onChange={(e) =>
                              [setWave1, setWave2, setWave3][index](
                                  Number(e.target.value)
                              )
                          }
                          className="w-full"
                      />
                      <p className="text-center mt-1">{wave}</p>
                    </div>
                ))}
              </div>

              <button
                  onClick={checkMatch}
                  className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-lg transform hover:scale-105 transition-transform"
              >
                Check Match
              </button>
            </>
        )}
      </div>
  );
}