import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AiOutlineClose, AiOutlineCheckCircle } from "react-icons/ai";

const Game = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [draws, setDraws] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [gameStarted, setGameStarted] = useState(false);
  const [roundReady, setRoundReady] = useState(false);

  const X_COLOR = "text-blue-500";
  const O_COLOR = "text-red-500";

  const startNewGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setCountdown(3);
    setGameStarted(true);
    setRoundReady(false);
  };

  const checkWinner = (currentBoard) => {
    const winningCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (let combination of winningCombinations) {
      const [a, b, c] = combination;
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return currentBoard[a];
      }
    }

    return currentBoard.every(Boolean) ? "Tie" : null;
  };

  const updateWinner = (currentWinner) => {
    if (currentWinner === "X") {
      setPlayerScore((prev) => prev + 1);
    } else if (currentWinner === "O") {
      setAiScore((prev) => prev + 1);
    } else if (currentWinner === "Tie") {
      setDraws((prev) => prev + 1);
    }
    setWinner(currentWinner);
    setRoundReady(true);
  };

  const handleClick = (index) => {
    if (
      board[index] ||
      winner ||
      countdown > 0 ||
      !gameStarted ||
      !roundReady ||
      !isPlayerTurn
    )
      return;

    const newBoard = [...board];
    newBoard[index] = "X";
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  const minimax = (newBoard, isMaximizing) => {
    const result = checkWinner(newBoard);
    if (result === "X") return -1;
    if (result === "O") return 1;
    if (result === "Tie") return 0;

    let bestScore = isMaximizing ? -Infinity : Infinity;
    const player = isMaximizing ? "O" : "X";

    for (let i = 0; i < newBoard.length; i++) {
      if (newBoard[i] === null) {
        newBoard[i] = player;
        const score = minimax(newBoard, !isMaximizing);
        newBoard[i] = null;
        bestScore = isMaximizing
          ? Math.max(score, bestScore)
          : Math.min(score, bestScore);
      }
    }
    return bestScore;
  };

  const computerMove = () => {
    const emptySquares = board
      .map((value, index) => (value === null ? index : null))
      .filter((value) => value !== null);

    let bestScore = -Infinity;
    let move;

    for (let i of emptySquares) {
      const newBoard = [...board];
      newBoard[i] = "O";
      const score = minimax(newBoard, false);
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }

    if (move !== undefined) {
      const newBoard = [...board];
      newBoard[move] = "O";
      setBoard(newBoard);
    }
    setIsPlayerTurn(true); // Ensure AI only plays once
  };

  useEffect(() => {
    if (!isPlayerTurn && !winner && countdown === 0 && roundReady) {
      // Trigger AI move only once
      const timer = setTimeout(() => {
        computerMove();
      }, 500);
      return () => clearTimeout(timer);
    }

    const currentWinner = checkWinner(board);
    if (currentWinner && !winner) {
      updateWinner(currentWinner);
    }
  }, [board, isPlayerTurn, countdown, roundReady, winner]);

  useEffect(() => {
    if (countdown > 0 && gameStarted) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }

    if (countdown === 0 && gameStarted && !roundReady) {
      setRoundReady(true);
    }
  }, [countdown, gameStarted, roundReady]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-5">Tic Tac Toe</h1>

      {/* Scoreboard */}
      <div className="flex justify-between items-center w-72 mb-5">
        <div className="text-lg">Player: {playerScore}</div>
        <div className="text-lg">AI: {aiScore}</div>
        <div className="text-lg">Draws: {draws}</div>
      </div>

      {/* Countdown or Play Again Button */}
      {!gameStarted ? (
        <button
          className="bg-blue-500 px-4 py-2 rounded mb-5"
          onClick={startNewGame}
        >
          Start Game
        </button>
      ) : countdown > 0 ? (
        <div className="text-4xl font-bold mb-5">Starting in {countdown}</div>
      ) : winner && roundReady ? (
        <div className="mt-4 text-center">
          <p className="text-lg">
            {winner === "Tie" ? "It's a Tie!" : `Winner: ${winner}`}
          </p>
          <button
            className="mt-2 bg-blue-500 px-4 py-2 rounded"
            onClick={startNewGame}
          >
            Start New Round
          </button>
        </div>
      ) : null}

      {/* Game Board */}
      {gameStarted && !winner && roundReady && (
        <div className="grid grid-cols-3 gap-3 w-72">
          {board.map((cell, index) => (
            <motion.div
              key={index}
              className={`w-20 h-20 flex items-center justify-center text-4xl font-bold cursor-pointer rounded-md ${
                cell === "X" ? X_COLOR : cell === "O" ? O_COLOR : ""
              } bg-gray-700`}
              onClick={() => handleClick(index)}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
            >
              {cell === "X" ? (
                <AiOutlineClose />
              ) : cell === "O" ? (
                <AiOutlineCheckCircle />
              ) : (
                ""
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Game;
