import { useState, useRef, useCallback, useEffect } from 'react';

const STEPS = ['FACE_FRONT', 'BLINK'];
const STEP_TIMEOUT = 10000; // 10 seconds per step

const STEP_INFO = {
  IDLE: { label: 'Siap memulai...', instruction: 'Posisikan wajah Anda di dalam lingkaran' },
  FACE_FRONT: { label: 'Hadap Depan', instruction: 'Hadapkan wajah Anda ke depan kamera' },
  BLINK: { label: 'Kedipkan Mata', instruction: 'Kedipkan kedua mata Anda' },
  COMPLETED: { label: 'Selesai!', instruction: 'Verifikasi liveness berhasil' },
  FAILED: { label: 'Gagal', instruction: 'Waktu habis, silakan coba lagi' },
};

export default function useLiveness(landmarks, blendshapes, faceDetected) {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1); // -1 = IDLE
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [stepProgress, setStepProgress] = useState(0);

  const holdStartRef = useRef(null);
  const timeoutRef = useRef(null);
  const stepStartTimeRef = useRef(null);

  const currentStep = currentStepIndex < 0 ? 'IDLE' : currentStepIndex >= STEPS.length ? 'COMPLETED' : STEPS[currentStepIndex];
  const progress = ((currentStepIndex < 0 ? 0 : currentStepIndex) / STEPS.length) * 100;

  // Calculate yaw angle from face landmarks
  const calculateYaw = useCallback((lms) => {
    if (!lms || lms.length < 468) return 0;
    // Nose tip: landmark 1, left cheek: 234, right cheek: 454
    const noseTip = lms[1];
    const leftCheek = lms[234];
    const rightCheek = lms[454];

    if (!noseTip || !leftCheek || !rightCheek) return 0;

    const faceWidth = rightCheek.x - leftCheek.x;
    if (Math.abs(faceWidth) < 0.001) return 0;

    const noseRelative = (noseTip.x - leftCheek.x) / faceWidth;
    // 0.5 = centered, <0.5 = turned right (mirrored), >0.5 = turned left (mirrored)
    // Convert to degrees approximately: range ~0.3 to 0.7 maps to ~-40° to 40°
    const yaw = (noseRelative - 0.5) * 80;
    return yaw;
  }, []);

  const start = useCallback(() => {
    setCurrentStepIndex(0);
    setIsCompleted(false);
    setError(null);
    setStepProgress(0);
    holdStartRef.current = null;
    stepStartTimeRef.current = Date.now();
  }, []);

  const reset = useCallback(() => {
    setCurrentStepIndex(-1);
    setIsCompleted(false);
    setError(null);
    setStepProgress(0);
    holdStartRef.current = null;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const advanceStep = useCallback(() => {
    setCurrentStepIndex((prev) => {
      const next = prev + 1;
      if (next >= STEPS.length) {
        setIsCompleted(true);
        return STEPS.length;
      }
      stepStartTimeRef.current = Date.now();
      holdStartRef.current = null;
      setStepProgress(0);
      return next;
    });
  }, []);

  // Check conditions each frame
  useEffect(() => {
    if (currentStepIndex < 0 || currentStepIndex >= STEPS.length || !faceDetected) {
      holdStartRef.current = null;
      return;
    }

    const step = STEPS[currentStepIndex];
    let conditionMet = false;

    const yaw = calculateYaw(landmarks);

    switch (step) {
      case 'FACE_FRONT':
        conditionMet = Math.abs(yaw) < 18;
        break;
      case 'BLINK':
        if (blendshapes) {
          const leftBlink = blendshapes.eyeBlinkLeft || 0;
          const rightBlink = blendshapes.eyeBlinkRight || 0;
          conditionMet = leftBlink > 0.4 && rightBlink > 0.4;
        }
        break;
    }

    if (conditionMet) {
      if (!holdStartRef.current) {
        holdStartRef.current = Date.now();
      }

      const holdDuration = Date.now() - holdStartRef.current;
      const required = step === 'BLINK' ? 150 : 700;
      setStepProgress(Math.min((holdDuration / required) * 100, 100));

      if (holdDuration >= required) {
        advanceStep();
      }
    } else {
      holdStartRef.current = null;
      setStepProgress(0);
    }
  }, [landmarks, blendshapes, faceDetected, currentStepIndex, calculateYaw, advanceStep]);

  // Step timeout
  useEffect(() => {
    if (currentStepIndex >= 0 && currentStepIndex < STEPS.length) {
      timeoutRef.current = setTimeout(() => {
        setError('Waktu habis. Silakan coba lagi.');
        setCurrentStepIndex(-1);
        holdStartRef.current = null;
      }, STEP_TIMEOUT);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStepIndex]);

  return {
    currentStep,
    currentStepIndex,
    totalSteps: STEPS.length,
    progress,
    stepProgress,
    isCompleted,
    error,
    stepInfo: STEP_INFO[currentStep] || STEP_INFO.IDLE,
    start,
    reset,
  };
}
