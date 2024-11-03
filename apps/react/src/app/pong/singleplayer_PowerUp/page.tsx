"use client";

// PongGame.js
import { GameManager } from './gameManager';

import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const paddleWidth = 10;
const paddleHeight = 100;
const gameWidth = 400;
const gameHeight = 400;
const ballSize = 10;
const borderWidth = 5;

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
	const [gameManager, setGameManager] = useState<GameManager | null>(null);
	const [score, setScore] = useState<[number, number]>([0, 0]);
	const [Gamestate, SetGameState] = useState<string>("Playing");
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		if (socket) return;
		setSocket(io(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/power-up`, { path: "/ws/socket.io" }));
	}, [])
	
	useEffect(() => {
		if (canvasRef.current === null) return;
		const context = canvasRef.current.getContext("2d");
		if (context === null) return;

		if (!socket) return;
		const manager = new GameManager(context, socket, gameWidth, gameHeight, paddleWidth, paddleHeight, ballSize);
		setGameManager(manager);

		// upon reloading this does not work anymore
		socket.on('startSetup', ({ x, y, leftPaddle, rightPaddle }: { x: number, y: number, leftPaddle: number, rightPaddle: number }) => {
			manager.updateBallPosition(x, y);
			manager.updatePaddlePosition('left', leftPaddle);
			manager.updatePaddlePosition('right', rightPaddle);
			manager.leftPaddle.draw();
			manager.rightPaddle.draw();
			manager.ball.draw();
		});

		socket.on('gameUpdate', ({ x, y, leftPaddle, rightPaddle }: { x: number, y: number, leftPaddle: number, rightPaddle: number }) => {
			manager.updateBallPosition(x, y);
			manager.updatePaddlePosition('left', leftPaddle);
			manager.updatePaddlePosition('right', rightPaddle);
		});

		socket.on('rightPaddle', (paddle: number) => {
			manager.updatePaddlePosition('right', paddle);
		});

		socket.on('leftPaddle', (paddle: number) => {
			manager.updatePaddlePosition('left', paddle);
		});

		socket.on('ball', ({ x, y }: { x: number, y: number }) => {
			manager.updateBallPosition(x, y);
		});

		socket.on('showPowerUp', ({ powerUpType, powerUpHeight }: { powerUpType: number, powerUpHeight: number }) => {
			// manager.updateSVGString(shieldSVGString);
			manager.updatePowerUpHeight(powerUpHeight);
			manager.showPowerUp(powerUpType);
			console.log("show power up");
		});

		socket.on('powerUpHit', (powerUpType: string) => {
			manager.showPowerUp(0);
			console.log("power up hit");
		});

		socket.on('enlargePaddle', (paddle: number) => {
			if (paddle === 1)
				manager.leftPaddle.updateHeight(150);
			else
				manager.rightPaddle.updateHeight(150);
		});

		socket.on('score', ({left, right}: {left: number, right: number}) => {
			setScore([left, right]);
		});

		socket.on('reset', () => {
			manager.resetGame();
		});

		socket.on('gameover', () => {
			SetGameState("GameOver");
			socket.emit('stop');
		});

		// socket.on('playersReady', () => {
		// 	manager.updateGameState("playing");
		// });

		manager.attachListeners();

		return () => {
			manager.removeListeners();
		};
	}, [canvasRef, socket]);

	const startGame = () => {
		SetGameState("Playing");
		if (gameManager) {
			gameManager.startGame();
			socket.emit('start');
		}
	};

	const stopGame = () => {
		socket.emit('stop');
	};

	return (
		<div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl w-full">
			<div className="flex items-center justify-center mb-6">
				{Gamestate === "GameOver" && (
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
					</div>
				)}
			</div>
			{/* <div className="flex flex-col items-center justify-center mb-6">
				<h1>Score</h1>
				{gameManager && <h1 style={{ marginTop: '-5px' }}> {gameManager.score.left} - {gameManager.score.right} </h1>}
			</div> */}
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
					<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={stopGame}>
						Stop
					</button>
				</div>
			</div>
		</div>
	);
}