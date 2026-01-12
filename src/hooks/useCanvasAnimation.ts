/**
 * useCanvasAnimation - Canvas-based animated background effect
 * Creates interactive particle network animation
 */

import { useEffect, useRef } from 'react';

interface Point {
  x: number;
  y: number;
  originX: number;
  originY: number;
  active: number;
  closest: Point[];
  circle?: Circle;
}

class Circle {
  pos: Point;
  radius: number;
  color: string;
  active: number = 0;

  constructor(pos: Point, rad: number, color: string) {
    this.pos = pos;
    this.radius = rad;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D): void {
    if (!this.active) return;
    ctx.beginPath();
    ctx.arc(this.pos.x, this.pos.y, this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = `rgba(156, 217, 249, ${this.active})`;
    ctx.fill();
  }
}

// Simple easing function (circular ease in-out)
function easeInOutCirc(t: number): number {
  return t < 0.5
    ? (1 - Math.sqrt(1 - 4 * t * t)) / 2
    : (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
}

function getDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}

export function useCanvasAnimation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const targetRef = useRef({ x: 0, y: 0 });
  const widthRef = useRef(0);
  const heightRef = useRef(0);
  const animateHeaderRef = useRef(true);
  const shiftAnimationsRef = useRef<Map<Point, { start: number; duration: number; fromX: number; fromY: number; toX: number; toY: number }>>(new Map());
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const largeHeader = document.getElementById('large-header');
    if (!largeHeader) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    widthRef.current = width;
    heightRef.current = height;
    targetRef.current = { x: width / 2, y: height / 2 };

    largeHeader.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create points
    const points: Point[] = [];
    const gridSpacing = 20;
    for (let x = 0; x < width; x += width / gridSpacing) {
      for (let y = 0; y < height; y += height / gridSpacing) {
        const px = x + (Math.random() * width) / gridSpacing;
        const py = y + (Math.random() * height) / gridSpacing;
        const p: Point = { x: px, originX: px, y: py, originY: py, active: 0, closest: [] };
        points.push(p);
      }
    }

