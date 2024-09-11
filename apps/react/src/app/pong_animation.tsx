import React, { useRef, useEffect, useState } from 'react';
// import vicImage from './vic.png';  // Import the image directly
import { StaticImageData } from 'next/image';
import vicImage from './images/pongbal.png'; 

const PongAnimation = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ballImage, setBallImage] = useState<HTMLImageElement>();
  const [ballSize, setBallSize] = useState({ width: 30, height: 30 });

  useEffect(() => {
    const loadImage = () => {
      const img = new Image();
      img.src = (vicImage as StaticImageData).src;
      img.onload = () => {
        console.log('Image loaded successfully');
        setBallImage(img);
        
        // Set ball size based on loaded image, with a maximum width/height of 30 pixels
        const aspectRatio = img.width / img.height;
        let width = 80;
        let height = 80;
        if (aspectRatio > 1) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }
        
        setBallSize({ width, height });
      };
      img.onerror = (e) => {
        console.error('Error loading image:', e);
      };
    };
    loadImage();
  }, []);

  useEffect(() => {
    if (!ballImage) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    // Game objects
    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      width: ballSize.width,
      height: ballSize.height,
      dx: 2,
      dy: -2
    };

    const paddle = {
      width: 75,
      height: 10,
      x: (canvas.width - 75) / 2
    };

    // Game loop
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw ball (image)
      ctx.drawImage(ballImage, ball.x - ball.width / 2, ball.y - ball.height / 2, ball.width, ball.height);

      // Draw paddle
      ctx.beginPath();
      ctx.rect(paddle.x, canvas.height - paddle.height, paddle.width, paddle.height);
      ctx.fillStyle = '#0095DD';
      ctx.fill();
      ctx.closePath();

      // Move ball
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Ball collision with walls
      if (ball.x + ball.dx > canvas.width - ball.width / 2 || ball.x + ball.dx < ball.width / 2) {
        ball.dx = -ball.dx;
      }
      if (ball.y + ball.dy < ball.height / 2) {
        ball.dy = -ball.dy;
      } else if (ball.y + ball.dy > canvas.height - ball.height / 2 - paddle.height) {
        if (ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
          ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ball.height / 2) {
          ball.y = canvas.height / 2;
          ball.x = canvas.width / 2;
        }
      }

      // Move paddle
      paddle.x = ball.x - paddle.width / 2;

      // Ensure paddle stays within canvas
      if (paddle.x < 0) {
        paddle.x = 0;
      } else if (paddle.x + paddle.width > canvas.width) {
        paddle.x = canvas.width - paddle.width;
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();

    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [ballImage, ballSize]);

  return <canvas ref={canvasRef} width={300} height={200} />;
};

export default PongAnimation;