import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getAuth, applyActionCode } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Inisialisasi Firebase (pastikan ini sesuai dengan konfigurasi Anda)
const firebaseConfig = {
  // Konfigurasi Firebase Anda
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default function VerifyEmail() {
  const [verificationStatus, setVerificationStatus] = useState('Memverifikasi...');
  const router = useRouter();

  useEffect(() => {
    const { oobCode } = router.query;

    if (oobCode) {
      applyActionCode(auth, oobCode)
        .then(() => {
          setVerificationStatus('Email berhasil diverifikasi!');
          // Tambahkan logika tambahan di sini, misalnya redirect setelah beberapa detik
          setTimeout(() => router.push('/dashboard'), 5000);
        })
        .catch((error) => {
          setVerificationStatus('Verifikasi gagal: ' + error.message);
        });
    }
  }, [router.query]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Verifikasi Email</h1>
        <p className="text-lg">{verificationStatus}</p>
        {verificationStatus === 'Email berhasil diverifikasi!' && (
          <p className="mt-4 text-sm text-gray-600">
            Anda akan diarahkan ke dashboard dalam beberapa detik...
          </p>
        )}
      </div>
    </div>
  );
}