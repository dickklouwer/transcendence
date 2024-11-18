// Path: src/game/GameManager.ts

import Paddle from '../../game_elements/paddle';
import Ball from '../../game_elements/ball';
import { Socket } from "socket.io-client";

export class GameManager {
    private context: CanvasRenderingContext2D;
    private socket: Socket;
    private gameWidth: number;
    private gameHeight: number;
    private paddleWidth: number;
    private paddleHeight: number;
    private ballSize: number;

    private rightPaddle: Paddle;
    private leftPaddle: Paddle;
    private ball: Ball;
    private animationFrameId: number | null = null;

    private keyState: { [key: string]: boolean } = {}; // Track key states

    constructor(
        context: CanvasRenderingContext2D,
        socket: Socket,
        gameWidth: number,
        gameHeight: number,
        paddleWidth: number,
        paddleHeight: number,
        ballSize: number
    ) {
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
    }

    updatePaddlePosition = (side: string, position: number) => {
        if (side === 'left') {
            this.leftPaddle.setPosition(position);
            this.leftPaddle.draw();
        } else {
            this.rightPaddle.setPosition(position);
            this.rightPaddle.draw();
        }
    };

    updateBallPosition = (x: number, y: number) => {
        this.ball.setPosition(x, y);
        this.ball.draw();
    };

    startGame() {
        const drawLoop = () => {
            this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
            this.leftPaddle.draw();
            this.rightPaddle.draw();
            this.ball.draw();

            this.animationFrameId = requestAnimationFrame(drawLoop);
        };
        drawLoop();
    }

    resetGame = () => {
        this.ball.reset();
        this.leftPaddle.setPosition(150);
        this.rightPaddle.setPosition(150);
        this.startGame();
    };

    stopGame() {
        if (this.animationFrameId !== null) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    handleKeyDown = (event: KeyboardEvent) => {
        const key = event.key;
        if (!this.keyState[key]) { // Only handle if the key is not already pressed
            this.keyState[key] = true; // Mark key as pressed
            this.socket.emit('key_event', { key, state: 'down' });
        }

        if (key === 'ArrowUp' || key === 'ArrowDown') {
            event.preventDefault(); // Prevent default scrolling behavior
        }
    };

    handleKeyUp = (event: KeyboardEvent) => {
        const key = event.key;
        if (this.keyState[key]) { // Only handle if the key was previously pressed
            this.keyState[key] = false; // Mark key as released
            this.socket.emit('key_event', { key, state: 'up' });
        }
    };

    attachListeners = () => {
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    };

    removeListeners = () => {
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        this.socket.removeAllListeners();
    };
}
