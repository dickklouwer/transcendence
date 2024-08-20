// GameManager.js

// Interface for the Score
interface Score {
    left: number;
    right: number;
}

import Paddle from './paddle';
import Ball from './ball';
import { Socket } from "socket.io-client";

export class GameManager {
    context: CanvasRenderingContext2D;
    socket: Socket;
    gameWidth: number;
    gameHeight: number;
    paddleWidth: number;
    paddleHeight: number;
    ballSize: number;

    rightPaddle: Paddle;
    leftPaddle: Paddle;
    ball: Ball;
    score: Score;
    powerUpHeight: number;
    gameState: string;
    SVGstring: string;
    shieldImage: HTMLImageElement | null;

    constructor(context: CanvasRenderingContext2D, socket: Socket, gameWidth: number, gameHeight: number, paddleWidth: number, paddleHeight: number, ballSize: number) {
        this.context = context;
        this.socket = socket;
        this.gameWidth = gameWidth;
        this.gameHeight = gameHeight;
        this.paddleWidth = paddleWidth;
        this.paddleHeight = paddleHeight;
        this.ballSize = ballSize;

        this.leftPaddle = new Paddle(context, 10, 150);
        this.rightPaddle = new Paddle(context, gameWidth - 10, 150);
        this.ball = new Ball(context, gameWidth / 2, gameHeight / 2, ballSize);

        this.score = { left: 0, right: 0 };
        this.powerUpHeight = 0;
        this.gameState = "playing";
        this.SVGstring = "";
        this.shieldImage = null;
    }

    drawShield = () => {
        if (this.shieldImage) {
            this.context.drawImage(this.shieldImage, (this.gameWidth - 30) / 2, this.powerUpHeight, 30, 30);
        }
    }

    updateGameState = (newState: string) => {
        this.gameState = newState;
        if (newState === "shield") {
            const svgBlob = new Blob([this.SVGstring], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            this.shieldImage = new Image();
            this.shieldImage.onload = () => {
                this.drawShield();
                URL.revokeObjectURL(url); // Clean up the object URL after use
            };
            this.shieldImage.src = url;
        }
    };

    updatePaddlePosition = (side: string, position: number) => {
        if (side === 'left') {
            this.leftPaddle.setPosition(position);
        } else {
            this.rightPaddle.setPosition(position);
        }
    };

    updateBallPosition = (x: number, y: number) => {
        this.ball.setPosition(x, y);
    };

    updateScore = (score: Score) => {
        this.score = score;
    };

    updatePowerUpHeight = (height: number) => {
        this.powerUpHeight = height;
    };

    updateSVGString = (svgString: string) => {
        this.SVGstring = svgString;
    }

    startGame() {
        const drawLoop = () => {
            this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
            this.leftPaddle.draw();
            this.rightPaddle.draw();
            this.ball.draw();
            
            // Draw the shield if the game state is "shield"
            if (this.gameState === "shield") {
                this.drawShield();
            }
            
            requestAnimationFrame(drawLoop);
        };
        drawLoop();
    }

    resetGame = () => {
        this.rightPaddle.reset();
        this.leftPaddle.reset();
        this.ball.reset();
        this.score = { left: 0, right: 0 };
        this.powerUpHeight = 0;
        this.gameState = "playing"; // Reset game state to playing
        this.shieldImage = null; // Clear the shield image
        this.startGame();
    };

    handleKeyDown = (event: KeyboardEvent) => {
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
