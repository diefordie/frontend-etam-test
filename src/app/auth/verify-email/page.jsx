'use client';

import { useRouter } from 'next/navigation';
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useEffect, useState, Suspense } from 'react';
import { auth } from '@/app/firebase/config';
import { applyActionCode } from "firebase/auth";
import { useSearchParams } from 'next/navigation';

function EmailVerificationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState('pending');

    useEffect(() => {
        const verifyEmail = async () => {
            const oobCode = searchParams.get('oobCode');
            if (oobCode && oobCode !== 'code') {
                try {
                    await applyActionCode(auth, oobCode);
                    setVerificationStatus('success');
                } catch (error) {
                    console.error("Verification failed:", error);
                    setVerificationStatus('failed');
                }
            } else {
                setVerificationStatus('no-code');
            }
        };
    
        verifyEmail();
    }, [searchParams]);

    const handleButtonClick = () => {
        router.push('/auth/login');
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
            <img 
                src="/images/polygon.png" 
                alt="Polygon Background" 
                className="absolute inset-0 w-full h-full object-cover lg:object-contain lg:object-left"
            />
    
            <div className="relative w-full max-w-sm bg-powderBlue shadow-md rounded-3xl p-6 sm:p-8 mt-24 md:mt-0 mobile:mt-12 mobile:w-3/4">
                {verificationStatus === 'pending' && (
                    <p className="text-sm sm:text-base mt-4 text-center">Memverifikasi email Anda...</p>
                )}
                {verificationStatus === 'success' && (
                    <>
                        <RiVerifiedBadgeFill className="laptop:text-9xl text-6xl text-deepBlue mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-center text-black mb-4">Congratulations!</h2>
                        <p className="text-sm sm:text-base mt-4 text-center">
                            Akun anda telah berhasil ter-verifikasi, silakan masuk ke akun anda, dan mulai menjelajah!
                        </p>
                        <div className="flex justify-center mt-6">
                            <button
                                type="button"
                                onClick={handleButtonClick}
                                className="bg-deepBlue hover:bg-paleBlue text-white py-2 px-4 rounded-2xl text-sm sm:text-base font-medium w-32">
                                Login
                            </button>
                        </div>
                    </>
                )}
                {verificationStatus === 'failed' && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-black mb-4">Verifikasi Gagal</h2>
                        <p className="text-sm sm:text-base mt-4 text-center">
                            Maaf, verifikasi email Anda gagal. Silakan coba lagi atau hubungi dukungan.
                        </p>
                    </>
                )}
                {verificationStatus === 'no-code' && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-black mb-4">Kode Verifikasi Tidak Ditemukan</h2>
                        <p className="text-sm sm:text-base mt-4 text-center">
                            Tidak ada kode verifikasi yang valid ditemukan. Pastikan Anda menggunakan link yang benar.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="text-center">Loading...</div>}>
            <EmailVerificationContent />
        </Suspense>
    );
}