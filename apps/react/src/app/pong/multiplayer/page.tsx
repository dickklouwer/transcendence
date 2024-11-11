
"use client";

// PongGame.js
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
import { User } from '@repo/db';
import { GameManager } from './gameManager';
import Countdown from '../../game_elements/countdown';
import { fetchGet } from '../../fetch_functions';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

let socket = io(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/multiplayer`, { path: "/ws/socket.io" });

interface UserNames {
	left: string;
	right: string;
}

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
	const [userNames, setUserNames] = useState<UserNames>({ left: '', right: '' });
	const [Gamestate, SetGameState] = useState("AwaitingPlayer");
	const router = useRouter(); // Get the router object

	const gamestateRef = useRef(Gamestate);
	const searchParams = useSearchParams();
	gamestateRef.current = Gamestate; // Always keep the ref updated
	const player_id: number = Number(searchParams?.get('player_id')) ?? -1;
	const nick_name: string = searchParams?.get('nick_name') ?? '';


	useEffect(() => {
		fetchGet<User>('/api/profile')
			.then((res) => {
				if (res.intra_user_id !== null && res.user_name !== null) {
					socket.emit('registerUsers', { intra_id: res.intra_user_id, user_name: res.user_name, opp_id: player_id, opp_nn: nick_name });
				} else {
					console.error('Error fetching user profile:');
				}
			})
			.catch((error) => {
				console.error('Error fetching user profile:', error);
			});
	}, []);

	useEffect(() => {
		if (canvasRef.current === null) return;
		const context = canvasRef.current.getContext("2d");
		if (context === null) return;


		const manager = new GameManager(context, socket, gameWidth, gameHeight, paddleWidth, paddleHeight, ballSize);
		setGameManager(manager);

		socket.on('startSetup', ({ x, y, leftPaddle, rightPaddle }: { x: number, y: number, leftPaddle: number, rightPaddle: number }) => {
			manager.updateBallPosition(x, y);
			manager.updatePaddlePosition('left', leftPaddle);
			manager.updatePaddlePosition('right', rightPaddle);
			// manager.leftPaddle.draw();
			// manager.rightPaddle.draw();
			// manager.ball.draw();
			SetGameState("Countdown");
			setTimeout(() => {
				startGame();
				SetGameState("Playing");
				manager.startGame();
			}, 3000);
		});

		socket.on('gameUpdate', ({ x, y, leftPaddle, rightPaddle }: { x: number, y: number, leftPaddle: number, rightPaddle: number }) => {
			manager.updateBallPosition(x, y);
			manager.updatePaddlePosition('left', leftPaddle);
			manager.updatePaddlePosition('right', rightPaddle);
		});

		// socket.on('rightPaddle', (paddle: number) => manager.updatePaddlePosition('right', paddle));
		// socket.on('leftPaddle', (paddle: number) => manager.updatePaddlePosition('left', paddle));
		// socket.on('ball', (ball: { x: number, y: number }) => manager.updateBallPosition(ball.x, ball.y));

		socket.on('score', ({ left, right }: { left: number, right: number }) => {
			setScore([left, right]);
		});

		socket.on('gameover', () => {
			SetGameState("GameOver");
			socket.emit('stop');
		});

		socket.on('opponent_declined', () => {
			manager.removeListeners();
			socket.off('rightPaddle');
			socket.off('leftPaddle');
			socket.off('ball');
			socket.off('score');
			socket.off('gameover');
			socket.off('awaitPlayer');
			socket.off('playersReady');
			socket.emit('disconnect');
			socket.disconnect();
			router.push('/pong/opponent_left');
		});

		socket.on('opponent_left', () => {
			manager.removeListeners();
			socket.off('rightPaddle');
			socket.off('leftPaddle');
			socket.off('ball');
			socket.off('score');
			socket.off('gameover');
			socket.off('awaitPlayer');
			socket.off('playersReady');
			socket.emit('disconnect');
			socket.disconnect();
			router.push('/pong/opponent_left');
		});

		socket.on('names', (user: string[]) => setUserNames({ left: user[0], right: user[1] }));
		// socket.on('playersReady', () => {
		// 	SetGameState("Countdown");
		// 	setTimeout(() => SetGameState("Playing"), 3000);
		// });

		manager.attachListeners();

		return () => {
			socket.emit('stop');
			manager.removeListeners();
			socket.off('rightPaddle');
			socket.off('leftPaddle');
			socket.off('ball');
			socket.off('score');
			socket.off('gameover');
			socket.off('awaitPlayer');
			socket.off('playersReady');
		};
	}, []);

	const startGame = () => {
		console.log('Starting game');
		console.log('Gamestate:', gamestateRef.current);
		if (gameManager) {
			gameManager.startGame();
			console.log('Game started');
			socket.emit('start');
		}
	};

	const leave = () => {
		socket.emit('stop');
		socket.off('rightPaddle');
		socket.off('leftPaddle');
		socket.off('ball');
		socket.off('score');
		socket.off('gameover');
		socket.off('awaitPlayer');
		socket.off('playersReady');
		setGameManager(null);
		socket.emit('disconnect');
		socket.disconnect();
		router.push('/menu');
	}

	const GameStateComponent = () => (
		<>
			<h1 style={{ fontSize: '2.5rem' }}>Pong Game</h1>
			{Gamestate === "Countdown" && <Countdown />}
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
					<button className="bg-blue-500 text-white font-bold py-1 px-2 rounded mt-5 text-sm" onClick={leave}>
						Back to Home
					</button>
				</div>
			)}
			{Gamestate === "AwaitingPlayer" && (
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
			<ScoreBoard score={score} />
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
			<button className="bg-blue-500 text-white font-bold py-1 px-2 rounded mt-5 text-sm" onClick={leave}>
				Back to Home
			</button>
		</div>

	);
}
