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

const Login = () => {
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
        e.preventDefault();
        setError(''); // Reset error sebelum mencoba login
    
        try {
            const response = await fetch(`https://${URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password 
                }),
            });
    
            // Dapatkan data respons
            const data = await response.json();
    
            // Periksa apakah respons tidak ok
            if (!response.ok) {
                // Tangani kesalahan berdasarkan status
                if (response.status === 400) {
                    throw new Error(data.error || 'Data yang Anda masukkan tidak valid.');
                } else if (response.status === 401) {
                    throw new Error('Kredensial tidak valid. Silakan coba lagi.');
                } else if (response.status === 403) {
                    throw new Error('Akses sebagai Author ditolak. Anda tidak memiliki hak akses, pastikan anda telah mengirimkan persyaratan yang dibutuhkan, dan tunggu sampai admin memverifikasi.');
                    router.push('/auth/syarat');
                } else {
                    throw new Error('Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
                }
            }
    
            console.log("Login berhasil:", data);
            localStorage.setItem('token', data.token);
            
            // Redirect berdasarkan role
            if (data.user.role === 'AUTHOR') {
                router.push('/author/dashboard'); // Ganti dengan jalur dashboard author
            } else {
                router.push('/user/dashboard'); // Ganti dengan jalur dashboard user
            }
        } catch (err) {
            console.error("Kesalahan login", err);
    
            // Menampilkan pesan kesalahan sebagai popup
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: err.message, 
            }).then(() => {
                
            });
    
            setError(err.message); // Simpan pesan error di state (opsional, jika perlu)
        }
    };

    return (
        <div className="relative min-h-screen flex items-center bg-white ">
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', padding: '20px' }}></div>

            <div className="absolute lg:right-1/2  lg:top-1/2 transform lg:-translate-y-1/2 w-full  max-w-screen p-4 lg:max-w-sm lg:p-8 bg-powderBlue shadow-md rounded-3xl ml-0 lg:ml-20">
                <h2 className="text-3xl font-bold mb-6 text-black text-center">Login</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
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
                            className="bg-deepBlue text-putih py-2 px-10 rounded-2xl shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                            Login
                        </button>
                    </div>
                    <p className="text-center mt-4 text-sm">
                        Belum memiliki akun? <Link href="/auth/registrasi" className="text-white font-bold hover:underline">Daftar</Link>
                    </p>
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
            <div className="hidden lg:block relative">
            <img 
                src="/images/ellipse.png" 
                alt="elips" 
                className="hidden lg:block lg:max-h-screen object-contain"
            />
            <img 
                src="/images/mobilelock.png" 
                alt="mobile lock" 
                className="absolute lg:top-1/2 lg:left-1/2 lg:transform lg:-translate-x-1/2 lg:-translate-y-1/2 lg:max-h-screen object-contain top-[-10%] left-1/2 transform -translate-x-1/2 max-h-20 z-10"
            />
            </div>
        </div>
    );
};

export default Login;