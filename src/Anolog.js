import { useEffect, useRef } from 'react';

const WallClock = () => {
  const canvasRef = useRef(null);
  const lastTimeRef = useRef({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const radius = canvas.width / 2;

    const lerp = (start, end, t) => start + (end - start) * t;

    const drawClock = () => {
      const now = new Date();
      const hours = now.getHours() % 12 + now.getMinutes() / 60;
      const minutes = now.getMinutes() + now.getSeconds() / 60;
      const seconds = now.getSeconds() + now.getMilliseconds() / 1000;

      // Smooth interpolation
      lastTimeRef.current.hours = lerp(lastTimeRef.current.hours, hours, 0.1);
      lastTimeRef.current.minutes = lerp(lastTimeRef.current.minutes, minutes, 0.1);
      lastTimeRef.current.seconds = lerp(lastTimeRef.current.seconds, seconds, 0.1);

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw outer frame (wooden texture)
      const isDark = document.documentElement.classList.contains('dark');
      const frameGradient = ctx.createRadialGradient(radius, radius, radius * 0.8, radius, radius, radius);
      frameGradient.addColorStop(0, isDark ? '#3C2F1A' : '#7B4F2E'); // Wood brown
      frameGradient.addColorStop(1, isDark ? '#2A2313' : '#5F3F22');
      ctx.beginPath();
      ctx.arc(radius, radius, radius - 1.34, 0, 2 * Math.PI);
      ctx.fillStyle = frameGradient;
      ctx.fill();
      ctx.strokeStyle = isDark ? '#A68A64' : '#E8B923'; // Bronze/Gold trim
      ctx.lineWidth = 5.34;
      ctx.stroke();

      // Draw clock face
      ctx.beginPath();
      ctx.arc(radius, radius, radius - 10.67, 0, 2 * Math.PI);
      ctx.fillStyle = isDark ? '#D9E2EC' : '#F8F1E9'; // Silver/Off-White
      ctx.fill();
      ctx.strokeStyle = '#1A2526'; // Charcoal
      ctx.lineWidth = 1.34;
      ctx.stroke();

      // Draw minute markers
      for (let i = 0; i < 60; i++) {
        const angle = (i * Math.PI) / 30;
        const isHour = i % 5 === 0;
        const start = radius * (isHour ? 0.85 : 0.92);
        const end = radius * 0.95;
        ctx.beginPath();
        ctx.moveTo(radius + start * Math.sin(angle), radius - start * Math.cos(angle));
        ctx.lineTo(radius + end * Math.sin(angle), radius - end * Math.cos(angle));
        ctx.strokeStyle = '#1A2526'; // Charcoal
        ctx.lineWidth = isHour ? 2.67 : 1.34;
        ctx.stroke();
      }

      // Draw Arabic numerals
      const numerals = ['12', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
      ctx.font = 'bold 13.34px "Times New Roman", serif';
      ctx.fillStyle = '#1A2526'; // Charcoal
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let i = 0; i < 12; i++) {
        const angle = (i * Math.PI) / 6;
        const textRadius = radius * 0.75;
        ctx.save();
        ctx.translate(radius + textRadius * Math.sin(angle), radius - textRadius * Math.cos(angle));
        ctx.fillText(numerals[i], 0, 0);
        ctx.restore();
      }

      // Draw hour hand
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'; // Softer shadow
      ctx.shadowBlur = 5.34;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      const hourAngle = (lastTimeRef.current.hours * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(radius + radius * 0.5 * Math.sin(hourAngle), radius - radius * 0.5 * Math.cos(hourAngle));
      ctx.strokeStyle = '#1A2526'; // Charcoal
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // Draw minute hand
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'; // Softer shadow
      ctx.shadowBlur = 5.34;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      const minuteAngle = (lastTimeRef.current.minutes * Math.PI) / 30;
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(radius + radius * 0.7 * Math.sin(minuteAngle), radius - radius * 0.7 * Math.cos(minuteAngle));
      ctx.strokeStyle = '#1A2526'; // Charcoal
      ctx.lineWidth = 2.67;
      ctx.stroke();
      ctx.restore();

      // Draw second hand with pendulum effect
      ctx.save();
      ctx.shadowColor = '#2A4D69'; // Matches second hand
      ctx.shadowBlur = 6.67;
      const secondAngle = (lastTimeRef.current.seconds * Math.PI) / 30;
      const tick = 1 + Math.sin(Date.now() / 150) * 0.03; // Pendulum-like tick
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.lineTo(radius + radius * 0.8 * Math.sin(secondAngle) * tick, radius - radius * 0.8 * Math.cos(secondAngle) * tick);
      ctx.strokeStyle = '#2A4D69'; // Muted Blue
      ctx.lineWidth = 1.34;
      ctx.stroke();
      ctx.restore();

      // Draw center dot
      const pulse = 1 + Math.sin(Date.now() / 600) * 0.1;
      ctx.beginPath();
      ctx.arc(radius, radius, 4 * pulse, 0, 2 * Math.PI);
      ctx.fillStyle = '#2A4D69'; // Muted Blue
      ctx.fill();
      ctx.strokeStyle = '#1A2526'; // Charcoal
      ctx.lineWidth = 1.34;
      ctx.stroke();
    };

    drawClock();
    const animate = () => {
      drawClock();
      requestAnimationFrame(animate);
    };
    animate();

    return () => {};
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      className="rounded-full shadow-2xl transition-transform duration-500 hover:scale-105"
      style={{ margin: '0 20px' }}
    />
  );
};

export default WallClock;