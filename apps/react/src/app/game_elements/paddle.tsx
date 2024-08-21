// Bat.js

class Paddle {
	positionX: number;
	positionY: number;
	playerUid: string;
	startY: number;
	width: number;
	height: number;
	context: CanvasRenderingContext2D;
  
	constructor(context: CanvasRenderingContext2D, positionX: number, positionY: number) {
	  this.startY = positionY;
	  this.positionX = positionX;
	  this.positionY = positionY;
	  this.context = context;
	  this.width = 10;
	  this.height = 100;
	  this.playerUid = "";
	}
  
	draw() {
	  this.context.beginPath();
	  this.context.fillStyle = "white";
	  this.context.fillRect(
		this.positionX - this.width / 2,
		this.positionY,
		this.width,
		this.height
	  );
	  this.context.closePath();
	}
  
	reset() {
	  this.positionY = this.startY;
	}
  
	setPosition(positionY: number) {
	  this.positionY = positionY;
	}

	updateHeight(height: number) {
		this.height = height;
	}
  
	// wallCollisionPaddleUp() {
	//   return this.positionY - this.height / 2 <= 0;
	// }
  
	// wallCollisionPaddleDown() {
	//   return this.positionY + this.height / 2 >= this.context.canvas.height;
	// }
  }
  
  export default Paddle;
  