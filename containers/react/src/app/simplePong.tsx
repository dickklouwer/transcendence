import React, { useState, useEffect, useRef } from 'react';

const PongGame = () => {
  const [ballPosition, setBallPosition] = useState({ x: 200, y: 200 });
  const [ballSpeed, setBallSpeed] = useState({ dx: 2, dy: 0 });
  const [rightPaddlePosition, setRightPaddlePosition] = useState(150);
  const [leftPaddlePosition, setLeftPaddlePosition] = useState(150);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ballSpeedRef = useRef(ballSpeed);
  const scoreRef = useRef({ leftPlayer: 0, rightPlayer: 0 });
  // const ballSpeed = ballSpeedRef.current;
  const score = scoreRef.current;
  const paddleWidth = 10;
  const paddleHeight = 100;
  const gameWidth = 400;
  const gameHeight = 400;
  const ballSize = 10;
  const borderWidth = 5;
  const updateInterval = 10;
  const paddleSpeed = 10;
  // const leftPaddlePosition = 150;

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

  const resetGame = () => {
    setBallPosition({ x: 200, y: 100 });
    setBallSpeed({ dx: 2, dy: 1 });
    ballSpeed.dx = 2;
    ballSpeed.dy = 1;
    setRightPaddlePosition(150);
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
          }
        }
        if (checkCollisionRightPaddleX(newX)) {
          console.log(`new x ${newX}, new y ${newY}. right paddle x border${gameWidth - (paddleWidth + ballSize)}, right paddle upper y ${rightPaddlePosition} right paddle lower y ${rightPaddlePosition + paddleHeight}`, )
          console.log(`${newY > leftPaddlePosition && newY < leftPaddlePosition + paddleHeight}`)
          if (checkCollisionRightPaddleY(newY)) {
            ballSpeed.dx = -ballSpeed.dx;
          }
        }
        if (checkCollisionLeftWall(newX)) {
          // console.log('Collision with right wall');
          score.rightPlayer = score.rightPlayer + 1;
          resetGame();
        }
        if (checkCollisionRightWall(newX)) {
          // console.log('Collision with right wall');
          score.leftPlayer = score.leftPlayer + 1;
          resetGame();
        }
        return { x: newX, y: newY };
      });
    };
    
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          setRightPaddlePosition(prevPosition => Math.max(0, prevPosition - paddleSpeed));
          break;
        case 'ArrowDown':
          setRightPaddlePosition(prevPosition => Math.min(gameHeight - paddleHeight, prevPosition + paddleSpeed));
          break;
        default:
          break;
      }
    };

    const gameLoop = setInterval(update, updateInterval);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(gameLoop);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [rightPaddlePosition]);

  useEffect(() => {
    draw();
  }, [ballPosition, rightPaddlePosition]);

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

    // setLeftPaddlePosition(prevPosition => {
    //   if (ballPosition.y > (prevPosition + paddleHeight / 2)) {
    //     return Math.min(gameHeight - paddleHeight, prevPosition + paddleSpeed / 2);
    //   } else if (ballPosition.y < (prevPosition - (paddleHeight / 2))) {
    //     return Math.max(0, prevPosition - paddleSpeed / 2);
    //   }
    //   else {
    //     return prevPosition;
    //   }
    // });