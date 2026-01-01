import { useEffect, useRef } from 'react';
import './Hyperspeed.css';

const Hyperspeed = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Highway particles
    const particles = [];
    const particleCount = 200;

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = (Math.random() - 0.5) * width;
        this.y = (Math.random() - 0.5) * height;
        this.z = Math.random() * 1500;
        this.color = Math.random() > 0.5 
          ? `hsl(${Math.random() * 60 + 180}, 100%, 60%)` // Blue/Cyan
          : `hsl(${Math.random() * 60 + 300}, 100%, 60%)`; // Pink/Purple
      }

      update(speed) {
        this.z -= speed;
        if (this.z <= 0) {
          this.reset();
          this.z = 1500;
        }
      }

      draw() {
        const sx = (this.x / this.z) * 500 + width / 2;
        const sy = (this.y / this.z) * 500 + height / 2;
        const size = (1 - this.z / 1500) * 4;

        const prevZ = this.z + 10;
        const px = (this.x / prevZ) * 500 + width / 2;
        const py = (this.y / prevZ) * 500 + height / 2;

        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.strokeStyle = this.color;
        ctx.lineWidth = size;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    let speed = 15;
    let targetSpeed = 15;

    const animate = () => {
      ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
      ctx.fillRect(0, 0, width, height);

      speed += (targetSpeed - speed) * 0.05;

      particles.forEach(particle => {
        particle.update(speed);
        particle.draw();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseDown = () => {
      targetSpeed = 40;
    };

    const handleMouseUp = () => {
      targetSpeed = 15;
    };

    window.addEventListener('resize', handleResize);
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleMouseDown);
    canvas.addEventListener('touchend', handleMouseUp);

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleMouseDown);
      canvas.removeEventListener('touchend', handleMouseUp);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div id="hyperspeed-container">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default Hyperspeed;
