import React, { useState, useEffect, useRef } from 'react';

const PongGame = ({ gameType }) => {
  const [ballPosition, setBallPosition] = useState({ x: 200, y: 200 });
  const [ballSpeed, setBallSpeed] = useState({ dx: 2, dy: 0 });
  const [rightPaddlePosition, setRightPaddlePosition] = useState(150);
  const [leftPaddlePosition, setLeftPaddlePosition] = useState(150);
  const [score, setScore] = useState({ leftPlayer: 0, rightPlayer: 0 });
  const [keysPressed, setKeysPressed] = useState({});
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ballSpeedRef = useRef(ballSpeed);
  const paddleWidth = 10;
  const paddleHeight = 100;
  const gameWidth = 400;
  const gameHeight = 400;
  const ballSize = 10;
  const borderWidth = 5;
  const updateInterval = 10;
  const paddleSpeed = 4;

  const draw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Draw ball
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(ballPosition.x, ballPosition.y, ballSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw left paddle
    ctx.fillStyle = 'white';
    ctx.fillRect(10, leftPaddlePosition, paddleWidth, paddleHeight);

    // Draw right paddle
    ctx.fillStyle = 'white';
    ctx.fillRect(gameWidth - paddleWidth - 10, rightPaddlePosition, paddleWidth, paddleHeight);
  };

  const changeBallDirectionRight = () => {
    const diff = ballPosition.y - (rightPaddlePosition + paddleHeight / 2);
    ballSpeed.dy = diff / 20;
  };

  const changeBallDirectionLeft = () => {
    const diff = ballPosition.y - (leftPaddlePosition + paddleHeight / 2);
    ballSpeed.dy = diff / 20;
  };

  const resetGame = () => {
    setBallPosition({ x: 200, y: 100 });
    ballSpeed.dx = 2;
    ballSpeed.dy = 1;
    setRightPaddlePosition(150);
    setLeftPaddlePosition(150);
  };

  useEffect(() => {
    const update = () => {
      setBallPosition(prevPosition => {
        let newX = prevPosition.x + ballSpeedRef.current.dx;
        let newY = prevPosition.y + ballSpeedRef.current.dy;

        const checkCollisionTopWall = (newY: number) => newY < borderWidth;
        const checkCollisionBottomWall = (newY: number) => newY > gameHeight;
        const checkCollisionLeftWall = (newX: number) => newX < 0;
        const checkCollisionRightWall = (newX: number) => newX > gameWidth - ballSize;
        const checkCollisionLeftPaddleX = (newX: number) => newX < paddleWidth + ballSize;
        const checkCollisionRightPaddleX = (newX: number) => newX > gameWidth - (paddleWidth + ballSize);
        const checkCollisionLeftPaddleY = (newY: number) => newY > leftPaddlePosition && newY < leftPaddlePosition + paddleHeight;
        const checkCollisionRightPaddleY = (newY: number) => newY > rightPaddlePosition && newY < rightPaddlePosition + paddleHeight;

        if (checkCollisionBottomWall(newY) || checkCollisionTopWall(newY)) {
          ballSpeedRef.current.dy = -ballSpeedRef.current.dy;
        }
        if (checkCollisionLeftPaddleX(newX)) {
          if (checkCollisionLeftPaddleY(newY)) {
            ballSpeed.dx = -ballSpeed.dx;
            changeBallDirectionLeft();
          }
        }
        if (checkCollisionRightPaddleX(newX)) {
          if (checkCollisionRightPaddleY(newY)) {
            ballSpeed.dx = -ballSpeed.dx;
            changeBallDirectionRight();
          }
        }
        if (checkCollisionLeftWall(newX)) {
          setScore(score => ({ ...score, rightPlayer: score.rightPlayer + 1 }));
          resetGame();
        }
        if (checkCollisionRightWall(newX)) {
          setScore(score => ({ ...score, leftPlayer: score.leftPlayer + 1 }));
          resetGame();
        }
        return { x: newX, y: newY };
      });

      if (gameType === "single") {
        if (ballPosition.y > (leftPaddlePosition + paddleHeight)) {
          setLeftPaddlePosition(prevPosition => Math.min(gameHeight - paddleHeight, prevPosition + paddleSpeed));
        } else if (ballPosition.y < leftPaddlePosition) {
          setLeftPaddlePosition(prevPosition => Math.max(0, prevPosition - paddleSpeed));
        }
      }

      if (gameType === "multi") {
        setLeftPaddlePosition(prevPosition => {
          if (keysPressed['w']) {
            return Math.max(0, prevPosition - paddleSpeed);
          } else if (keysPressed['s']) {
            return Math.min(gameHeight - paddleHeight, prevPosition + paddleSpeed);
          }
          return prevPosition;
        });
      }

      setRightPaddlePosition(prevPosition => {
        if (keysPressed['ArrowUp']) {
          return Math.max(0, prevPosition - paddleSpeed);
        } else if (keysPressed['ArrowDown']) {
          return Math.min(gameHeight - paddleHeight, prevPosition + paddleSpeed);
        }
        return prevPosition;
      });

    };

    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed(prevKeys => ({ ...prevKeys, [event.key]: true }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed(prevKeys => ({ ...prevKeys, [event.key]: false }));
    };

    const gameLoop = setInterval(update, updateInterval);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      clearInterval(gameLoop);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [rightPaddlePosition, leftPaddlePosition, keysPressed, ballPosition, score]);

  useEffect(() => {
    draw();
  }, [ballPosition, rightPaddlePosition, leftPaddlePosition, score]);

  return (
    <>
      <h1>Score: {score.leftPlayer}-{score.rightPlayer}</h1>
      <canvas
        ref={canvasRef}
        width={gameWidth}
        height={gameHeight}
        style={{ border: `${borderWidth}px solid white` }}
      />
    </>
  );
};

export default PongGame;