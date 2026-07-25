import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';

export default function CameraView({
  videoRef,
  faceDetected = false,
  landmarks = null,
  showGuide = false,
  mirrored = true,
  className = '',
}) {
  const canvasRef = useRef(null);
  const [camError, setCamError] = useState(null);

  // Draw face detection overlay
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = videoRef?.current?.video || videoRef?.current; // Handle both webcam ref and raw video ref
    if (!canvas || !video) return;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (landmarks && faceDetected) {
      // Calculate bounding box from landmarks
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      landmarks.forEach((point) => {
        const x = mirrored ? (1 - point.x) * canvas.width : point.x * canvas.width;
        const y = point.y * canvas.height;
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      });

      // Padding
      const pad = 20;
      minX = Math.max(0, minX - pad);
      minY = Math.max(0, minY - pad);
      maxX = Math.min(canvas.width, maxX + pad);
      maxY = Math.min(canvas.height, maxY + pad);

      // Draw rounded rectangle
      const w = maxX - minX;
      const h = maxY - minY;
      const r = 12;

      ctx.strokeStyle = faceDetected ? '#10b981' : '#ef4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(minX + r, minY);
      ctx.lineTo(maxX - r, minY);
      ctx.quadraticCurveTo(maxX, minY, maxX, minY + r);
      ctx.lineTo(maxX, maxY - r);
      ctx.quadraticCurveTo(maxX, maxY, maxX - r, maxY);
      ctx.lineTo(minX + r, maxY);
      ctx.quadraticCurveTo(minX, maxY, minX, maxY - r);
      ctx.lineTo(minX, minY + r);
      ctx.quadraticCurveTo(minX, minY, minX + r, minY);
      ctx.stroke();

      // Corner accents
      const cornerLen = 20;
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 3;

      // Top-left
      ctx.beginPath();
      ctx.moveTo(minX, minY + cornerLen);
      ctx.lineTo(minX, minY);
      ctx.lineTo(minX + cornerLen, minY);
      ctx.stroke();

      // Top-right
      ctx.beginPath();
      ctx.moveTo(maxX - cornerLen, minY);
      ctx.lineTo(maxX, minY);
      ctx.lineTo(maxX, minY + cornerLen);
      ctx.stroke();

      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(minX, maxY - cornerLen);
      ctx.lineTo(minX, maxY);
      ctx.lineTo(minX + cornerLen, maxY);
      ctx.stroke();

      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(maxX - cornerLen, maxY);
      ctx.lineTo(maxX, maxY);
      ctx.lineTo(maxX, maxY - cornerLen);
      ctx.stroke();
    }
  }, [landmarks, faceDetected, videoRef, mirrored]);

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-black ${className}`}>
      <Webcam
        ref={videoRef}
        audio={false}
        mirrored={mirrored}
        screenshotFormat="image/jpeg"
        videoConstraints={{ 
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }}
        className="w-full h-full object-cover"
        playsInline
        muted
        onUserMediaError={(err) => {
          console.error("Webcam error:", err);
          setCamError(err.message || err.name || "Kamera terkunci oleh sistem");
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />
      {showGuide && !camError && (
        <div className={`face-guide ${faceDetected ? 'detected' : ''}`} />
      )}
      {/* Face status indicator or Error */}
      <div className="absolute bottom-3 left-3 right-3 flex justify-center">
        {camError ? (
          <div className="px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md bg-red-500/20 text-red-300 border border-red-500/30 text-center">
            Error: {camError}
          </div>
        ) : (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md ${
              faceDetected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            {faceDetected ? '✓ Wajah Terdeteksi' : '○ Posisikan Wajah Anda'}
          </div>
        )}
      </div>
    </div>
  );
}
