import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import attendanceService from '../services/attendanceService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import LivenessChallenge from '../components/camera/LivenessChallenge';
import useFaceRecognition from '../hooks/useFaceRecognition';

const AttendancePage = () => {
  const [step, setStep] = useState(1); // 1: Info, 2: Liveness, 3: Capture, 4: Loading, 5: Result
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [checkingToday, setCheckingToday] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activityId, setActivityId] = useState('');

  const navigate = useNavigate();
  const { generateEmbedding } = useFaceRecognition();
  useAuth();

  useEffect(() => {
    const checkToday = async () => {
      try {
        const [response, activityResponse] = await Promise.all([attendanceService.getToday(), api.get('/activities')]);
        setActivities(activityResponse.data.data.activities || []);
        if (response.data?.sudah_absen && response.data?.attendance) {
          setTodayAttendance(response.data.attendance);
          // If already attended, skip to step 1 which will show the message
        }
      } catch (err) {
        console.error("Failed to check today's attendance", err);
      } finally {
        setCheckingToday(false);
      }
    };
    checkToday();
  }, []);

  const handleLivenessComplete = async ({ imageBase64 }) => {
    setStep(4); // Loading
    setError(null);

    try {
      const embedding = await generateEmbedding(imageBase64);
      const response = await attendanceService.submitAttendance({
        activity_id: Number(activityId),
        foto_absen: imageBase64,
        face_embedding: embedding
      });
      
      if (response.success) {
        setResult(response.data);
        setStep(5);
      } else {
        setError(response.message || 'Gagal mengirim absensi.');
        setStep(1); // Back to start or maybe allow retry
      }
    } catch (err) {
      console.error('Attendance error:', err);
      setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat absensi.');
      setStep(1);
    }
  };

  if (checkingToday) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Already attended today
  if (todayAttendance && step !== 5) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card className="p-8 text-center bg-glass border-glass-border">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-success/20 mb-6">
            <svg className="h-10 w-10 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-heading text-white mb-2">Anda Sudah Absen Hari Ini</h2>
          <p className="text-primary-200 mb-6">
            Status: <span className={todayAttendance.status === 'Hadir' ? 'text-success' : 'text-warning'}>{todayAttendance.status}</span> pada pukul {todayAttendance.waktu_absen}
          </p>
          <Button onClick={() => navigate('/')} variant="primary" size="lg">
            Kembali ke Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 h-full flex flex-col">
      {step === 1 && (
        <Card className="p-8 bg-glass border-glass-border">
          <h1 className="text-3xl font-heading text-white mb-6">Mulai Absensi Harian</h1>
          <label className="block text-primary-200 mb-2">Pilih kegiatan</label>
          <select value={activityId} onChange={(event) => setActivityId(event.target.value)} className="input w-full mb-6">
            <option value="">Pilih kegiatan yang diikuti</option>
            {activities.map((activity) => <option key={activity.id} value={activity.id}>{activity.nama} - {activity.tanggal}</option>)}
          </select>
          
          {error && (
            <div className="bg-danger/20 border border-danger text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <div className="space-y-4 text-primary-200 mb-8">
            <p>Untuk melakukan absensi, Anda akan melewati 2 tahap verifikasi:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li><strong>Liveness Challenge:</strong> Ikuti instruksi gerakan kepala untuk memastikan Anda berada di depan kamera.</li>
              <li><strong>Face Recognition:</strong> Sistem akan mencocokkan wajah Anda dengan data saat registrasi.</li>
            </ol>
            <div className="bg-info/10 border border-info/30 p-4 rounded-lg mt-4">
              <h3 className="text-info font-medium mb-1">Penting:</h3>
              <ul className="list-disc pl-5 text-sm space-y-1">
                <li>Pastikan pencahayaan cukup terang</li>
                <li>Posisikan wajah tepat di tengah kamera</li>
                <li>Batas waktu absensi Hadir adalah 08:00</li>
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4">
            <Button onClick={() => navigate('/')} variant="ghost">Batal</Button>
            <Button onClick={() => activityId && setStep(2)} variant="primary" size="lg" disabled={!activityId}>Mulai Absensi</Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-2xl font-heading text-white">Liveness Challenge</h2>
            <Button onClick={() => setStep(1)} variant="ghost" size="sm">Batal</Button>
          </div>
          <LivenessChallenge onComplete={handleLivenessComplete} />
        </div>
      )}

      {step === 4 && (
        <Card className="p-12 text-center bg-glass border-glass-border my-auto">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mb-6"></div>
          <h2 className="text-2xl font-heading text-white mb-2">Memverifikasi Wajah...</h2>
          <p className="text-primary-200">Mohon tunggu, sedang mencocokkan wajah Anda.</p>
        </Card>
      )}

      {step === 5 && result && (
        <Card className="p-8 text-center bg-glass border-glass-border">
          <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${result.status === 'Hadir' ? 'bg-success/20' : 'bg-warning/20'}`}>
            <svg className={`h-12 w-12 ${result.status === 'Hadir' ? 'text-success' : 'text-warning'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-heading text-white mb-2">Absensi Berhasil!</h2>
          
          <div className="bg-surface-light rounded-lg p-6 max-w-sm mx-auto mb-8 text-left border border-glass-border">
            <div className="flex justify-between py-2 border-b border-glass-border/50">
              <span className="text-primary-300">Tanggal</span>
              <span className="text-white font-medium">
                {new Date(result.attendance?.tanggal || result.tanggal).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-glass-border/50">
              <span className="text-primary-300">Waktu</span>
              <span className="text-white font-medium">{result.attendance?.waktu_absen || result.waktu_absen}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-glass-border/50">
              <span className="text-primary-300">Status</span>
              <span className={`font-medium ${result.attendance?.status === 'Hadir' || result.status === 'Hadir' ? 'text-success' : 'text-warning'}`}>
                {result.attendance?.status || result.status}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-primary-300">Similarity</span>
              <span className="text-white font-medium">{(result.similarity * 100).toFixed(1)}%</span>
            </div>
          </div>
          
          <Button onClick={() => navigate('/')} variant="primary" size="lg">
            Selesai
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AttendancePage;
