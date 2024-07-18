"use client";

// PongGame.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(`http://${window.location.host}`, {path: "/api/socket.io"});

export default function PongGame() {
	const canvasRef = useRef(null);
	const [rightPaddle, setRightPaddle] = useState({ y: 150 });
	const [leftPaddle, setLeftPaddle] = useState({ y: 150 });
	const [ball, setBall] = useState({ x: 200, y: 200 });

	const paddleWidth = 10;
	const paddleHeight = 100;
	const gameWidth = 400;
	const gameHeight = 400;
	const ballSize = 10;
	const borderWidth = 5;
	// const leftPaddle: number = 150;


	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');

		const drawGame = (context, rightPaddle, ball) => {
			context.clearRect(0, 0, gameWidth, gameHeight);

			// Draw ball
			context.fillStyle = 'white';
			context.beginPath();
			context.arc(ball.x, ball.y, ballSize / 2, 0, Math.PI * 2);
			context.fill();

			// Draw left paddle (static position for now)
			context.fillStyle = 'white';
			context.fillRect(10, leftPaddle, paddleWidth, paddleHeight);

			// Draw right paddle
			context.fillStyle = 'white';
			context.fillRect(gameWidth - paddleWidth - 10, rightPaddle, paddleWidth, paddleHeight);
		};

		socket.on('rightPaddle', (paddle) => {
			setRightPaddle(paddle);
			console.log('rightPaddle', rightPaddle);
		});

		socket.on('leftPaddle', (paddle) => {
			setLeftPaddle(paddle);
			console.log('rightPaddle', rightPaddle);
		});

		socket.on('ball', (ball) => {
			setBall(ball);
			drawGame(context, rightPaddle, ball);
		});

		const handleKeyDown = (event) => {
			if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
				event.preventDefault(); // Prevent default scrolling behavior
			}
			if (event.key === 'ArrowUp') {
				socket.emit('movement', 'ArrowUp');
			}
			if (event.key === 'ArrowDown') {
				socket.emit('movement', 'ArrowDown');
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			socket.off('paddle');
			socket.off('ball');
		};
	}, [rightPaddle]);

	const startGame = () => {
		socket.emit('start');
	};

	const stopGame = () => {
		socket.emit('stop');
	};


	return (
		<>
			<div style={{ display: 'flex', justifyContent: 'space-between' }}>
				<button onClick={startGame}>Start</button>
				<button onClick={stopGame}>Stop</button>
			</div>
			<canvas
				ref={canvasRef}
				width={gameWidth}
				height={gameHeight}
				style={{ border: `${borderWidth}px solid white` }}
			/>
			<div>
				<h1>Pong Game</h1>
			</div>
		</>
	);
}