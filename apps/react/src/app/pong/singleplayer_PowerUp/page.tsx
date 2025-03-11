"use client";

// PongGame.js
import { GameManager } from './gameManager';

import React, { useEffect, useState, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

const paddleWidth = 10;
const paddleHeight = 100;
const gameWidth = 400;
const gameHeight = 400;
const ballSize = 10;
const borderWidth = 5;

const socket = io(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/power-up`, {
	path: "/ws/socket.io",
	autoConnect: false, // Prevent automatic connection
});

const ScoreBoard = ({ score }: { score: [number, number] }): JSX.Element => {
    return (
        <div
            style={{
                display: "flex",
                fontSize: "24px",
                justifyContent: "center"
            }}
        >
            <span>{score[0]}</span> - <span>{score[1]}</span>
        </div>
    );
};


export default function PongGame() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const gameManagerRef = useRef<GameManager | null>(null); // Use useRef instead of useState for GameManager
	const [score, setScore] = useState<[number, number]>([0, 0]);
	const [gameState, setGameState] = useState<string>("Playing");
	// const [socket, setSocket] = useState<Socket | null>(null);

	// useEffect(() => {
	// 	// Connect to socket.io server only once when the component mounts
	// 	const newSocket = io(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/power-up`, { path: "/ws/socket.io" });
	// 	setSocket(newSocket);

	// 	// Clean up when the component unmounts
	// 	return () => {
	// 		console.log("Disconnecting socket");
	// 		newSocket.disconnect();
	// 	};
	// }, []); // Empty dependency array ensures this effect runs only once

	useEffect(() => {
		socket.connect();
		return () => {
			socket.disconnect(); // Clean up connection on unmount
		};
	}, []);


	useEffect(() => {
		if (!socket) return; // Ensure socket is initialized before proceeding
		if (canvasRef.current === null) return;
		const context = canvasRef.current.getContext("2d");
		if (context === null) return;

		if (!gameManagerRef.current) { // Create GameManager only if it doesn't exist
			gameManagerRef.current = new GameManager(context, socket, gameWidth, gameHeight, paddleWidth, paddleHeight, ballSize);
		}
		const manager = gameManagerRef.current; // Use the ref's current value

		const handleStartSetup = ({ball, leftPaddle, rightPaddle, score }: { ball: { x: number, y: number }, leftPaddle: number, rightPaddle: number, score: {left: number, right: number} }) => {
			manager.updateBallPosition(ball.x, ball.y);
			manager.updatePaddlePosition('left', leftPaddle);
			manager.updatePaddlePosition('right', rightPaddle);
			setScore([score.left, score.right]);
		};

		const handleGameUpdate = ({ball, leftPaddle, rightPaddle }: { ball: { x: number, y: number }, leftPaddle: number, rightPaddle: number }) => {
			manager.updateBallPosition(ball.x, ball.y);
			manager.updatePaddlePosition('left', leftPaddle);
			manager.updatePaddlePosition('right', rightPaddle);
		};

		const handleShowPowerUp = ({ powerUpType, powerUpHeight }: { powerUpType: number, powerUpHeight: number }) => {
			manager.updatePowerUpHeight(powerUpHeight);
			manager.showPowerUp(powerUpType);
			console.log("show power up");
		};

		const handlePowerUpHit = (powerUpType: string) => {
			manager.showPowerUp(0);
			console.log("power up hit");
		};

		const handleEnlargePaddle = (paddle: number) => {
			if (paddle === 1)
				manager.leftPaddle.updateHeight(150);
			else
				manager.rightPaddle.updateHeight(150);
		};

		const handleScore = ({left, right}: {left: number, right: number}) => {
			setScore([left, right]);
		};

		const handleReset = () => {
			manager.resetGame();
		};

		const handleGameover = () => {
			setGameState("GameOver");
			socket.emit('stop');
		};

		socket.on('startSetup', handleStartSetup);
		socket.on('gameUpdate', handleGameUpdate);
		socket.on('showPowerUp', handleShowPowerUp);
		socket.on('powerUpHit', handlePowerUpHit);
		socket.on('enlargePaddle', handleEnlargePaddle);
		socket.on('score', handleScore);
		socket.on('reset', handleReset);
		socket.on('gameover', handleGameover);

		manager.attachListeners();

		return () => {
			console.log("Removing socket listeners and game listeners");
			socket.off('startSetup', handleStartSetup);
			socket.off('gameUpdate', handleGameUpdate);
			socket.off('showPowerUp', handleShowPowerUp);
			socket.off('powerUpHit', handlePowerUpHit);
			socket.off('enlargePaddle', handleEnlargePaddle);
			socket.off('score', handleScore);
			socket.off('reset', handleReset);
			socket.off('gameover', handleGameover);
			manager.removeListeners();
		};
	}, [canvasRef, socket]); // Removed gameManager from dependency array

	const startGame = () => {
		setGameState("Playing");
		if (gameManagerRef.current) { // Access GameManager through ref
			gameManagerRef.current.startGame();
			socket?.emit('start'); // Use optional chaining in case socket is null
		}
	};

	// const stopGame = () => {
	// 	socket?.emit('stop'); // Use optional chaining in case socket is null
	// };

	return (
		<div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl w-full">
			<div className="flex items-center justify-center mb-6">
				{gameState === "GameOver" && (
					<div style={{
						position: 'absolute',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						backgroundColor: 'rgba(0, 0, 0, 0.5)',
						color: 'white',
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						fontSize: '2rem'
					}}>
						<div>Game Over!</div>
						<button className="bg-blue-500 text-white font-bold py-1 px-2 rounded mt-5 text-sm" onClick={startGame}>
							New Game
						</button>
						<button className="bg-blue-500 text-white font-bold py-1 px-2 rounded mt-5 text-sm">
							<a href="/pong_menu">Back to Pong Menu</a>
						</button>
					</div>
				)}
			</div>
			<ScoreBoard score={score} />
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
					<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
						<a href="/pong_menu">Leave</a>
					</button>
					{/* <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={stopGame}>
						Stop
					</button> */}
				</div>
			</div>
		</div>
	);
}