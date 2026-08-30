import { useState, useRef, useCallback, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';

let modelPromise;

const loadFaceRecognitionModels = () => {
  modelPromise ??= Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  ]);
  return modelPromise;
};

export default function useFaceRecognition() {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState('');
  const loadedRef = useRef(false);

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    if (loadedRef.current) return;

    try {
      setLoadingProgress('Memuat model pengenalan wajah...');
      await loadFaceRecognitionModels();

      loadedRef.current = true;
      setIsModelLoaded(true);
      setLoadingProgress('');
    } catch (err) {
      modelPromise = undefined;
      console.error('Face-api models load error:', err);
      setLoadingProgress(
        'Gagal memuat model pengenalan wajah. Pastikan file model tersedia di /models/'
      );
    }
  }, []);

  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Generate face embedding from an image element or canvas
  const generateEmbedding = useCallback(
    async (imageInput) => {
      await loadFaceRecognitionModels();

      let inputElement = imageInput;

      // If base64 string, convert to Image element
      if (typeof imageInput === 'string') {
        inputElement = await new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = imageInput;
        });
      }

      // Lower confidence threshold to 0.1 (default is 0.5) to make it highly tolerant for mobile phones
      const options = new faceapi.SsdMobilenetv1Options({ minConfidence: 0.1 });
      
      const detection = await faceapi
        .detectSingleFace(inputElement, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        throw new Error('Wajah tidak terdeteksi pada gambar');
      }

      // Return as regular array (128 floats)
      return Array.from(detection.descriptor);
    },
    []
  );

  return {
    isModelLoaded,
    loadingProgress,
    generateEmbedding,
  };
}
