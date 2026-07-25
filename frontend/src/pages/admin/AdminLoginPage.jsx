import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AdminLoginPage = () => {
  const [formData, setFormData] = useState({
    nim: '',
    password: ''
  });
  
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await adminLogin(formData.nim, formData.password);
      if (response.success) {
        navigate('/admin');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message || 'Gagal login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Admin specific background elements */}
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-danger/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full bg-warning/20 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-warning/30 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            <span className="text-warning text-xs font-bold tracking-wider uppercase">Universitas Langlangbuana Bandung</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-danger to-warning mb-4 shadow-lg shadow-danger/20">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-heading font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-primary-300 mt-2">Sistem Absensi KKN</p>
          </div>
        </div>
        
        <Card className="p-8 border-glass-border bg-surface/80 backdrop-blur-xl">
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-danger/10 border border-danger/30 text-danger text-sm flex items-start">
              <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Username Admin"
              name="nim"
              value={formData.nim}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full mt-2 bg-gradient-to-r from-danger to-warning hover:from-danger hover:to-orange-500 border-none text-white shadow-lg shadow-danger/20"
              loading={loading}
            >
              Login Admin
            </Button>
          </form>
          
          <div className="mt-8 text-center text-sm text-primary-400">
            <Link to="/login" className="hover:text-white transition-colors flex items-center justify-center">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kembali ke Login Peserta
            </Link>
          </div>
        </Card>

        {/* Bottom Developer Credit */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-white/40 text-xs font-medium">
            Universitas Langlangbuana Bandung
          </p>
          <p className="text-white/20 text-[11px] font-mono">
            Development by <strong className="text-warning font-semibold">KingFaisal</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
