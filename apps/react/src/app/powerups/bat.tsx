"class Bat {
    positionX: number;
    positionY: number;

    playerUid: string;

    startX: number;
    startY: number;

    width: number;
    height: number;

    context: CanvasRenderingContext2D;

    color: string;

    constructor(
        context: CanvasRenderingContext2D,
        positionX: number,
		positionY: number,
        // size: { width: number; height: number }
    ) {
        this.startX = positionX;
        this.startY = positionY;

        this.positionX = positionX;
        this.positionY = positionY;

        this.context = context;

        this.width = 10;
        this.height = 100;

        this.color = "#1e1e1e";
        this.playerUid = "";
    }

    draw() {
        this.context.beginPath();
        this.context.fillStyle = "white";
        this.context.fillRect(
            this.positionX - this.width / 2,
            this.positionY - this.height / 2,
            this.width,
            this.height
        );
        this.context.closePath();
    }

    reset() {
        this.positionX = this.startX;
        this.positionY = this.startY;
    }

    setPosition(positionX: number, positionY: number) {
        this.positionX = positionX;
        this.positionY = positionY;
    }

    updatePosition(val: number, invert: boolean) {
        if (invert) {
            this.positionY -= val;
        } else {
            this.positionY += val;
        }
    }

    wallCollisionBatUp() {
        if (this.positionY - this.height / 2 <= 0) {
            return true;
        } else {
            return false;
        }
    }

    wallCollisionBatDown() {
        if (this.positionY + this.height / 2 >= this.context.canvas.height) {
            return true;
        } else {
            return false;
        }
    }
}

export default Bat;"