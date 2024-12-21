'use client';
import React, { useState } from "react"; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Swal from 'sweetalert2'; 
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const LoginAdmin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(''); // Inisialisasi state error
    const [showPopup, setShowPopup] = useState(false); 
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false); 

    // Fungsi untuk toggle tampilan sandi
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Mencegah form dari reload halaman
    
        // Email dan password yang sudah ditentukan
        const adminEmail = "admin";
        const adminPassword = "admin123";
    
        // Memeriksa apakah input sesuai dengan kredensial admin
        if (email === adminEmail && password === adminPassword) {
            try {
                // Di sini Anda bisa menambahkan logika untuk menyimpan status login
                // Misalnya, menggunakan localStorage atau state management seperti Redux
                localStorage.setItem('isAdminLoggedIn', 'true');
    
                // Tampilkan pesan sukses
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil',
                    text: 'Selamat datang, Admin!',
                });
    
                // Redirect ke halaman admin
                router.push('/admin/dashboard'); // Sesuaikan dengan route admin Anda
            } catch (error) {
                console.error("Error during login:", error);
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Terjadi kesalahan saat login. Silakan coba lagi.',
                });
            }
        } else {
            // Jika kredensial tidak sesuai
            Swal.fire({
                icon: 'error',
                title: 'Login Gagal',
                text: 'Email atau password salah. Silakan coba lagi.',
            });
        }
    };

    return (
        <div className="flex h-screen w-screen">
            <img 
                src="/images/ellipse.svg" 
                alt="elips" 
                className="absolute inset-y-0 right-0 hidden laptop:block laptop:h-full"
            />

            <img 
                src="/images/mobilelock.png" 
                alt="mobile lock" 
                className="w-48 h-44 mx-auto object-contain mt-5 laptop:mr-20 laptop:relative laptop:h-full laptop:w-1/4 tablet:hidden laptop:block"
            />
            
            <div className="absolute inset-x-0 -bottom-4 p-1 laptop:max-w-96 laptop:p-7 bg-powderBlue shadow-md rounded-[25px] w-full h-3/4 tablet:w-3/4  tablet:inset-0 tablet:mx-auto tablet:my-auto laptop:ml-48 laptop:h-1/2">
            
                <h2 className="text-3xl font-bold mb-4 text-black text-center my-8 tablet:my-10 laptop:my-3">Login Admin</h2>
                <form className="space-y-4 mt-12 mobile:mx-4 tablet:mx-10 laptop:mb-5" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='email' className="block text-sm font-medium text-black">Alamat Email</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor='password' className="block text-sm font-medium text-black">Kata Sandi</label>
                        <div className="relative"> 
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                        <span
                            className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                            onClick={togglePasswordVisibility} // Menambahkan event handler untuk toggle
                        >
                            {showPassword ? (
                        <FaRegEyeSlash className="w-5 h-5" />
                    ) : (
                        <FaRegEye className="w-5 h-5" />
                    )}
                        </span>
                    </div>
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-deepBlue text-putih py-2 px-10 rounded-2xl shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mt-20 laptop:mt-4">
                            Login
                        </button>
                    </div>
                </form>
            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold">Login Berhasil!</h3>
                        <p className="mt-2">Selamat! Anda berhasil login.</p>
                    </div>
                </div>
            )}
            {/* Img 2 - Kanan */}
            <div className="lg:block relative">
            
            </div>
        </div>
    );
};

export default LoginAdmin;