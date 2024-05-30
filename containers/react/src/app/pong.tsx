import React, { useState, useEffect, useRef } from 'react';

const PongGame = () => {
  const [ballPosition, setBallPosition] = useState({ x: 200, y: 100 });
  const [ballSpeed, setBallSpeed] = useState({ dx: 1, dy: 2 });
  const [leftPaddlePosition, setLeftPaddlePosition] = useState(150);
  const [rightPaddlePosition, setRightPaddlePosition] = useState(150);
  const [score, setScore] = useState(0);

  const gameWidth = 400;
  const gameHeight = 400;
  const paddleWidth = 10;
  const paddleHeight = 100;
  const paddleSpeed = 10;
  const ballSize = 100;
  const updateInterval = 10;

  const resetGame = () => {
    setBallPosition({ x: 200, y: 100 });
    setBallSpeed({ dx: 2, dy: 1 });
    setLeftPaddlePosition(150);
    setRightPaddlePosition(150);
  };

  const endGame = () => {
    alert(`Game Over! Your score is ${score}`);
    setScore(0);
    resetGame();
  }

  const update = () => {
    setBallPosition(prevPosition => {
      const newX = prevPosition.x + ballSpeed.dx;
      const newY = prevPosition.y + ballSpeed.dy;

      // Check collision with right paddle
      const checkColissionRightWall = (newX: number) => {
        return (newX > gameWidth - paddleWidth - ballSize)
      }
      const checkColissionLeftWall = (newX: number) => {
        return (newX < paddleWidth)
      }
      const checkColissionTopWall = (newY: number) => {
        return (newY < 0)
      }
      const checkColissionBottomWall = (newY: number) => {
        return (newY > gameHeight - ballSize)
      }
      const checkColissionLeftPaddle = (newY: number) => {
        return (newY > leftPaddlePosition && newY < leftPaddlePosition + paddleHeight)
      }
      const checkColissionRightPaddle = (newY: number) => {
        return (newY > rightPaddlePosition && newY < rightPaddlePosition + paddleHeight)
      }
      if (checkColissionRightWall(newX))
      {
        if (checkColissionRightPaddle(newY))
          {
            console.log('Collision with right paddle')
            console.log(`oldspeed: ${ballSpeed.dx}, ${ballSpeed.dy}`)
            setBallSpeed(prevBasllSpeed => ({dx : prevBasllSpeed.dx * -1, dy : prevBasllSpeed.dy}))
            // setBallSpeed({dx : -2, dy : 1});
            console.log(`newspeed: ${ballSpeed.dx}, ${ballSpeed.dy}`)
        }
        else
        {
          alert(`Game Over! Your score is ${score}`);
          setScore(prevScore => prevScore + 1);
          resetGame();
        }
      }
      // Check collision with left paddle
      if (newX < paddleWidth)
        {
          if (newY > leftPaddlePosition && newY < leftPaddlePosition + paddleHeight)
            setBallSpeed({dx : -1, dy : 1});
          else
          {
            alert(`Game Over! Your score is ${score}`);
            setScore(prevScore => prevScore - 1);
            resetGame();
          }
        }
      // Check collision with walls
      if (newY > gameHeight - ballSize)
          setBallSpeed({dx : 2, dy : -1});
      if (newY < 0)
          setBallSpeed({dx : 2, dy : 1});
          // setBallSpeed(prevBasllSpeed => ({dx : prevBasllSpeed.dx, dy : prevBasllSpeed.dy * -1}));

      // // Check if ball missed the paddles
      // if (newX < 0 || newX > gameWidth - ballSize) {
      //   setScore(prevScore => prevScore + 1);
      //   alert(`Game Over! Your score is ${score}`);
      //   resetGame();
      //   return { x: 200, y: 100 };
      // }

      return { x: newX, y: newY };
    });
  };

  const handleKeyDown = (event) => {
    switch (event.key) {
      case 'ArrowUp':
        setRightPaddlePosition(prevPosition =>
          Math.max(0, prevPosition - paddleSpeed)
        );
        event.preventDefault();
        break;
      case 'ArrowDown':
        setRightPaddlePosition(prevPosition =>
          Math.min(gameHeight - paddleHeight, prevPosition + paddleSpeed)
        );
        event.preventDefault();
        break;
      case 'w':
        setLeftPaddlePosition(prevPosition =>
          Math.max(0, prevPosition - paddleSpeed)
        );
        event.preventDefault();
        break;
      case 's':
        setLeftPaddlePosition(prevPosition =>
          Math.min(gameHeight - paddleHeight, prevPosition + paddleSpeed)
        );
        event.preventDefault();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const gameLoop = setInterval(update, updateInterval);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(gameLoop);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [ballPosition, leftPaddlePosition, rightPaddlePosition, score]);

  return (
    <div style={{ position: 'relative', width: '400px', height: '200px', border: '1px solid black' }}>
      <div
        style={{
          position: 'absolute',
          left: `${ballPosition.x}px`,
          top: `${ballPosition.y}px`,
          width: '10px',
          height: '10px',
          backgroundColor: 'white',
          borderRadius: '50%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '10px',
          top: `${leftPaddlePosition}px`,
          width: '10px',
          height: '100px',
          backgroundColor: 'white',
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: '10px',
          top: `${rightPaddlePosition}px`,
          width: '10px',
          height: '100px',
          backgroundColor: 'white',
        }}
      />
      <p>Use W/S for left paddle and Arrow Up/Down for right paddle. Score: {score}</p>
    </div>
  );
};

export default PongGame;