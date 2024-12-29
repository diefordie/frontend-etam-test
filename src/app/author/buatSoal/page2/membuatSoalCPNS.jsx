'use client';

import React, { useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage } from "../../../firebase/config";
import { v4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AiOutlineCloseSquare } from 'react-icons/ai';
import { IoMdArrowRoundBack } from "react-icons/io";
import { BsImage } from 'react-icons/bs';
import Swal from 'sweetalert2'; 
import dynamic from 'next/dynamic';
const ReactQuill = dynamic(() => import('react-quill'), {ssr: false});
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const MembuatSoalCPNS = () => {
  const router = useRouter();
  const [testId, setTestId] = useState('');
  const [category, setCategory] = useState('');
  const [multiplechoiceId, setMultiplechoiceId] = useState('');
  const [pageName, setPageName] = useState('');
  const [question, setQuestion] = useState('');
  const [number, setNumber] = useState('');
  const [questionPhoto, setQuestionPhoto] = useState(null);
  const [weight, setWeight] = useState();
  const [discussion, setDiscussion] = useState('');
  const [options, setOptions] = useState(
    Array(5).fill({ 
      optionDescription: '', 
      optionPhoto: null, 
      points: '', 
      isCorrect: false 
    })
  );
  const [isOptionWeighted, setIsOptionWeighted] = useState(false);
  const [pages, setPages] = useState([{ questions: [] }]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('buattes');
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const testIdFromUrl = params.get("testId");
    const categoryFromUrl = params.get("category");
    const multiplechoiceIdFromUrl = params.get("multiplechoiceId");
    const pageNameFromUrl = params.get("pageName");
    const numberFromUrl = params.get("nomor");

    if (pageNameFromUrl) {
      const decodedPageName = decodeURIComponent(pageNameFromUrl);
      console.log("Decoded pageName:", decodedPageName);
      setPageName(decodedPageName);
    }
    if (testIdFromUrl) {
      setTestId(testIdFromUrl);
    }
    if (categoryFromUrl) {
      setCategory(categoryFromUrl);      
    }
    if (multiplechoiceIdFromUrl) {
      setMultiplechoiceId(multiplechoiceIdFromUrl); 
      console.log('multiplechoiceId type:', typeof multiplechoiceIdFromUrl);
      console.log('multiplechoiceId value:', multiplechoiceIdFromUrl);
    }
    if (numberFromUrl) setNumber(numberFromUrl);
  }, []);

  useEffect(() => {
    if (!multiplechoiceId) return;
    const fetchData = async () => {
      try {
        const response = await fetch(`https://${URL}/api/multiplechoice/question/${multiplechoiceId}`);
        if (!response.ok) {
          const errorMessage = await response.text(); 
          throw new Error(`Error: ${response.status} - ${errorMessage}`);
        }
        const data = await response.json();
        console.log('Response dari API:', data);
        // setPageName(data.pageName);
        setWeight(data.weight);
        setNumber(data.number);
        setQuestion(data.question);
        setOptions(data.option);
        setIsOptionWeighted(data.isWeighted);
        setDiscussion(data.discussion);
        if (data.questionPhoto && data.questionPhoto !== "") {
          setQuestionPhoto(data.questionPhoto);
        } else {
          setQuestionPhoto(null);
        }

        if (data.option && Array.isArray(data.option)) {
          setOptions(data.option.map(opt => ({
            id: opt.id,
            optionDescription: opt.optionDescription,
            optionPhoto: opt.optionPhoto || null,
            points: parseFloat(opt.points), 
            isCorrect: opt.isCorrect,
          })));
        }
      } catch (error) {
        console.error('Error fetching question:', error);
        setError('Terjadi kesalahan saat memuat data: ' + error.message);
      }
    };
  
    fetchData();
  }, [multiplechoiceId]);
  
  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { 
        optionDescription: '', 
        optionPhoto: null,
        points: ''
        // isCorrect: false 
      }]);
    }
  };

  // Fungsi untuk menangani perubahan kategori
  const handleKategoriChange = (event) => {
    const selectedKategori = event.target.value;
    setKategori(selectedKategori);

    // Jika kategori adalah TKP, munculkan 5 opsi
    if (selectedKategori === "TKP") {
      setOptions(["Opsi 1", "Opsi 2", "Opsi 3", "Opsi 4", "Opsi 5"]);
    } else {
      setOptions([]); // Kosongkan opsi jika kategori lain dipilih
    }
  };

  const handleOptionChange = async (index, content, type) => {
    try {
      const newOptions = [...options]; // Salin array opsi
      const currentOption = { ...newOptions[index] }; // Salin objek opsi tertentu
  
      switch (type) {
        case 'text':
          currentOption.optionDescription = content || '';
          currentOption.optionPhoto = null;
          break;
  
        case 'image':
          try {
            const imageRef = ref(storage, `options/${content.name + v4()}`);
            const snapshot = await uploadBytes(imageRef, content);
            const imageUrl = await getDownloadURL(snapshot.ref);
            currentOption.optionDescription = '';
            currentOption.optionPhoto = imageUrl;
          } catch (error) {
            console.error('Error uploading image:', error);
            return; // Keluar jika terjadi error saat upload
          }
          break;
  
        case 'points':
          if (!isNaN(content) && content >= 0) {
            currentOption.points = parseInt(content, 10);
          } else {
            console.warn('Invalid points value:', content);
            currentOption.points = 0; // Default jika input invalid
          }
          break;
  
        default:
          console.warn('Unknown type:', type);
      }
  
      newOptions[index] = currentOption; // Update opsi pada indeks tertentu
      setOptions(newOptions); // Update state
    } catch (error) {
      console.error('Error handling option change:', error);
    }
  };
   

  const renderOptionContent = (option, index) => {
    if (option.optionPhoto) {
      return (
        <div className="relative">
          <img 
            src={option.optionPhoto} 
            alt={`Option ${index + 1}`} 
            className="max-w-full h-auto"
          />
          <button
            type="button"
            onClick={() => handleOptionChange(index, '', 'text')}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded"
          >
            <AiOutlineCloseSquare className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return (
      <div className="relative w-full">
        <textarea
          value={option.optionDescription}
          onChange={(e) => handleOptionChange(index, e.target.value, 'text')}
          className="w-full p-2 border rounded min-h-[100px]"
          placeholder="Tulis opsi jawaban atau masukkan gambar..."
        />
        <button
          type="button"
          onClick={() => document.getElementById(`optionInput-${index}`).click()}
          className="absolute bottom-2 right-2 bg-gray-100 p-2 rounded"
        >
          <BsImage className="w-5 h-5" />
        </button>
        <input
          id={`optionInput-${index}`}
          type="file"
          hidden
          accept="image/*"
          onChange={(e) => handleOptionChange(index, e.target.files[0], 'image')}
        />
      </div>
    );
  };
    
  const loadPagesFromLocalStorage = () => {
    if (testId && typeof window !== 'undefined') {
      const savedPages = localStorage.getItem(`pages_${testId}`);
      if (savedPages) {
        return JSON.parse(savedPages);
      }
    }
    return null;
  };

  useEffect(() => {
    const savedPages = loadPagesFromLocalStorage();
    if (savedPages) {
        setPages(savedPages);
    }
  }, [testId]); 

  const handleDelete = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus soal ini?")) {
      try {
        const localStorageKey = `pages-${testId}`;
        
        if (multiplechoiceId && multiplechoiceId !== "null") {
          const response = await fetch(`https://${URL}/api/multiplechoice/question/${multiplechoiceId}`, {
            method: 'DELETE',
          });
  
          if (!response.ok) {
            throw new Error('Gagal menghapus soal dari database');
          }
        }

        const savedPages = localStorage.getItem(localStorageKey);
        console.log('Data sebelum dihapus:', savedPages);
  
        if (savedPages) {
          let pages = JSON.parse(savedPages);
          let deletedNumber = null;
          let deletedPageIndex = -1;

          pages.forEach((page, pageIndex) => {
            const questionIndex = page.questions.indexOf(parseInt(number));
            if (questionIndex !== -1) {
              deletedNumber = parseInt(number);
              deletedPageIndex = pageIndex;
              page.questions.splice(questionIndex, 1);
            }
          });
  
          console.log('Nomor yang dihapus:', deletedNumber); 
          console.log('Data setelah splice:', pages); 

          if (deletedNumber !== null) {
            const allNumbers = pages.reduce((acc, page) => [...acc, ...page.questions], []);
            console.log('Semua nomor setelah flatten:', allNumbers); 

            pages = pages.map(page => ({
              ...page,
              questions: page.questions.map(num => 
                num > deletedNumber ? num - 1 : num
              ).sort((a, b) => a - b)
            }));
  
            console.log('Data setelah reorder:', pages); 
            pages = pages.filter(page => page.questions.length > 0);
            localStorage.setItem(localStorageKey, JSON.stringify(pages));   
            console.log('Data final yang disimpan:', pages); 
          }
        }

        router.push(`/author/buatSoal?testId=${testId}`);
        
      } catch (error) {
        console.error('Error saat menghapus soal:', error);
        alert('Terjadi kesalahan saat menghapus soal. Silakan coba lagi.');
      }
    }
  };

  const handleDeleteJawaban = async (index, optionId) => {
    const updatedOptions = options.filter((_, i) => i !== index);
    setOptions(updatedOptions);

    try {
      if (optionId) {
        const response = await fetch(`https://${URL}/api/multiplechoice/option/${optionId}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) {
            console.error('Failed to delete option:', response.statusText);
        } else {
          console.log('Opsi berhasil dihapus dari server');
        } 
      }
    } catch (error) {
        console.error('Error deleting option:', error);
    }
  };
  
  const handleBack = () => {
    if (testId) {
      router.push(`/author/buatSoal?testId=${testId}&category=${category}`);
    } else {
      console.error('Test ID tidak ditemukan dalam respons:', result);
    }
  };

  const validateForm = () => {
    const validationErrors = [];

    if (!question.trim()) {
      validationErrors.push("Soal wajib diisi");
    }
    if (options.length < 2) {
      validationErrors.push("Minimal harus ada 2 opsi jawaban");
    } else if (options.length > 5) {
      validationErrors.push("Jumlah opsi jawaban tidak boleh lebih dari 5");
    } else {
      options.forEach((option, index) => {
        if (!option.optionDescription.trim() && !option.optionPhoto) {
          validationErrors.push(`Opsi ${index + 1} harus memiliki deskripsi atau foto`);
        }
        if (!option.points || option.points < 1 || option.points > 5) {
          validationErrors.push(`Bobot pada opsi ${index + 1} harus diisi dan berada dalam rentang 1–5`);
        }
      });

      const uniquePoints = new Set(options.map(option => option.points));
      if (uniquePoints.size !== options.length) {
        validationErrors.push("Tidak boleh ada opsi dengan bobot (points) yang sama");
      }
    }
    if (!discussion.trim()) {
      validationErrors.push("Pembahasan wajib diisi");
    }
    if (!number || isNaN(number) || number <= 0) {
      validationErrors.push("Nomor soal harus diisi dengan angka valid");
    }

    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors,
    };
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const valid = validateForm();
  
    if (!valid.isValid) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal Membuat Soal',
        html: valid.errors.map(error => `• ${error}`).join('<br>'),
        confirmButtonText: 'OK',
        confirmButtonColor: '#0B61AA',
      });
      return;
    }

    const duplicatePoints = options.some((option, index) => 
      options.findIndex(o => o.points === option.points) !== index
    );
  
    if (duplicatePoints) {
      Swal.fire({
        icon: 'error',
        title: 'Duplikasi Bobot',
        text: 'Nilai bobot tidak boleh sama pada opsi yang berbeda!',
        confirmButtonText: 'OK',
        confirmButtonColor: '#FF0000',
      });
      return; 
    }
  
    try {
      let uploadedImageUrl = questionPhoto;
      if (questionPhoto) {
        const imageRef = ref(storage, `question/${questionPhoto.name + v4()}`);
        const snapshot = await uploadBytes(imageRef, questionPhoto);
        uploadedImageUrl = await getDownloadURL(snapshot.ref); 
      }
  
      const formattedOptions = options.map(option => ({
        optionDescription: option.optionDescription,
        optionPhoto: option.optionPhoto,
        points: parseFloat(option.points),
        isCorrect: null,
      }));
  
      const questionData = {
        pageName,
        question: question,
        number: parseInt(number),
        questionPhoto: uploadedImageUrl || null,
        weight: null,
        discussion: discussion,
        isWeighted: true,
        options: formattedOptions
      };
  
      let response;
      let result;
  
      if (multiplechoiceId !== "null") {
        response = await fetch(`https://${URL}/api/multiplechoice/update-question/${multiplechoiceId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(questionData),
        });
  
        if (response.ok) {
          result = await response.json();
          console.log('Update successful:', result);
  
          const existingPages = JSON.parse(localStorage.getItem(`pages_${testId}`)) || [];
          const updatedPages = existingPages.map(page => 
            page.id === multiplechoiceId 
              ? { ...questionData, id: multiplechoiceId }
              : page
          );
          localStorage.setItem(`pages_${testId}`, JSON.stringify(updatedPages));
        }
      } else {
        response = await fetch(`https://${URL}/api/multiplechoice/add-questions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            testId: testId,
            questions: [questionData],
          }),
        });
  
        if (response.ok) {
          result = await response.json();
          console.log('Response dari API:', result);
          const newMultiplechoiceId = result.data[0].id;
          console.log('MultiplechoiceId:', newMultiplechoiceId);
  
          localStorage.setItem('pageName', pageName);
          const existingPages = JSON.parse(localStorage.getItem(`pages_${testId}`)) || [];
          const newQuestion = { 
            id: newMultiplechoiceId,
            ...questionData,
          };
          existingPages.push(newQuestion);
          localStorage.setItem(`pages_${testId}`, JSON.stringify(existingPages));
        }
      }
  
      if (response.ok) {
        const encodedPageName = encodeURIComponent(pageName);
        router.push(`/author/buatSoal?testId=${testId}&pageName=${encodedPageName}`);
      } else {
        console.error('Failed to process request:', response.statusText);
      }
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Soal berhasil disimpan!',
        confirmButtonColor: '#0B61AA',
      }).then(() => {
        const encodedPageName = encodeURIComponent(pageName);
        router.push(`/author/buatSoal?testId=${testId}&pageName=${encodedPageName}`);
      });
    } catch (error) {
      console.error('Error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan saat menyimpan soal. Silakan coba lagi.',
        confirmButtonColor: '#0B61AA',
      });
    }
  };
  

  return (
    <div className="container mx-auto p-0" style={{ maxWidth: '1978px' }}>
      <header 
        className="bg-[#0B61AA] text-white p-4 sm:p-6 font-poppins w-full"
        style={{ height: 'auto' }}
      >
        <div className="flex items-center max-w-[1978px] w-full px-2 sm:px-4 mx-auto">
          <Link href="/author/buatSoal" className="flex items-center space-x-2 sm:space-x-4">
            <IoMdArrowRoundBack className="text-white text-2xl sm:text-3xl lg:text-4xl" />
            <img src="/images/etamtest.png" alt="Etamtest" className="h-[40px] sm:h-[50px]" />
          </Link>
        </div>
      </header>
  
      <div className="w-full p-2">
        <nav className="bg-[#FFFFFF] text-black p-4">
          <ul className="grid grid-cols-2 gap-2 sm:flex sm:justify-around sm:gap-10">
            <li>
              <button
                className={`w-[100px] sm:w-[140px] md:w-[180px] px-2 sm:px-4 md:px-8 py-1 sm:py-2 md:py-4 rounded-full shadow-xl font-bold font-poppins text-xs sm:text-sm md:text-base ${
                  activeTab === 'buattes' ? 'bg-[#78AED6]' : ''
                }`}
                onClick={() => setActiveTab('buattes')}
              >
                Buat Soal
              </button>
            </li>
            <li>
              <button
                className={`w-[100px] sm:w-[140px] md:w-[180px] px-2 sm:px-4 md:px-8 py-1 sm:py-2 md:py-4 rounded-full shadow-xl font-bold font-poppins text-xs sm:text-sm md:text-base ${
                  activeTab === 'publikasi' ? 'bg-[#78AED6]' : ''
                }`}
              >
                Publikasi
              </button>
            </li>
          </ul>
        </nav>

        <div className="container mx-auto lg: p-2 p-4 w-full" style={{ maxWidth: '100%', height: 'auto' }}>
          <header className='bg-[#0B61AA] font-bold font-poppins text-white p-4'>
            <div className="flex items-center justify-between">
              <span>{pageName}</span>
            </div>
          </header>
  
          <div className="bg-[#FFFFFF] border border-black p-4 rounded-lg shadow-md w-full mb-6 " >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className='mb-4'>
                <label htmlFor="soal">No.      </label>
                <input
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  required
                />
              </div>
              <div className='m'>
                <div className='border border-black bg-[#D9D9D9] p-2 rounded mb-4' style={{ maxWidth: '1978px', height: '250px' }}>
                  <div className='p-4 flex justify-between items-center mb-0.5 w-full'>
                  <div className="flex items-center w-full sm:w-auto mb-2 sm:mb-0">
                      <label className="block text-sm sm:text-sm md:text-base font-medium">
                        Soal Pilihan Ganda
                      </label>
                    </div>
                  </div>
                  <ReactQuill 
                    value={question} 
                    onChange={setQuestion} 
                    modules={{
                      toolbar: [
                        [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['bold', 'italic', 'underline'],
                        ['clean']
                      ],
                    }}
                    formats={[
                      'header',
                      'font',
                      'list',
                      'bullet',
                      'bold',
                      'italic',
                      'underline',
                      'image',
                    ]}
                    className='bg-white shadow-md rounded-md border border-gray-500'
                    style={{ maxWidth: '1978px', height: '150px', overflow: 'hidden' }}
                    placeholder='Buat Soal di sini...'
                    required 
                  />
                </div>
              </div>

              <div className="mb-4">
                {typeof questionPhoto === 'string' && questionPhoto ? (
                  <div className="mb-2">
                    <img 
                      src={questionPhoto} 
                      alt="Question" 
                      className="max-w-md h-auto"
                    />
                    <button 
                      type="button"
                      onClick={() => setQuestionPhoto(null)}
                      className="mt-2 bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Hapus Gambar
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    onChange={(event) => setQuestionPhoto(event.target.files[0])}
                    className="border p-2 w-full"
                    accept="image/*"
                  />
                )}
              </div>
    
              <div>
                <h2 className="block text-sm sm:text-sm md:text-base font-medium mb-2">Jawaban</h2>
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-6"
                  >
                    {/* Opsi Jawaban */}
                    <div className="w-full mb-4 sm:mb-0">
                      {renderOptionContent(option, index)}
                    </div>

                    {/* Bobot */}
                    <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-between space-x-2 sm:space-x-4 border border-black rounded-[10px] p-2">
                      <label className="font-medium text-sm">Bobot</label>
                      <div className="flex items-center w-full sm:w-auto">
                        <input
                          type="number"
                          name="points"
                          min="1"
                          max="5"
                          value={option.points || ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);

                            // Validasi angka antara 1-5
                            if (value >= 1 && value <= 5) {
                              handleOptionChange(index, value, 'points');
                            } else if (e.target.value === '') {
                              // Reset jika input kosong
                              handleOptionChange(index, '', 'points');
                            }
                          }}
                          className="border p-1 w-full"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm sm:text-sm md:text-base font-medium mb-2">Pembahasan</label>
                <ReactQuill 
                  value={discussion} 
                  onChange={setDiscussion} 
                  modules={{
                    toolbar: [
                      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['bold', 'italic', 'underline'],
                      ['clean']
                    ]
                  }}
                  formats={[
                    'header',
                    'font',
                    'list',
                    'bullet',
                    'bold',
                    'italic',
                    'underline',
                  ]}
                  placeholder='Tulis kunci jawaban di sini...' />
              </div>
            </form>
            <div className="mt-4 flex flex-wrap justify-end items-center gap-2 sm:gap-4">
              <button
                onClick={handleDelete}
                className="bg-[#E58A7B] border border-black px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm md:text-base hover:text-white font-poppins rounded-[10px]"
              >
                Hapus
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-[#E8F4FF] border border-black px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm md:text-base hover:text-white font-poppins rounded-[10px]"
              >
                Simpan
              </button>
              <button
                onClick={handleBack}
                className="bg-[#A6D0F7] border border-black px-2 py-1 text-xs sm:px-4 sm:py-2 sm:text-sm md:text-base hover:text-white font-poppins rounded-[10px]"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 
};

export default MembuatSoalCPNS;