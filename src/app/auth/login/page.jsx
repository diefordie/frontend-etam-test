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

            
        // Validasi input kosong
        if (!email && !password) {
            Swal.fire({
                icon: 'warning',
                title: 'Form Tidak Lengkap',
                text: 'Email dan password tidak boleh kosong!',
            });
            return;
        }
        if (!email) {
            Swal.fire({
                icon: 'warning',
                title: 'Email Kosong',
                text: 'Silakan masukkan email Anda.',
            });
            return;
        }
        if (!password) {
            Swal.fire({
                icon: 'warning',
                title: 'Password Kosong',
                text: 'Silakan masukkan password Anda.',
            });
            return;
        }

        setError(''); 
    
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
    
            if (!response.ok) {
                // Menambahkan pengecekan untuk kesalahan "User Not Found"
                if (response.status === 404) {
                    throw new Error('Akun Anda tidak ditemukan. Pastikan email yang Anda masukkan sudah benar.');
                }
                if (response.status === 400) {
                    throw new Error(data.error || 'Data yang Anda masukkan tidak valid.');
                } else if (response.status === 401) {
                    throw new Error('Password atau email Anda salah. Silakan coba lagi.');
                } else if (response.status === 403) {
                    throw new Error('Akses sebagai Author ditolak. Anda tidak memiliki hak akses, pastikan anda telah mengirimkan persyaratan yang dibutuhkan, dan tunggu sampai admin memverifikasi.');
                    router.push('/auth/syarat');
                } else {
                    throw new Error('Terjadi kesalahan yang tidak diketahui. Silakan coba lagi.');
                }
            }
            localStorage.setItem('token', data.token);
            
            Swal.fire({
                icon: 'success',
                title: 'Login Berhasil',
                text: 'Anda berhasil masuk ke akun Anda.',
                showConfirmButton: false,
                timer: 1500
            }).then(() => {
                // Redirect berdasarkan role
                if (data.user.role === 'AUTHOR') {
                    router.push('/author/dashboard');
                } else {
                    router.push('/user/dashboard');
                }
            });

            
            
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
            
            <div className="absolute inset-x-0 -bottom-4 p-1 laptop:max-w-96 laptop:p-7 bg-powderBlue shadow-md rounded-[25px] w-full h-3/4 tablet:w-3/4  tablet:inset-0 tablet:mx-auto tablet:my-auto laptop:ml-48 laptop:h-[500px]">
                <h2 className="text-3xl font-bold mb-4 text-black text-center my-8 tablet:my-10 laptop:my-3">Login</h2>
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
                    <p className="text-right mt-4 text-xs">
                        <Link href="/auth/login/forgot-password" className="text-black  hover:underline">Lupa Password</Link>
                    </p>
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-deepBlue text-putih py-2 px-10 rounded-2xl shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black mt-20 laptop:mt-4">
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
            <div className="lg:block relative">
            
            </div>
        </div>
    );
};

export default Login;