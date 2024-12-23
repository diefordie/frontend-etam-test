'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { RiVerifiedBadgeFill } from "react-icons/ri";
import { useEffect, useState, Suspense } from 'react';
import { auth } from '@/app/firebase/config';
import { applyActionCode, confirmPasswordReset } from "firebase/auth";

import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

function EmailVerificationContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('pending');
    const [message, setMessage] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    useEffect(() => {
        if (!oobCode) {
            setStatus('error');
            setMessage('Invalid verification code');
            return;
        }

        if (mode === 'verifyEmail') {
            verifyEmail();
        } else if (mode === 'resetPassword') {
            setStatus('resetPassword');
        } else {
            setStatus('error');
            setMessage('Invalid mode');
        }
    }, [mode, oobCode]);

    const verifyEmail = async () => {
        try {
            await applyActionCode(auth, oobCode);
            setStatus('success');
            setMessage('Email verified successfully');
        } catch (error) {
            console.error("Verification failed:", error);
            setStatus('error');
            setMessage('Email verification failed');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setMessage('Password anda tidak sama');
            return;
        }
        if (newPassword.length < 8) {
            setMessage('Password harus memiliki minimal 8 karakter');
            return;
        }
        setIsLoading(true);
        try {
            const response = await fetch(`https://${URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ oobCode, newPassword }),
            });

            const data = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Password reset successfully');
                setTimeout(() => router.push('/auth/login'), 3000);
            } else {
                setStatus('error');
                setMessage(data.message || 'Password reset failed');
            }
        } catch (error) {
            console.error("Password reset failed:", error);
            setStatus('error');
            setMessage('Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (status === 'pending') {
        return <p className="text-center">Loading...</p>;
    }

    if (status === 'resetPassword') {
        return (
            
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
            {/* Gambar Latar */}
            <img 
                src="/images/polygon.png" 
                alt="Polygon Background" 
                className="absolute inset-0 w-full h-full object-cover lg:object-contain lg:object-left hidden lg:block"
            />

            {/* Gambar Mobile & Tablet */}
            <div className="absolute top-6 left-0 right-0 mx-auto md:top-12 lg:hidden">
                <img 
                    src="/images/mobilepassword.png" 
                    alt="Img 2" 
                    className="w-full max-w-xs h-auto object-contain mx-auto"
                />
            </div>

            {/* Konten */}
            <div className="relative w-full max-w-sm bg-powderBlue shadow-md rounded-3xl p-6 sm:p-8 mt-24 md:mt-0">
                <h2 className="text-2xl font-bold text-center text-black mb-4">Reset Password</h2>
                <form className="space-y-4 mt-6 mobile:mx-4 tablet:mx-1 laptop:mb-5" onSubmit={handleResetPassword}>
                    <div>
                        <label htmlFor='newPassword' className="block text-sm font-medium text-black">Password Baru</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder='Masukkan Password Baru Anda'
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            required
                        />
                        <label htmlFor='confirmPassword' className="block text-sm font-medium text-black mt-5">Konfirmasi Password Anda</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder='Masukkan Konfirmasi Password Anda'
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                            required
                        />
                    </div>
                    <div className="flex justify-center mt-6">
                        <button
                            type="submit"
                            className="bg-deepBlue hover:bg-paleBlue text-white py-2 px-4 rounded-2xl text-sm sm:text-base font-medium"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Loading...' : 'Reset Password'}
                        </button>
                    </div>
                </form>
                {message && <p className="mt-4 text-center text-sm text-red-600">{message}</p>}
            </div>

            {/* Gambar Kanan pada Desktop */}
            <div className="hidden lg:block absolute right-20 top-1/2 transform -translate-y-1/2">
                <img 
                    src="/images/mobilepassword.png" 
                    alt="Img 2" 
                    className="w-80 h-auto object-contain"
                />
            </div>
        </div>
        );
    }

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
            <img 
                src="/images/polygon.png" 
                alt="Polygon Background" 
                className="absolute inset-0 w-full h-full object-cover lg:object-contain lg:object-left"
            />
    
            <div className="relative w-full max-w-sm bg-powderBlue shadow-md rounded-3xl p-6 sm:p-8 mt-24 md:mt-0 mobile:mt-12 mobile:w-3/4">
                {status === 'success' && (
                    <>
                        <RiVerifiedBadgeFill className="laptop:text-9xl text-6xl text-deepBlue mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-center text-black mb-4">
                            {mode === 'verifyEmail' ? 'Email Verified!' : 'Password Reset Successful!'}
                        </h2>
                        <p className="text-sm sm:text-base mt-4 text-center">{message}</p>
                        <div className="flex justify-center mt-6">
                            <button
                                type="button"
                                onClick={() => router.push('/auth/login')}
                                className="bg-deepBlue hover:bg-paleBlue text-white py-2 px-4 rounded-2xl text-sm sm:text-base font-medium w-32">
                                Login
                            </button>
                        </div>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <h2 className="text-2xl font-bold text-center text-black mb-4">Error</h2>
                        <p className="text-sm sm:text-base mt-4 text-center">{message}</p>
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