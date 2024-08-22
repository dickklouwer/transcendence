"use client";

// PongGame.js
import React, { useEffect, useState, useRef } from 'react';
import Countdown from './countdown';
import io from 'socket.io-client';
import { User } from '@repo/db';
import { fetchGet } from '../fetch_functions';

const socket = io(`http://${window.location.host}/multiplayer`, { path: "/ws/socket.io" });

interface Ball {
	x: number;
	y: number;
}

interface Score {
	left: number;
	right: number;
}

interface userNames {
	left: string;
	right: string;
}

export default function PongGame() {
	const canvasRef = useRef(null);
	const [rightPaddle, setRightPaddle] = useState(150);
	const [leftPaddle, setLeftPaddle] = useState(150);
	const [score, setScore] = useState<Score>({ left: 0, right: 0 });
	const [ball, setBall] = useState<Ball>({ x: 200, y: 200 });
	const [Gamestate, SetGameState] = useState("AwaitingPlayer");
	const [userNames, setUserNames] = useState<userNames>({ left: '', right: '' });
	const [user, setUser] = useState<User>();


	const paddleWidth = 10;
	const paddleHeight = 100;
	const gameWidth = 400;
	const gameHeight = 400;
	const ballSize = 10;
	const borderWidth = 5;

	useEffect(() => {
		fetchGet<User>('api/profile')
			.then((res) => {
				setUser(res);
				if (res.intra_user_id !== null && res.user_name !== null) {
					console.log('User intra id:', res.intra_user_id);
					console.log('User name:', res.user_name);
					socket.emit('registerUser', { intra_id: res.intra_user_id, user_name: res.user_name });
				} else {
					console.error('Error fetching user profile:');
				}
			})
			.catch((error) => {
				// Handle fetch error
				console.error('Error fetching user profile:', error);
			});
	}, []);

	useEffect(() => {
		const canvas = canvasRef.current;
		const context = canvas.getContext('2d');

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

		socket.on('awaitPlayer', () => {
			SetGameState("AwaitingPlayer");
			socket.emit('stop');
		});

		socket.on('names', (user: string[]) => {
			console.log('Left user:', user);
			setUserNames({left: user[0], right: user[1]})
		});

		// socket.on('rightUser', (user: string) => {
		// 	console.log('Right user:', user);
		// 	setUserNames({ ...userNames, right: user });
		// });

		socket.on('playersReady', () => {
			SetGameState("Countdown");
			setTimeout(() => { SetGameState("Playing") }, 3000);
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
			socket.off('awaitPlayer');
			socket.off('playersReady');
		};
	}, [ball, rightPaddle, leftPaddle, score]);

	const startGame = () => {
		SetGameState("playing");
		socket.emit('start');
	};

	// const stopGame = () => {
	// 	socket.emit('stop');
	// };

	const GameStateComponent = () => (
		<>
			<h1 style={{ fontSize: '2.5rem' }}>Pong Game</h1>
			{Gamestate === "Countdown" && (
				<Countdown />
			)}
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
			{Gamestate == "AwaitingPlayer" && (
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
					<div>Awaiting Player</div>
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
				<div style={{ marginRight: '20px', fontSize: '1.5rem', color: 'white' }}>{userNames.left}</div>
				<canvas
					ref={canvasRef}
					width={gameWidth}
					height={gameHeight}
					style={{ border: `${borderWidth}px solid white` }}
				/>
				<div style={{ marginLeft: '20px', fontSize: '1.5rem', color: 'white' }}>{userNames.right}</div>
			</div>
			{/* <div className="flex items-center justify-center mb-6">
				<div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-around', width: '100%' }}>
					<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={startGame}>
						Start
					</button>
					<button className="bg-blue-500 text-white font-bold py-2 px-4 rounded" onClick={stopGame}>
						Stop
					</button>
				</div>
			</div> */}
		</div>
	);
}
