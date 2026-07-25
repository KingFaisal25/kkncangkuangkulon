import { useState, useRef, useCallback, useEffect } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function useFaceDetection(videoRef, isActive) {
  const [faceDetected, setFaceDetected] = useState(false);
  const [landmarks, setLandmarks] = useState(null);
  const [blendshapes, setBlendshapes] = useState(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');

  const faceLandmarkerRef = useRef(null);
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(-1);

  // Initialize MediaPipe FaceLandmarker
  const initFaceLandmarker = useCallback(async () => {
    try {
      setLoadingProgress('Memuat model deteksi wajah...');

      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
        },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: false,
      });

      setIsModelLoaded(true);
      setLoadingProgress('');
    } catch (err) {
      console.error('FaceLandmarker init error:', err);
      setLoadingProgress('Gagal memuat model: ' + err.message);
    }
  }, []);

  useEffect(() => {
    initFaceLandmarker();
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [initFaceLandmarker]);

  // Detection loop
  const detect = useCallback(() => {
    const videoElement = videoRef?.current?.video || videoRef?.current;
    
    if (
      !faceLandmarkerRef.current ||
      !videoElement ||
      !isActive ||
      videoElement.readyState < 2 ||
      videoElement.videoWidth === 0
    ) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }

    const now = Math.round(performance.now());
    if (now <= lastTimeRef.current) {
      animFrameRef.current = requestAnimationFrame(detect);
      return;
    }
    lastTimeRef.current = now;

    try {
      const results = faceLandmarkerRef.current.detectForVideo(videoElement, now);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        setFaceDetected(true);
        setLandmarks(results.faceLandmarks[0]);
        if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
          // Convert blendshapes array to object for easier access
          const bsMap = {};
          results.faceBlendshapes[0].categories.forEach((cat) => {
            bsMap[cat.categoryName] = cat.score;
          });
          setBlendshapes(bsMap);
        }
      } else {
        setFaceDetected(false);
        setLandmarks(null);
        setBlendshapes(null);
      }
    } catch (err) {
      console.error('MediaPipe detection error:', err);
    }

    animFrameRef.current = requestAnimationFrame(detect);
  }, [videoRef, isActive]);

  // Start/stop detection loop based on model loaded + camera active
  useEffect(() => {
    if (isModelLoaded && isActive) {
      animFrameRef.current = requestAnimationFrame(detect);
    }
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isModelLoaded, isActive, detect]);

  return {
    faceDetected,
    landmarks,
    blendshapes,
    isModelLoaded,
    loadingProgress,
  };
}
