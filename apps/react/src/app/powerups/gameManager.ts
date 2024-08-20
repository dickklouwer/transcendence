import { Ball } from "./ball.jsx";
import { Bat } from "./bat.jsx";

import { Socket } from "socket.io-client";

class GameManager {
	player1Score: number;
	player2Score: number;
	playerBat: Bat;

	ball: Ball;
	player1Bat: Bat;
	player2Bat: Bat;
	score: [number, number];

	context: CanvasRenderingContext2D;
	canvasWidth: number;
	canvasHeigth: number;

	connection: Socket;

	constructor(
		context: CanvasRenderingContext2D,
		connection: Socket
	) {
		if (!connection) {
			throw Error(
				"No connection supplied in the game manager constructor"
			);
		}

		if (!context) {
			throw Error("No canvas supplied in the game manager constructor");
		}

		this.context = context;
		this.score = [0, 0];

		this.player1Bat = null!; // I dont care about the rules
		this.player2Bat = null!;
		this.playerBat = null!;

		this.connection = connection;

		this.player1Score = 0;
		this.player2Score = 0;

		this.canvasHeigth = this.context.canvas.height;
		this.canvasWidth = this.context.canvas.width;


		this.ball = new Ball(
			this.context,
			200,
			200,
		);

		setScore(one: number, two: number) {
			this.score = [one, two];
		}

		setPlayers(): void {
			// const bat1pos = {
			// 	// posX: this.scaleViewInput("10vw"),
			// 	posX: 10,
			// 	// posY: this.scaleViewInput("50vh")
			// 	posY: 150
			// };

			// const bat2pos = {
			// 	// posX: this.canvasWidth - this.scaleViewInput("10vw"),
			// 	posX: this.canvasWidth - 10 - 10,
			// 	// posY: this.scaleViewInput("50vh")
			// 	posY: 150
			// };

			this.player1Bat = new Bat(this.context, 10, 150);
			// this.player1Bat.playerUid = playerOne.uid;

			this.player2Bat = new Bat(this.context, (this.canvasWidth - 10 - 10), 150);
			// this.player2Bat.playerUid = playerTwo.uid;
		}

		resetGame() {
			this.player1Bat.reset();
			this.player2Bat.reset();

			this.ball.setPosition(200, 200);
		}

		updateBall(posX: string, posY: string) {
			const newPosX = this.scaleViewInput(posX);
			const newPosY = this.scaleViewInput(posY);

			const newPosition: Game.Position = {
				posX: newPosX,
				posY: newPosY
			};

			this.ball.setPosition(newPosition);
		}

		updatePlayerBat(directionUp: boolean) {
			if (directionUp) {
				this.playerBat.updatePosition(this.scaleViewInput("2vh"), true);
			} else {
				this.playerBat.updatePosition(this.scaleViewInput("2vh"), false);
			}

			const newPosY = this.inputToScaled(this.playerBat.positionY, "vh");

			this.connection.emit("newBatPosition", {
				posY: newPosY
			});
		}

		startGame() {
			const drawLoop = () => {
				requestAnimationFrame(drawLoop);
				this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeigth);
				this.player1Bat.draw();
				this.player2Bat.draw();
				this.ball.draw();
			};
			drawLoop();
		}
	}
}

export default GameManager;