// GameManager.js

interface Ball {
	x: number;
	y: number;
}

interface Score {
	left: number;
	right: number;
}

import { Socket } from "socket.io-client";

export class GameManager {
	context: CanvasRenderingContext2D;
	socket: Socket;
	gameWidth: number;
	gameHeight: number;
	paddleWidth: number;
	paddleHeight: number;
	ballSize: number;

	rightPaddle: number;
	leftPaddle: number;
	score: Score;
	ball: Ball;
	powerUpHeight: number;
	gameState: string;

	constructor(context: CanvasRenderingContext2D, socket: Socket, gameWidth: number, gameHeight: number, paddleWidth: number, paddleHeight: number, ballSize: number) {
	  this.context = context;
	  this.socket = socket;
	  this.gameWidth = gameWidth;
	  this.gameHeight = gameHeight;
	  this.paddleWidth = paddleWidth;
	  this.paddleHeight = paddleHeight;
	  this.ballSize = ballSize;
  
	  this.rightPaddle = 150;
	  this.leftPaddle = 150;
	  this.score = { left: 0, right: 0 };
	  this.ball = { x: 200, y: 200 };
	  this.powerUpHeight = 0;
	  this.gameState = "playing";
	}
  
	drawGame = () => {
	  this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
  
	  // Draw ball
	  this.context.fillStyle = 'white';
	  this.context.beginPath();
	  this.context.arc(this.ball.x, this.ball.y, this.ballSize / 2, 0, Math.PI * 2);
	  this.context.fill();
  
	  // Draw left paddle
	  this.context.fillStyle = 'white';
	  this.context.fillRect(10, this.leftPaddle, this.paddleWidth, this.paddleHeight);
  
	  // Draw right paddle
	  this.context.fillStyle = 'white';
	  this.context.fillRect(this.gameWidth - this.paddleWidth - 10, this.rightPaddle, this.paddleWidth, this.paddleHeight);
	  
	  // Draw power-up if gameState is shield
	  if (this.gameState === "shield") {
		  this.context.fillStyle = 'white';
		  this.context.fillRect((this.gameWidth - 30) / 2, this.powerUpHeight, 30, 30);
		  console.log("drawing shield at " + this.powerUpHeight);
		// const svgBlob = new Blob([shieldSVGString], { type: 'image/svg+xml' });
		// const url = URL.createObjectURL(svgBlob);
		// const img = new Image();
		// img.onload = () => {
		//   this.context.drawImage(img, (this.gameWidth - 30) / 2, this.powerUpHeight, 30, 30);
		//   URL.revokeObjectURL(url); // Clean up the object URL after use
		// };
		// img.src = url;
	  }
	};
  
	updateGameState = (newState: string) => {
	  this.gameState = newState;
	};
  
	updatePaddlePosition = (side: string, position: number) => {
	  if (side === 'left') {
		this.leftPaddle = position;
	  } else {
		this.rightPaddle = position;
	  }
	};
  
	updateBallPosition = (ball: Ball) => {
	  this.ball = ball;
	};
  
	updateScore = (score: Score) => {
	  this.score = score;
	};
  
	updatePowerUpHeight = (height: number) => {
	  this.powerUpHeight = height;
	};
  
	resetGame = () => {
	  this.rightPaddle = 150;
	  this.leftPaddle = 150;
	  this.score = { left: 0, right: 0 };
	  this.ball = { x: 200, y: 200 };
	  this.powerUpHeight = 0;
	  this.gameState = "playing";
	};
  
	handleKeyDown = (event: any) => {
	  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
		event.preventDefault(); // Prevent default scrolling behavior
	  }
	  if (event.key === 'ArrowUp') {
		this.socket.emit('movement', 'ArrowUp');
	  }
	  if (event.key === 'ArrowDown') {
		this.socket.emit('movement', 'ArrowDown');
	  }
	};
  
	attachListeners = () => {
	  window.addEventListener('keydown', this.handleKeyDown);
	};
  
	removeListeners = () => {
	  window.removeEventListener('keydown', this.handleKeyDown);
	  this.socket.removeAllListeners();
	};
  }
  