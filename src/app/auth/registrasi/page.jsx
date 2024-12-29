'use client';
import React, { useState } from "react"; 
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import dotenv from 'dotenv';
import Swal from 'sweetalert2'; 
import { data } from "autoprefixer";

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const Registrasi = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('');
    const [showPopup, setShowPopup] = useState(); 
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false); 
    const [dropdownVisible, setDropdownVisible] = useState(false);    


    // Fungsi untuk toggle tampilan sandi
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    };

    const handleSelectRole = (selectedRole) => {
        setRole(selectedRole);
        setDropdownVisible(false);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!name.trim() || !email.trim() || !password.trim() || !role.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Form Kosong',
                text: 'Harap isi data diri anda untuk melakukan registrasi',
                confirmButtonText: 'OK',
            });
            return;
        }
    
        try {
            const response = await fetch(`https://${URL}/auth/registrasi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    role: role.toUpperCase(),
                }),
            });
    
            const data = await response.json();
    
            if (!response.ok) {
                if (response.status === 400 && data.errors) {
                    const errorMessages = data.errors.map(err => `<p>${err.msg}</p>`).join('');
                    Swal.fire({
                        icon: 'error',
                        title: 'Terjadi Kesalahan',
                        html: errorMessages,
                        confirmButtonText: 'OK',
                    });
                } else {
                    const errorMessage = data.message || 'Terjadi kesalahan. Silakan coba lagi.';
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: errorMessage,
                        confirmButtonText: 'OK',
                    });
                }
                return;
            }
    
            Swal.fire({
                icon: 'success',
                title: 'Registrasi Berhasil',
                text: 'Akun Anda berhasil didaftarkan!. Silahkan cek email anda untuk lakukan konfirmasi',
                confirmButtonText: 'OK',
            }).then(() => {
                if (role === 'AUTHOR') {
                    router.push('/auth/syarat');
                } else {
                    router.push('/auth/login');
                }
            });
        } catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error("Kesalahan registrasi", err);
            }
            Swal.fire({
                icon: 'error',
                title: 'Kesalahan',
                text: err.message || 'Terjadi kesalahan pada sistem.',
                confirmButtonText: 'OK',
            });
        }
    };
    
    
    return (
        <div className="flex h-screen w-screen">
            <img 
                src="/images/polygon.png" 
                alt="Img 1" 
                className="w-full md:w-auto h-screen object-contain object-left mobile:hidden tablet:block laptop:w-1/2"
            />

            <img 
                src="/images/mobilepassword.png" 
                alt="Img 2" 
                className="w-full max-w-xs h-auto object-contain mx-10 mt-5 mobile:absolute tablet:hidden laptop:block laptop:mr-0 laptop:my-48 laptop:relative laptop:max-h-full laptop:max-w-full"
            />
            <div className="absolute inset-x-0 -bottom-4 p-1 laptop:max-w-96 laptop:p-7 bg-powderBlue shadow-md rounded-[25px] w-full h-3/4 tablet:w-3/4  tablet:inset-0 tablet:mx-auto tablet:my-auto laptop:ml-48 laptop:h-[580px]">
                <h2 className="text-3xl font-bold mb-6 text-black text-center my-8 tablet:my-10 laptop:my-5">Daftar</h2>
                <form className="space-y-4 mobile:mx-4 tablet:mx-10 laptop:mb-5 laptop:mx-3" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor='name' className="block text-sm font-medium text-black">Nama:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Contoh: John Doe"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor='email' className="block text-sm font-medium text-black">Alamat Email</label>
                        <input
                            type="text"
                            id="email"
                            name="email"
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Contoh: JohnDoe@example.com"
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
                            placeholder="Contoh: 1234"
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        />
                            <span
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 cursor-pointer"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEye /> : <FaEyeSlash />}
                            </span>
                    </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="role" className="block text-sm font-medium text-black">Role</label>
                        <div className="relative">
                            {/* Form input dengan warna putih */}
                            <div
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-2xl shadow-sm bg-white cursor-pointer focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                onClick={toggleDropdown} // Men-toggle dropdown saat diklik
                            >
                                {role ? role : 'Pilih Role'} {/* Menampilkan role yang dipilih atau teks default */}
                                <span className="absolute inset-y-0 right-3 flex items-center text-gray-500 pointer-events-none">
                                    <MdOutlineKeyboardArrowDown size={20} />
                                </span>
                            </div>
                        </div>
                    </div>

                     {/* Menampilkan pilihan role setelah dropdown visible */}
                        {dropdownVisible && (
                            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-2xl shadow-lg mt-1">
                                <div
                                    className="cursor-pointer px-3 py-2 hover:bg-gray-200"
                                    onClick={() => handleSelectRole('AUTHOR')}
                                >
                                    Author
                                </div>
                                <div
                                    className="cursor-pointer px-3 py-2 hover:bg-gray-200"
                                    onClick={() => handleSelectRole('USER')}
                                >
                                    User
                                </div>
                            </div>
                        )}

                    <div className="flex justify-center">
                        <button
                            type="submit"
                            className="bg-deepBlue text-putih py-2 px-10 rounded-2xl shadow-sm hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                            Kirim
                        </button>
                    </div>
                    <p className="text-center mt-4 text-sm">
                        Sudah memiliki akun? <Link href="/auth/login" className="text-white font-bold hover:underline">Login</Link>
                    </p>
                </form>
            </div>

            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-xl font-bold">Akun Anda Berhasil Didaftarkan!</h3>
                        <p className="mt-2">Silahkan Cek Email Yang Kamu Daftarkan Untuk Melakukan Verifikasi!.</p>
                    </div>
                </div>
            )}
            
           
         </div>
    );
};

export default Registrasi;