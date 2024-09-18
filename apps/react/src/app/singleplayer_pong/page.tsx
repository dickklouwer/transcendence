"use client";

// PongGame.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(`http://${process.env.NEXT_PUBLIC_HOST_NAME}/singleplayer`, { path: "/ws/socket.io" });

interface Ball {
	x: number;
	y: number;
}

interface Score {
	left: number;
	right: number;
}

export default function PongGame() {
	const canvasRef = useRef<HTMLCanvasElement>();
	const [rightPaddle, setRightPaddle] = useState(150);
	const [leftPaddle, setLeftPaddle] = useState(150);
	const [score, setScore] = useState<Score>({ left: 0, right: 0 });
	const [ball, setBall] = useState<Ball>({ x: 200, y: 200 });
	const [Gamestate, SetGameState] = useState("playing");
	
	const paddleWidth = 10;
	const paddleHeight = 100;
	const gameWidth = 400;
	const gameHeight = 400;
	const ballSize = 10;
	const borderWidth = 5;

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas!.getContext('2d');
		
		const drawGame = (context) => {
			context.clearRect(0, 0, gameWidth, gameHeight);

			// Draw ball
			context.fillStyle = 'white';
			context.beginPath();
			context.arc(ball.x, ball.y, ballSize / 2, 0, Math.PI * 2);
			context.fill();

			// Draw left paddle
			context.fillStyle = 'white';
			context.fillRect(10, leftPaddle, paddleWidth, paddleHeight);

			// Draw right paddle
			context.fillStyle = 'white';
			context.fillRect(gameWidth - paddleWidth - 10, rightPaddle, paddleWidth, paddleHeight);
		};

		socket.on('rightPaddle', (paddle: number) => {
			setRightPaddle(paddle);
		});

		socket.on('leftPaddle', (paddle: number) => {
			setLeftPaddle(paddle);
		});

		socket.on('ball', (ball: Ball) => {
			setBall(ball);
			drawGame(context);
		});

		socket.on('score', (score: Score) => {
			setScore(score);
		});

		socket.on('gameover', () => {
			SetGameState("GameOver");
			socket.emit('stop');
		});

		socket.on('playersReady', () => {
			SetGameState("playing");
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
			socket.off('leftPaddle');
			socket.off('rightPaddle');
			socket.off('ball');
			socket.off('score');
			socket.off('gameover');
			socket.off('playersReady');
		};
	}, [ball, rightPaddle, leftPaddle, score]);

	const startGame = () => {
		SetGameState("playing");
		socket.emit('start');
	};

	const stopGame = () => {
		socket.emit('stop');
	};

	const GameStateComponent = () => (
		<>
			<h1 style={{ fontSize: '2.5rem' }}>Pong Game</h1>
			{Gamestate == "GameOver" && (
				<div style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0, 0, 0, 0.5)',
					color: 'white',
					display: 'flex',
					flexDirection: 'column', // Change to column to stack children vertically
					justifyContent: 'center',
					alignItems: 'center',
					fontSize: '2rem'
				}}>
					<div>Game Over!</div>
					<button className="bg-blue-500 text-white font-bold py-1 px-2 rounded mt-5 text-sm" onClick={startGame}>
						New Game
					</button>
				</div>
			)}
		</>
	);

	return (
		<div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl w-full">
			<div className="flex items-center justify-center mb-6">
				<GameStateComponent />
			</div>
			<div className="flex flex-col items-center justify-center mb-6">
				<h1>Score</h1>
				<h1 style={{ marginTop: '-5px' }}> {score.left} - {score.right} </h1>
			</div>
			<div className="flex items-center justify-center">
				<div style={{ marginRight: '20px', fontSize: '1.5rem', color: 'white' }}>Computer</div>
				<canvas
					ref={canvasRef}
					width={gameWidth}
					height={gameHeight}
					style={{ border: `${borderWidth}px solid white` }}
				/>
				<div style={{ marginLeft: '20px', fontSize: '1.5rem', color: 'white' }}>Player</div>
			</div>
			<div className="flex items-center justify-center mb-6">
				<div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-around', width: '100%' }}>
					<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={startGame}>
						Start
					</button>
					<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={stopGame}>
						Stop
					</button>
				</div>
			</div>
		</div>
	);
}
