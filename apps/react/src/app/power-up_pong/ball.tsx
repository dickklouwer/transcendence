// Ball.js

class Ball {
	size: number;
	positionX: number;
	positionY: number;
	startX: number;
	startY: number;
	color: string;
	radius: number;
	context: CanvasRenderingContext2D;
  
	constructor(context: CanvasRenderingContext2D, positionX: number, positionY: number, size: number) {
	  this.size = size;
	  this.positionX = positionX;
	  this.positionY = positionY;
	  this.startX = positionX;
	  this.startY = positionY;
	  this.context = context;
	  this.radius = size / 2;
	  this.color = "#1e1e1e";
	}
  
	draw() {
	  this.context.beginPath();
	  this.context.fillStyle = "white";
	  this.context.arc(
		this.positionX,
		this.positionY,
		this.radius,
		0,
		Math.PI * 2,
		false
	  );
	  this.context.fill();
	  this.context.closePath();
	}
  
	setPosition(positionX: number, positionY: number) {
	  this.positionX = positionX;
	  this.positionY = positionY;
	}

	reset() {
	  this.positionX = this.startX;
	  this.positionY = this.startY;
	}
  }
  
  export default Ball;
  