    // For each point find the 5 closest points
    for (let i = 0; i < points.length; i++) {
      const closest: Point[] = [];
      const p1 = points[i];
      for (let j = 0; j < points.length; j++) {
        const p2 = points[j];
        if (p1 !== p2) {
          let placed = false;
          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (closest[k] === undefined) {
                closest[k] = p2;
                placed = true;
              }
            }
          }

          for (let k = 0; k < 5; k++) {
            if (!placed) {
              if (closest[k] && getDistance(p1, p2) < getDistance(p1, closest[k])) {
                closest[k] = p2;
                placed = true;
              }
            }
          }
        }
      }
      p1.closest = closest;
    }

    // Assign a circle to each point
    for (const point of points) {
      const c = new Circle(point, 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
      point.circle = c;
    }

    pointsRef.current = points;

    // Animation state for shifting points
    const shiftAnimations = shiftAnimationsRef.current;

    function shiftPoint(p: Point): void {
      const duration = 1 + Math.random() * 1; // 1-2 seconds
      const now = Date.now();
      shiftAnimations.set(p, {
        start: now,
        duration: duration * 1000,
        fromX: p.x,
        fromY: p.y,
        toX: p.originX - 50 + Math.random() * 100,
        toY: p.originY - 50 + Math.random() * 100,
      });
    }

    // Start shifting all points
    for (const point of points) {
      shiftPoint(point);
    }

    function drawLines(p: Point): void {
      if (!p.active || !ctx) return;
      for (const closest of p.closest) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(closest.x, closest.y);
        ctx.strokeStyle = `rgba(156, 217, 249, ${p.active})`;
        ctx.stroke();
      }
    }

    function animate(): void {
      if (!ctx || !canvas) return;
      
      // Always clear canvas first
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Always animate (ensure animateHeaderRef is true)
      if (!animateHeaderRef.current) {
        animateHeaderRef.current = true;
      }

      const now = Date.now();
      const target = targetRef.current;
      const shiftAnimations = shiftAnimationsRef.current;

      // Update point positions from shift animations
      const currentPoints = pointsRef.current;
      for (const point of currentPoints) {
        const anim = shiftAnimations.get(point);
        if (anim) {
          const elapsed = now - anim.start;
          if (elapsed < anim.duration) {
            const t = elapsed / anim.duration;
            const easedT = easeInOutCirc(t);
            point.x = anim.fromX + (anim.toX - anim.fromX) * easedT;
            point.y = anim.fromY + (anim.toY - anim.fromY) * easedT;
          } else {
            point.x = anim.toX;
            point.y = anim.toY;
            shiftAnimations.delete(point);
            shiftPoint(point); // Start new shift
          }
        }

        // Detect points in range and set active state
        const distance = getDistance(target, point);
        if (distance < 4000) {
          point.active = 0.3;
          if (point.circle) point.circle.active = 0.6;
        } else if (distance < 20000) {
          point.active = 0.1;
          if (point.circle) point.circle.active = 0.3;
        } else if (distance < 40000) {
          point.active = 0.02;
          if (point.circle) point.circle.active = 0.1;
        } else {
          point.active = 0;
          if (point.circle) point.circle.active = 0;
        }

        drawLines(point);
        if (point.circle && ctx) point.circle.draw(ctx);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    // Event handlers
    function mouseMove(e: MouseEvent): void {
      targetRef.current = { x: e.pageX || e.clientX, y: e.pageY || e.clientY };
    }

    function resize(): void {
      const currentCanvas = canvasRef.current;
      if (!currentCanvas) return;
      
      const currentCtx = currentCanvas.getContext('2d');
      if (!currentCtx) return;
      
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      widthRef.current = newWidth;
      heightRef.current = newHeight;
      
      const currentLargeHeader = document.getElementById('large-header');
      if (currentLargeHeader) {
        currentLargeHeader.style.height = newHeight + 'px';
      }
      
      currentCanvas.width = newWidth;
      currentCanvas.height = newHeight;
      
      // Recreate points on resize
      const newPoints: Point[] = [];
      const gridSpacing = 20;
      for (let x = 0; x < newWidth; x += newWidth / gridSpacing) {
        for (let y = 0; y < newHeight; y += newHeight / gridSpacing) {
          const px = x + (Math.random() * newWidth) / gridSpacing;
          const py = y + (Math.random() * newHeight) / gridSpacing;
          const p: Point = { x: px, originX: px, y: py, originY: py, active: 0, closest: [] };
          newPoints.push(p);
        }
      }

      // Recalculate closest points
      for (let i = 0; i < newPoints.length; i++) {
        const closest: Point[] = [];
        const p1 = newPoints[i];
        for (let j = 0; j < newPoints.length; j++) {
          const p2 = newPoints[j];
          if (p1 !== p2) {
            let placed = false;
            for (let k = 0; k < 5; k++) {
              if (!placed) {
                if (closest[k] === undefined) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }

            for (let k = 0; k < 5; k++) {
              if (!placed && closest[k]) {
                if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
                  closest[k] = p2;
                  placed = true;
                }
              }
            }
          }
        }
        p1.closest = closest;
      }

      // Assign circles
      for (const point of newPoints) {
        const c = new Circle(point, 2 + Math.random() * 2, 'rgba(255,255,255,0.3)');
        point.circle = c;
      }

      pointsRef.current = newPoints;
      shiftAnimationsRef.current.clear();
      for (const point of newPoints) {
        // Create new shift animation for this point
        const duration = 1 + Math.random() * 1;
        const now = Date.now();
        shiftAnimationsRef.current.set(point, {
          start: now,
          duration: duration * 1000,
          fromX: point.x,
          fromY: point.y,
          toX: point.originX - 50 + Math.random() * 100,
          toY: point.originY - 50 + Math.random() * 100,
        });
      }
    }

    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('resize', resize);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return canvasRef;
}
