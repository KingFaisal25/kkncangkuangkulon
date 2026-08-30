import { useState, useEffect, useCallback, useRef } from 'react';
import useCamera from '../../hooks/useCamera';
import useFaceDetection from '../../hooks/useFaceDetection';
import useFaceRecognition from '../../hooks/useFaceRecognition';
import CameraView from './CameraView';
import Button from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';
import { pickBestFaceFrame } from '../../utils/imageQuality';

export default function FaceCapture({ onCapture, onCancel, autoCapture = false }) {
  const { videoRef, isActive, error: cameraError, startCamera, stopCamera, captureBase64 } = useCamera();
  const { faceDetected, landmarks, isModelLoaded: detectionReady, loadingProgress: detectionProgress } = useFaceDetection(videoRef, isActive);
  const { isModelLoaded: recognitionReady, loadingProgress: recognitionProgress, generateEmbedding } = useFaceRecognition();
  const [captured, setCaptured] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const stableFramesRef = useRef(0);
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  const getFaceQuality = useCallback(() => {
    const videoElement = videoRef.current?.video || videoRef.current;
    if (!landmarks?.length || !videoElement?.videoWidth || !videoElement?.videoHeight) {
      return { ready: false, reason: 'Wajah belum cukup jelas.' };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    landmarks.forEach((point) => {
      minX = Math.min(minX, point.x);
      minY = Math.min(minY, point.y);
      maxX = Math.max(maxX, point.x);
      maxY = Math.max(maxY, point.y);
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const area = width * height;
    const centerX = minX + width / 2;
    const centerY = minY + height / 2;
    const offsetX = Math.abs(centerX - 0.5);
    const offsetY = Math.abs(centerY - 0.5);

    if (width < 0.18 || height < 0.22) {
      return { ready: false, reason: 'Wajah terlalu jauh. Dekatkan kamera.' };
    }

    if (area < 0.04) {
      return { ready: false, reason: 'Wajah terlalu kecil di frame.' };
    }

    if (offsetX > 0.16 || offsetY > 0.16) {
      return { ready: false, reason: 'Pusatkan wajah di tengah kamera.' };
    }

    if (minX < 0.03 || minY < 0.03 || maxX > 0.97 || maxY > 0.97) {
      return { ready: false, reason: 'Wajah terlalu mepet tepi frame.' };
    }

    return { ready: true, reason: '' };
  }, [landmarks, videoRef]);

  useEffect(() => {
    stableFramesRef.current = faceDetected && getFaceQuality().ready ? stableFramesRef.current + 1 : 0;
  }, [faceDetected, getFaceQuality]);

  const handleCapture = useCallback(async () => {
    try {
      setProcessing(true);
      setError(null);

      const faceQuality = getFaceQuality();
      if (!faceDetected || !faceQuality.ready) {
        throw new Error(faceQuality.reason || 'Wajah belum terdeteksi. Coba posisikan wajah lebih jelas.');
      }

      const bestFrame = await pickBestFaceFrame(async () => {
        const imageBase64 = captureBase64();
        const imageElement = videoRef.current?.video;
        return imageBase64 && imageElement ? { imageBase64, imageElement } : null;
      });

      if (!bestFrame) {
        throw new Error('Gagal mengambil gambar');
      }

      const embedding = await generateEmbedding(bestFrame.imageBase64);

      setCaptured({ imageBase64: bestFrame.imageBase64, embedding });
      stopCamera();
    } catch (err) {
      console.error('Capture error:', err);
      setError(err.message || 'Gagal memproses wajah');
    } finally {
      setProcessing(false);
    }
  }, [captureBase64, faceDetected, generateEmbedding, getFaceQuality, stopCamera, videoRef]);

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
      const faceQuality = getFaceQuality();
      if (!faceQuality.ready || stableFramesRef.current < 2) return;

      const timer = setTimeout(() => {
        handleCapture();
      }, 400); // faster auto capture
      return () => clearTimeout(timer);
    }
  }, [autoCapture, faceDetected, processing, captured, getFaceQuality, handleCapture]);

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
          <p className="text-sm text-white/50">Pastikan wajah terlihat jelas</p>
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
        <p className="text-sm text-white/50">Posisikan wajah di tengah lingkaran</p>
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
          disabled={processing}
          loading={processing}
          onClick={handleCapture}
        >
          {processing ? 'Memproses...' : 'Ambil Foto'}
        </Button>
      </div>
    </div>
  );
}
