"use client";

// PongGame.js
import React, { useEffect, useState, useRef, use } from 'react';
import io from 'socket.io-client';
import { User } from '@repo/db';
import { GameManager } from './gameManager';
import Countdown from '../../game_elements/countdown';
import { fetchGet } from '../../fetch_functions';
import { useSearchParams, useRouter } from 'next/navigation';
import { chatSocket } from '../../chat_componens';

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

const socket = io(`http://${process.env.NEXT_PUBLIC_HOST_NAME}:4433/multiplayer`, {
	path: "/ws/socket.io",
	autoConnect: false, // Prevent automatic connection
});

const ScoreBoard = ({ score }: { score: [number, number] }): JSX.Element => (
	<div
		style={{
			display: "flex",
			fontSize: "24px",
			justifyContent: "center",
		}}
	>
		<span>{score[0]}</span> - <span>{score[1]}</span>
	</div>
);

export default function PongGame() {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const [gameManager, setGameManager] = useState<GameManager | null>(null);
	const [score, setScore] = useState<[number, number]>([0, 0]);
	const [userNames, setUserNames] = useState<UserNames>({ left: '', right: '' });
	const [gamestate, setGamestate] = useState("AwaitingPlayer");
	const router = useRouter();
	const searchParams = useSearchParams();
	const player_id: number = Number(searchParams?.get('player_id')) ?? -1;
	const nick_name: string = searchParams?.get('nick_name') ?? '';

	useEffect(() => {
		socket.connect();

		fetchGet<User>('/api/profile')
			.then((res) => {
				if (res.intra_user_id && res.user_name) {
					socket.emit('registerUsers', {
						intra_id: res.intra_user_id,
						user_name: res.user_name,
						opp_id: player_id,
						opp_nn: nick_name,
					});
				} else {
					console.error('Error fetching user profile');
				}
			})
			.catch((error) => {
				console.error('Error fetching user profile:', error);
			});

		return () => {
			socket.disconnect(); // Clean up connection on unmount
		};
	}, [player_id, nick_name]);

	useEffect(() => {
		if (!canvasRef.current) return;
		const context = canvasRef.current.getContext("2d");
		if (!context) return;

		const manager = new GameManager(context, socket, gameWidth, gameHeight, paddleWidth, paddleHeight, ballSize);
		setGameManager(manager);
		manager.attachListeners();

		const handleGameUpdate = ({ x, y, leftPaddle, rightPaddle }: any) => {
			manager.updateBallPosition(x, y);
			manager.updatePaddlePosition('left', leftPaddle);
			manager.updatePaddlePosition('right', rightPaddle);
		};

		const handleStartSetup = ({ x, y, leftPaddle, rightPaddle }: any) => {
			chatSocket.emit('inboxUpdate');
			manager.updateBallPosition(x, y);
			manager.updatePaddlePosition('left', leftPaddle);
			manager.updatePaddlePosition('right', rightPaddle);
			setGamestate("Countdown");

			setTimeout(() => {
				startGame();
				setGamestate("Playing");
				manager.startGame();
			}, 3000);
		};
		
		const opponentDisconnected = () => {
			console.log('Opponent disconnected');
			socket.disconnect();
			setGameManager(null);	
			router.push('/pong/opponent_left');
		}

		const opponentDeclinedInvite = () => {
			console.log('Opponent declined invite');
			socket.disconnect();
			setGameManager(null);	
			router.push('/pong/opponent_declined');
		}

		socket.on('gameUpdate', handleGameUpdate);
		socket.on('startSetup', handleStartSetup);
		socket.on('score', ({ left, right }: { left: number; right: number }) => setScore([left, right]));
		socket.on('gameover', () => setGamestate("GameOver"));
		socket.on('names', (user: string[]) => setUserNames({ left: user[0], right: user[1] }));
		socket.on('opponent_left', opponentDisconnected);
		socket.on('opponent_declined', opponentDeclinedInvite);

		return () => {
			socket.off('gameUpdate', handleGameUpdate);
			socket.off('startSetup', handleStartSetup);
			manager.removeListeners();
		};
	}, []);

	const startGame = () => {
		if (gameManager) {
			gameManager.startGame();
			socket.emit('start');
		}
	};

	const leave = () => {
		socket.disconnect();
		setGameManager(null);	
		router.push('/menu');
	};

	const GameStateComponent = () => (
		<>
			<h1 style={{ fontSize: '2.5rem' }}>Pong Game</h1>
			{gamestate === "Countdown" && <Countdown />}
			{gamestate === "GameOver" && (
				<div style={overlayStyle}>
					<div>Game Over!</div>
					<button onClick={leave} className="btn">Back to Home</button>
				</div>
			)}
			{gamestate === "AwaitingPlayer" && (
				<div style={overlayStyle}>
					<div>Awaiting Player</div>
				</div>
			)}
		</>
	);

	const overlayStyle = {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.5)',
		color: 'white',
		display: 'flex',
		flexDirection: 'column' as const,
		justifyContent: 'center',
		alignItems: 'center',
		fontSize: '2rem',
	};

	return (
		<div className="bg-slate-900 shadow-lg rounded-lg p-8 max-w-2xl w-full">
			<GameStateComponent />
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
			<button onClick={leave} className="btn">Back to Home</button>
		</div>
	);
}