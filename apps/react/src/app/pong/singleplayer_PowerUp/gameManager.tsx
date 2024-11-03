// GameManager.js

// Interface for the Score

enum PowerUpType {
	shield = 1,
	largePaddle = 2,
	speedUp = 3,
}

import Paddle from '../../game_elements/paddle';
import Ball from '../../game_elements/ball';
import { Socket } from "socket.io-client";

const shieldSVGString = '<svg viewBox="0 0 24.00 24.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#44e708"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M11.302 21.6149C11.5234 21.744 11.6341 21.8086 11.7903 21.8421C11.9116 21.8681 12.0884 21.8681 12.2097 21.8421C12.3659 21.8086 12.4766 21.744 12.698 21.6149C14.646 20.4784 20 16.9084 20 12V6.6C20 6.04207 20 5.7631 19.8926 5.55048C19.7974 5.36198 19.6487 5.21152 19.4613 5.11409C19.25 5.00419 18.9663 5.00084 18.3988 4.99413C15.4272 4.95899 13.7136 4.71361 12 3C10.2864 4.71361 8.57279 4.95899 5.6012 4.99413C5.03373 5.00084 4.74999 5.00419 4.53865 5.11409C4.35129 5.21152 4.20259 5.36198 4.10739 5.55048C4 5.7631 4 6.04207 4 6.6V12C4 16.9084 9.35396 20.4784 11.302 21.6149Z" stroke="#2af202" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
const paddleSVGString = '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12 3V21M12 3L16 7M12 3L8 7M12 21L8 17M12 21L16 17" stroke="#039dfc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>';
const fireballSVGString = '<svg height=\"800px\" width=\"800px\" version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 511.999 511.999\"><path style=\"fill: #E9573F;\" d=\"M405.952,201.859C400.28,182.859,511.999,0,511.999,0S247.687,156.359,234.64,150c-21.25-10.359,5.188-58.875,5.188-58.875l-188,158.484l0,0c-2.766,2.375-5.469,4.875-8.094,7.5c-58.312,58.312-58.312,152.844,0,211.156s152.844,58.312,211.156,0c6.328-6.328,16.938-20.188,16.938-20.188l176.171-234.749C447.999,213.328,411.171,219.359,405.952,201.859z\"/><circle style=\"fill: #FFCE54;\" cx=\"149.219\" cy=\"362.56\" r=\"106.66\" /></svg>';


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
    powerUpHeight: number;
    powerUp: number;
    powerUpImage: HTMLImageElement | null;

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

        this.powerUpHeight = 0;
        this.powerUp = 0;
        this.powerUpImage = null;
    }

    drawPowerUp = () => {
        if (this.powerUpImage) {
            this.context.drawImage(this.powerUpImage, (this.gameWidth - 30) / 2, this.powerUpHeight, 30, 30);
        }
    }

    showPowerUp = (powerUpType: number) => {
        this.powerUp = powerUpType;
        if (powerUpType === PowerUpType.shield) {
            const svgBlob = new Blob([shieldSVGString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            this.powerUpImage = new Image();
            this.powerUpImage.onload = () => {
                URL.revokeObjectURL(url); // Clean up the object URL after use
            };
            this.powerUpImage.src = url;
        }
        if (powerUpType === PowerUpType.largePaddle) {
            const svgBlob = new Blob([paddleSVGString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            this.powerUpImage = new Image();
            this.powerUpImage.onload = () => {
                URL.revokeObjectURL(url); // Clean up the object URL after use
            };
            this.powerUpImage.src = url;
        }
        if (powerUpType === PowerUpType.speedUp) {
            const svgBlob = new Blob([fireballSVGString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(svgBlob);
            this.powerUpImage = new Image();
            this.powerUpImage.onload = () => {
                URL.revokeObjectURL(url); // Clean up the object URL after use
            };
            this.powerUpImage.src = url;
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

    updatePowerUpHeight = (height: number) => {
        this.powerUpHeight = height;
    };

    startGame() {
        const drawLoop = () => {
            this.context.clearRect(0, 0, this.gameWidth, this.gameHeight);
            this.leftPaddle.draw();
            this.rightPaddle.draw();
            this.ball.draw();
            
            // Draw the shield if the game state is "shield"
            if (this.powerUp !== 0) {
                this.drawPowerUp();
            }
            requestAnimationFrame(drawLoop);
        };
        drawLoop();
    }

    resetGame = () => {
        this.ball.reset();
        this.powerUpHeight = 0;
        this.powerUp = 0; // Reset game state to normal
        this.powerUpImage = null; // Clear the shield image
        this.leftPaddle.setPosition(150);
        this.rightPaddle.setPosition(150);
        this.leftPaddle.updateHeight(100);
        this.rightPaddle.updateHeight(100);
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
