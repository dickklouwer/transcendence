// PongGame.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4242'); // Pas de URL aan naar je backend URL

const PongGame = () => { // something wrong with event listeners and movement
  const [keysPressed, setKeysPressed] = useState({});
  const [rightPaddlePosition, setRightPaddlePosition] = useState(150);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const paddleWidth = 10;
  const paddleHeight = 100;
  const gameWidth = 400;
  const gameHeight = 400;
  const ballSize = 10;
  const borderWidth = 5;
  const ballPosition = { x: 200, y: 200 };
  const leftPaddlePosition = 150;
  // const rightPaddlePosition = 150;
  const score = { leftPlayer: 0, rightPlayer: 0 };

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

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to server');
    });
    
    socket.on('movement', (movement) => {
      if (movement === 'ArrowUp') {
        setRightPaddlePosition((prevPosition) => Math.max(0, prevPosition - 1));
        console.log('ArrowUp');
      }
      if (movement === 'ArrowDown') {
        setRightPaddlePosition((prevPosition) => Math.min(gameHeight - paddleHeight, prevPosition + 1));
        console.log('ArrowDown');
      }
    });

    draw(); // drawing the initial state

    // Movement and communication with the server
    if (keysPressed['ArrowUp']) {
      socket.emit('movement','ArrowUp');
    }
    if (keysPressed['ArrowDown']) {
      socket.emit('movement','ArrowDown');
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      setKeysPressed(prevKeys => ({ ...prevKeys, [event.key]: true }));
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      setKeysPressed(prevKeys => ({ ...prevKeys, [event.key]: false }));
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);


    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      socket.off('connect');
      socket.off('message');
    };
}, [rightPaddlePosition, keysPressed]);

  const sendMessage = () => {
    socket.emit('message', 'Hello from client');
  };
  
  return (
    <>
    <h1>Score: {score.leftPlayer}-{score.rightPlayer}</h1>
    <canvas
    ref={canvasRef}
    width={gameWidth}
    height={gameHeight}
    style={{ border: `${borderWidth}px solid white` }}
  />
    <div>
      <h1>Pong Game</h1>
      <button onClick={sendMessage}>Send Message</button>
    </div>
    </>
  );
};

export default PongGame;