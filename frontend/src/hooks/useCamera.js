import { useState, useRef, useCallback } from 'react';

export default function useCamera() {
  const videoRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(() => {
    setError(null);
    setIsActive(true);
  }, []);

  const stopCamera = useCallback(() => {
    setIsActive(false);
  }, []);

  const captureBase64 = useCallback((quality = 0.65, maxWidth = 480) => {
    const video = videoRef.current?.video;
    if (!video?.videoWidth || !video?.videoHeight) return null;

    const scale = Math.min(1, maxWidth / video.videoWidth);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', quality);
  }, []);

  return {
    videoRef,
    isActive,
    error,
    startCamera,
    stopCamera,
    captureBase64,
  };
}
