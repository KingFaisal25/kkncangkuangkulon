import { useState, useEffect, useCallback } from 'react';
import useCamera from '../../hooks/useCamera';
import useFaceDetection from '../../hooks/useFaceDetection';
import useFaceRecognition from '../../hooks/useFaceRecognition';
import CameraView from './CameraView';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function FaceCapture({ onCapture, onCancel, autoCapture = false }) {
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera, captureBase64 } = useCamera();
  const { faceDetected, landmarks, isModelLoaded: detectionReady, loadingProgress: detectionProgress } = useFaceDetection(videoRef, isActive);
  const { isModelLoaded: recognitionReady, loadingProgress: recognitionProgress, generateEmbedding } = useFaceRecognition();
  const [captured, setCaptured] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const handleCapture = useCallback(async () => {
    if (!faceDetected) return;

    try {
      setProcessing(true);
      setError(null);

      const imageBase64 = captureBase64(0.9);
      if (!imageBase64) {
        throw new Error('Gagal mengambil gambar');
      }

      // Generate face embedding directly from the live video element to avoid compression/scaling issues
      const embedding = await generateEmbedding(videoRef.current?.video || imageBase64);

      setCaptured({ imageBase64, embedding });
      stopCamera();
    } catch (err) {
      console.error('Capture error:', err);
      setError(err.message || 'Gagal memproses wajah');
    } finally {
      setProcessing(false);
    }
  }, [faceDetected, captureBase64, generateEmbedding, stopCamera]);

  const handleRecapture = useCallback(() => {
    setCaptured(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (!captured) {
      startCamera();
    }
  }, [captured, startCamera]);

  const handleConfirm = useCallback(() => {
    if (captured) {
      onCapture?.(captured);
    }
  }, [captured, onCapture]);

  // Auto capture logic
  useEffect(() => {
    if (autoCapture && faceDetected && !processing && !captured) {
      const timer = setTimeout(() => {
        handleCapture();
      }, 1500); // 1.5 seconds delay before auto capture
      return () => clearTimeout(timer);
    }
  }, [autoCapture, faceDetected, processing, captured, handleCapture]);

  // Auto confirm logic
  useEffect(() => {
    if (autoCapture && captured) {
      handleConfirm();
    }
  }, [autoCapture, captured, handleConfirm]);

  // Loading state
  const isLoading = !detectionReady || !recognitionReady || !isActive;
  const loadingText = detectionProgress || recognitionProgress || 'Mempersiapkan kamera...';

  if (isLoading && !captured) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner size="lg" text={cameraError || loadingText} />
        {cameraError && (
          <Button variant="secondary" onClick={startCamera}>
            Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  // Preview mode
  if (captured) {
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="text-center mb-2">
          <h3 className="font-heading font-semibold text-lg">Preview Foto</h3>
          <p className="text-sm text-white/50">Pastikan foto wajah Anda jelas dan terlihat</p>
        </div>

        <div className="relative rounded-2xl overflow-hidden max-w-sm mx-auto">
          <img src={captured.imageBase64} alt="Captured face" className="w-full" />
          <div className="absolute bottom-3 left-3 right-3 flex justify-center">
            <div className="px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              ✓ Wajah Berhasil Ditangkap
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={handleRecapture}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Foto Ulang
          </Button>
          <Button fullWidth onClick={handleConfirm}>
            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Gunakan Foto Ini
          </Button>
        </div>

        {onCancel && (
          <Button variant="ghost" fullWidth onClick={onCancel}>
            Batal
          </Button>
        )}
      </div>
    );
  }

  // Camera mode
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="font-heading font-semibold text-lg">Ambil Foto Wajah</h3>
        <p className="text-sm text-white/50">Posisikan wajah Anda dalam lingkaran</p>
      </div>

      <CameraView
        videoRef={videoRef}
        faceDetected={faceDetected}
        landmarks={landmarks}
        className="w-full max-w-sm mx-auto aspect-[3/4] max-h-[500px]"
      />

      {error && (
        <div className="text-sm text-danger text-center animate-fade-in">
          <p>{error}</p>
        </div>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <Button variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button
          fullWidth
          disabled={!faceDetected || processing}
          loading={processing}
          onClick={handleCapture}
        >
          {processing ? 'Memproses...' : 'Ambil Foto'}
        </Button>
      </div>
    </div>
  );
}
