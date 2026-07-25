import { useState, useRef, useCallback, useEffect } from 'react';

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

  const captureBase64 = useCallback(() => {
    if (videoRef.current) {
      // react-webcam exposes getScreenshot
      return videoRef.current.getScreenshot();
    }
    return null;
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
