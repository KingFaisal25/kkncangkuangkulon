import React from 'react';
import { Link } from 'react-router';
import Button from '../components/ui/Button';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 mb-4">404</h1>
        <h2 className="text-3xl font-heading text-white mb-6">Halaman Tidak Ditemukan</h2>
        <p className="text-primary-300 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ada atau telah dipindahkan.
        </p>
        <Link to="/">
          <Button variant="primary" size="lg">
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
