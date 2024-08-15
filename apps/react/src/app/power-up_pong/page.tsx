"use client";

// PongGame.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const socket = io(`http://${window.location.host}/power-up`, { path: "/ws/socket.io" });

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
	const [powerUpHeight, setPowerUpHeight] = useState<number>(0);

	const paddleWidth = 10;
	const paddleHeight = 100;
	const gameWidth = 400;
	const gameHeight = 400;
	const ballSize = 10;
	const borderWidth = 5;
	const shieldSVGString = '<svg viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#44e708"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.302 21.6149C11.5234 21.744 11.6341 21.8086 11.7903 21.8421C11.9116 21.8681 12.0884 21.8681 12.2097 21.8421C12.3659 21.8086 12.4766 21.744 12.698 21.6149C14.646 20.4784 20 16.9084 20 12V6.6C20 6.04207 20 5.7631 19.8926 5.55048C19.7974 5.36198 19.6487 5.21152 19.4613 5.11409C19.25 5.00419 18.9663 5.00084 18.3988 4.99413C15.4272 4.95899 13.7136 4.71361 12 3C10.2864 4.71361 8.57279 4.95899 5.6012 4.99413C5.03373 5.00084 4.74999 5.00419 4.53865 5.11409C4.35129 5.21152 4.20259 5.36198 4.10739 5.55048C4 5.7631 4 6.04207 4 6.6V12C4 16.9084 9.35396 20.4784 11.302 21.6149Z" stroke="#2af202" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';

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

			// if (Gamestate == "shield") {
			const svgBlob = new Blob([shieldSVGString], { type: 'image/svg+xml' });
			const url = URL.createObjectURL(svgBlob);
			console.log('url = ', url);
			const img = new Image();
			img.onload = () => {
				context.drawImage(img, (gameWidth - 30) / 2, powerUpHeight, 30, 30);
				URL.revokeObjectURL(url); // Clean up the object URL after use
			};
			img.src = url;
			// }
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

		socket.on('showPowerUp', (powerUpType: string, powerUpHeight: number) => {
			console.log('power ', powerUpType, ' is being shown');
			SetGameState("shield");
			setPowerUpHeight(powerUpHeight);
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
			socket.off('showPowerUp');
		};
	}, [ball, rightPaddle, leftPaddle, score, Gamestate, powerUpHeight]);

	const startGame = () => {
		SetGameState("playing");
		socket.emit('start');
	};

	const stopGame = () => {
		socket.emit('stop');
	};

	const turnOnPowerUp = () => {
		socket.emit('powerupOn');
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
