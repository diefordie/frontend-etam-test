'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const ForgotPassword = () => {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');
    
        try {
            const response = await fetch('http://localhost:2000/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                setMessage(data.message);
                // Opsional: redirect ke halaman login setelah beberapa detik
                setTimeout(() => router.push('/auth/login'), 3000);
            } else {
                setMessage(data.message || 'An error occurred');
            }
        } catch (error) {
            console.error("Failed to send forgot password request:", error);
            setMessage('Failed to send request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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
                <h2 className="text-2xl font-bold text-center text-black mb-4">Masukkan Email Anda</h2>
                <form className="space-y-4 mt-6 mobile:mx-4 tablet:mx-1 laptop:mb-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='email' className="block text-sm font-medium text-black">Alamat Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder='Masukkan Email Anda'
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
                            {isLoading ? 'Mengirim...' : 'Selesai'}
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
};

export default ForgotPassword;