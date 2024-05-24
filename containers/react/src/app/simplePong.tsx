import React, { useState, useEffect, useRef } from 'react';

const PongGame = () => {
  const [ballPosition, setBallPosition] = useState({ x: 200, y: 200 });
  const [leftPaddlePosition, setLeftPaddlePosition] = useState(150);
  const [rightPaddlePosition, setRightPaddlePosition] = useState(150);

  const ballSpeed = { dx: 2, dy: 2 };
  const score = {leftPlayer: 0, rightPlayer: 0}
  const ballSpeedRef = useRef(ballSpeed); // find out how useRef works
  const paddleWidth = 10;
  const paddleHeight = 100;
  const gameWidth = 400;
  const gameHeight = 400;
  const ballSize = 10;
  const borderWidth = 5;
  const updateInterval = 10;

  useEffect(() => {
    ballSpeedRef.current = ballSpeed;
  }, []);

  const resetGame = () => {
    setBallPosition({ x: 200, y: 100 });
    ballSpeed.dx = 2;
	ballSpeed.dy = 1;
    setLeftPaddlePosition(150);
    setRightPaddlePosition(150);
  };

  const update = () => {
    setBallPosition(prevPosition => {
      let newX = prevPosition.x + ballSpeedRef.current.dx;
      let newY = prevPosition.y + ballSpeedRef.current.dy;

      const checkCollisionTopWall = (newY: number) => newY < 0;
      const checkCollisionBottomWall = (newY: number) => newY > gameHeight - ballSize - borderWidth;
      const checkCollisionLeftWall = (newX: number) => newX < 0;
      const checkCollisionRightWall = (newX: number) => newX > gameWidth - ballSize;
	  const checkCollisionLeftPaddleX = (newY: number) => newX < paddleWidth + ballSize;
	  const checkCollisionRightPaddleX = (newY: number) => newX > gameWidth - (paddleWidth + ballSize) - ballSize;
	  const checkCollisionLeftPaddleY = (newY: number) => newY > leftPaddlePosition && newY < leftPaddlePosition + paddleHeight;
	  const checkCollisionRightPaddleY = (newY: number) => newY > rightPaddlePosition && newY < rightPaddlePosition + paddleHeight;

      if (checkCollisionBottomWall(newY) || checkCollisionTopWall(newY)) {
		ballSpeed.dy = -ballSpeed.dy;
      }
	  if (checkCollisionLeftPaddleX(newX)) {
		if (checkCollisionLeftPaddleY(newY)) {
			ballSpeed.dx = -ballSpeed.dx;
		}
	  }
	  if (checkCollisionRightPaddleX(newX)) {
		if (checkCollisionRightPaddleY(newY)) {
			ballSpeed.dx = -ballSpeed.dx;
		}
	}
      if (checkCollisionLeftWall(newX)){
		score.rightPlayer = score.rightPlayer + 1;
		alert(`You lost the point! Your score is ${score}`);
		resetGame();
	}
	if (checkCollisionRightWall(newX)){
		score.leftPlayer = score.leftPlayer + 1;
		alert(`You won the point! Your score is ${score}`);
		resetGame();
      }
      return { x: newX, y: newY };
    });
  };

  useEffect(() => {
    const gameLoop = setInterval(update, updateInterval);
    return () => {
      clearInterval(gameLoop);
    };
  }, []);
  return (
    <div style={{ position: 'relative', width: '400px', height: '400px', borderTop: `${borderWidth}px solid white`, borderBottom: `${borderWidth}px solid white`, boxSizing: 'border-box' }}>
      <div
        style={{
          position: 'absolute',
          left: `${ballPosition.x}px`,
          top: `${ballPosition.y}px`,
          width: `${ballSize}px`,
          height: `${ballSize}px`,
          backgroundColor: 'white',
          borderRadius: '50%',
        }}
      />
	  <div
        style={{
          position: 'absolute',
          left: '10px',
          top: `${leftPaddlePosition}px`,
          width: `${paddleWidth}px`,
          height: `${paddleHeight}px`,
          backgroundColor: 'white',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '10px',
          top: `${rightPaddlePosition}px`,
          width: `${paddleWidth}px`,
          height: `${paddleHeight}px`,
          backgroundColor: 'white',
        }}
      />
    </div>
);
};

export default PongGame;

