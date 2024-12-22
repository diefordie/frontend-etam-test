'use client';
import { useRouter } from 'next/navigation';
import { RiVerifiedBadgeFill } from "react-icons/ri";

const EmailVerification = () => {
    const router = useRouter();

    const handleButtonClick = () => {
        try {
            router.push('/auth/login');
        } catch (error) {
            console.error("Failed to navigate:", error);
        }
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center bg-white px-4 sm:px-6 lg:px-8">
            {/* Gambar Latar */}
            <img 
                src="/images/polygon.png" 
                alt="Polygon Background" 
                className="absolute inset-0 w-full h-full object-cover lg:object-contain lg:object-left"
            />

            {/* Konten */}
            <div className="relative w-full max-w-sm bg-powderBlue shadow-md rounded-3xl p-6 sm:p-8 mt-24 md:mt-0 mobile:mt-12 mobile:w-3/4">
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
            </div>

        
        </div>
    );
};

export default EmailVerification;