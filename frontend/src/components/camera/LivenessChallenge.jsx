import { useEffect, useCallback } from 'react';
import useCamera from '../../hooks/useCamera';
import useFaceDetection from '../../hooks/useFaceDetection';
import useLiveness from '../../hooks/useLiveness';
import CameraView from './CameraView';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

const stepIcons = {
  FACE_FRONT: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
    </svg>
  ),
  FACE_RIGHT: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  FACE_LEFT: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
    </svg>
  ),
  BLINK: (
    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
};

export default function LivenessChallenge({ onComplete, onCancel }) {
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera, captureBase64 } = useCamera();
  const { faceDetected, landmarks, blendshapes, isModelLoaded, loadingProgress } = useFaceDetection(videoRef, isActive);
  const {
    currentStep,
    currentStepIndex,
    totalSteps,
    progress,
    stepProgress,
    isCompleted,
    error: livenessError,
    stepInfo,
    start,
    reset,
  } = useLiveness(landmarks, blendshapes, faceDetected);

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // Auto-start liveness when model is ready
  useEffect(() => {
    if (isModelLoaded && isActive && currentStep === 'IDLE') {
      const timer = setTimeout(start, 1000);
      return () => clearTimeout(timer);
    }
  }, [isModelLoaded, isActive, currentStep, start]);

  // On completed, capture frame and call onComplete
  const handleComplete = useCallback(() => {
    const imageBase64 = captureBase64(0.9);
    stopCamera();
    onComplete?.({ imageBase64 });
  }, [captureBase64, stopCamera, onComplete]);

  useEffect(() => {
    if (isCompleted) {
      const timer = setTimeout(handleComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [isCompleted, handleComplete]);

  const handleRetry = () => {
    reset();
    if (!isActive) startCamera();
    setTimeout(start, 500);
  };

  // Loading state
  if (!isModelLoaded || !isActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner size="lg" text={loadingProgress || cameraError || 'Mempersiapkan kamera...'} />
        {cameraError && (
          <Button variant="secondary" onClick={startCamera}>
            Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  const steps = ['FACE_FRONT', 'FACE_RIGHT', 'FACE_LEFT'];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="glass-card-static p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm">Verifikasi Liveness</h3>
          <span className="text-xs text-white/50">
            {currentStepIndex >= 0 ? `${Math.min(currentStepIndex + 1, totalSteps)}/${totalSteps}` : '0/' + totalSteps}
          </span>
        </div>

        {/* Step indicators */}
        <div className="flex gap-2 mb-3">
          {steps.map((step, idx) => (
            <div
              key={step}
              className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                idx < currentStepIndex
                  ? 'bg-emerald-500'
                  : idx === currentStepIndex
                  ? 'bg-primary-500'
                  : 'bg-white/10'
              }`}
            >
              {idx === currentStepIndex && (
                <div
                  className="h-full bg-primary-400 rounded-full transition-all duration-200"
                  style={{ width: `${stepProgress}%` }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step icons */}
        <div className="flex justify-between">
          {steps.map((step, idx) => (
            <div
              key={step}
              className={`flex flex-col items-center gap-1 transition-all ${
                idx < currentStepIndex
                  ? 'text-emerald-400'
                  : idx === currentStepIndex
                  ? 'text-primary-400 scale-110'
                  : 'text-white/20'
              }`}
            >
              {idx < currentStepIndex ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              ) : (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                  idx === currentStepIndex ? 'border-primary-400 text-primary-400' : 'border-white/20'
                }`}>
                  {idx + 1}
                </div>
              )}
              <span className="text-[10px] font-medium">{step === 'FACE_FRONT' ? 'Depan' : step === 'FACE_RIGHT' ? 'Kanan' : 'Kiri'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Camera view */}
      <div className="relative">
        <CameraView
          videoRef={videoRef}
          faceDetected={faceDetected}
          landmarks={landmarks}
          showGuide
          className="aspect-[3/4] max-h-[500px]"
        />

        {/* Instruction overlay */}
        <div className="absolute top-4 left-4 right-4">
          <div className="glass-card-static p-3 flex items-center gap-3">
            <div className={`shrink-0 ${
              isCompleted ? 'text-emerald-400' : currentStepIndex >= 0 ? 'text-primary-400 animate-pulse-soft' : 'text-white/40'
            }`}>
              {isCompleted ? (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                stepIcons[currentStep] || stepIcons.FACE_FRONT
              )}
            </div>
            <div>
              <p className="font-heading font-semibold text-sm">{stepInfo.label}</p>
              <p className="text-xs text-white/50">{stepInfo.instruction}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error / retry */}
      {(livenessError || cameraError) && (
        <div className="glass-card-static p-4 border-danger/30 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center text-danger shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-danger">{livenessError || cameraError}</p>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="secondary" size="sm" onClick={handleRetry}>
              Coba Lagi
            </Button>
            {onCancel && (
              <Button variant="ghost" size="sm" onClick={onCancel}>
                Batal
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
