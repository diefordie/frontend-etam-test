'use client';
import React, { useState, useEffect } from 'react';
import 'react-quill-new/dist/quill.snow.css';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { storage } from "../../../firebase/config";
import { v4 } from 'uuid';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { AiOutlineCloseSquare } from 'react-icons/ai';
import { IoMdArrowRoundBack } from "react-icons/io";
import { BsImage } from 'react-icons/bs';
import dynamic from 'next/dynamic';
import Swal from 'sweetalert2'; 
const ReactQuill = dynamic(() => import('react-quill-new'), {
  ssr: false 
});
import dotenv from 'dotenv';

dotenv.config();
const URL = process.env.NEXT_PUBLIC_API_URL;

const MembuatSoal = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [testId, setTestId] = useState('');
  const [category, setCategory] = useState('');
  const [multiplechoiceId, setMultiplechoiceId] = useState('');
  const [pageName, setPageName] = useState('');
  const [question, setQuestion] = useState('');
  const [number, setNumber] = useState('');
  const [questionPhoto, setQuestionPhoto] = useState(null);
  const [weight, setWeight] = useState();
  const [discussion, setDiscussion] = useState('');
  const [options, setOptions] = useState([{ optionDescription: '', isCorrect: false }]);
  const [pages, setPages] = useState([{ questions: [] }]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(''); 
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    const testIdFromUrl = searchParams.get("testId");
    const categoryFromUrl = searchParams.get("category");
    const multiplechoiceIdFromUrl = searchParams.get("multiplechoiceId");
    const pageNameFromUrl = searchParams.get("pageName");
    const numberFromUrl = searchParams.get("nomor");
    

    if (pageNameFromUrl) {
      const decodedPageName = decodeURIComponent(pageNameFromUrl);
      setPageName(decodedPageName);
    }
    if (testIdFromUrl) {
      setTestId(testIdFromUrl);
    }
    if (multiplechoiceIdFromUrl) {
      setMultiplechoiceId(multiplechoiceIdFromUrl); 
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
        // setPageName(data.pageName);
        setWeight(data.weight);
        setNumber(data.number);
        setQuestion(data.question);
        setOptions(data.option);
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
            isCorrect: opt.isCorrect || false,
            points: opt.points
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
    setOptions((prevOptions) => {
      if (prevOptions.length < 5) {
        return [...prevOptions, { optionDescription: '', points: '' }];
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Maksimal 5 opsi hanya diperbolehkan',
          text: 'Anda tidak dapat menambahkan lebih dari 5 opsi.',
          confirmButtonText: 'OK',
        });
        return prevOptions;
      }
    });
    if (options.length < 6) {
      setOptions([...options, { 
        optionDescription: '', 
        optionPhoto: null,
        // points: ''
        isCorrect: false 
      }]);
    }
  };

  const handleOptionChange = async (index, content, type) => {
    const newOptions = [...options];
    const currentOption = { ...newOptions[index] };
    
    switch (type) {
      case 'text':
        currentOption.optionDescription = content;
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
          return;
        }
        break;
      case 'points':
        currentOption.points = content;
        break;
    }
    newOptions[index] = currentOption;
    setOptions(newOptions);
  };

  const handleCorrectOptionChange = (index) => {
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index, 
    }));
    setOptions(newOptions);
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
  
        if (!multiplechoiceId || multiplechoiceId === "null") {
          const response = await fetch(`https://${URL}/api/multiplechoice/previous-question/${testId}/${number}`, {
            method: 'GET',
          });
  
          if (!response.ok) {
            throw new Error('Gagal mendapatkan soal sebelumnya.');
          }
        }
  
        if (multiplechoiceId && multiplechoiceId !== "null") {
          const response = await fetch(`https://${URL}/api/multiplechoice/question/${multiplechoiceId}`, {
            method: 'DELETE',
          });
  
          if (!response.ok) {
            throw new Error('Gagal menghapus soal dari database');
          }
        }
  
        const savedPages = localStorage.getItem(localStorageKey);
  
        if (savedPages) {
          let pages = JSON.parse(savedPages);
          let deletedNumber = null;
  
          pages.forEach((page) => {
            const questionIndex = page.questions.indexOf(parseInt(number));
            if (questionIndex !== -1) {
              deletedNumber = parseInt(number);
              page.questions.splice(questionIndex, 1);
            }
          });
  
          if (deletedNumber !== null) {
            pages = pages.map(page => ({
              ...page,
              questions: page.questions.map(num => num > deletedNumber ? num - 1 : num).sort((a, b) => a - b),
            })).filter(page => page.questions.length > 0);
  
            localStorage.setItem(localStorageKey, JSON.stringify(pages));
          }
        }
        const encodedPageName = encodeURIComponent(pageName);
  
        router.push(`/author/buatSoal?testId=${testId}&category=${category}&pageName=${encodedPageName}`);
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
        } 
      }
    } catch (error) {
        console.error('Error deleting option:', error);
    }
  };

  const handleBack = () => {
    if (testId) {
      const encodedPageName = encodeURIComponent(pageName);
      router.push(`/author/buatSoal?testId=${testId}&category=${category}&pageName=${encodedPageName}`);
    } else {
      console.error('Test ID tidak ditemukan dalam respons:', result);
    }
  };

  const validateForm = () => {
    const validationErrors = [];
    if (!question.trim()) {
      validationErrors.push("Soal wajib diisi");
    }
    if (!weight || weight <= 0) {
      validationErrors.push("Bobot harus diisi dengan nilai lebih dari 0");
    }
    if (options.length < 2) {
      validationErrors.push("Minimal harus ada 2 opsi jawaban");
    } else {
      const emptyOptions = options.filter((option, index) => 
        !option.optionDescription.trim() && !option.optionPhoto
      );
      
      if (emptyOptions.length > 0) {
        validationErrors.push("Semua opsi jawaban harus diisi");
      }
    }
    const correctOptionsCount = options.filter(option => option.isCorrect).length;
    if (correctOptionsCount === 0) {
      validationErrors.push("Pilih salah satu jawaban yang benar");
    } else if (correctOptionsCount > 1) {
      validationErrors.push("Hanya boleh memilih satu jawaban yang benar");
    }
    return {
      isValid: validationErrors.length === 0,
      errors: validationErrors
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

    try {
      let uploadedImageUrl = questionPhoto;
      if (questionPhoto instanceof File) {
        const imageRef = ref(storage, `question/${questionPhoto.name + v4()}`);
        const snapshot = await uploadBytes(imageRef, questionPhoto);
        uploadedImageUrl = await getDownloadURL(snapshot.ref); 
      }

      const formattedOptions = options.map(option => ({
        optionDescription: option.optionDescription,
        optionPhoto: option.optionPhoto,
        points: parseFloat(option.points) || 0,
        isCorrect: option.isCorrect,
      }));

      const questionData = {
        pageName,
        question: question,
        number: parseInt(number),
        questionPhoto: uploadedImageUrl,
        weight: parseFloat(weight),
        discussion: discussion,
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

          const existingPages = JSON.parse(localStorage.getItem(`pages_${testId}`)) || [];
          const updatedPages = existingPages.map(page => 
            page.id === multiplechoiceId 
              ? { ...questionData, id: multiplechoiceId }
              : page
          );
          localStorage.setItem(`pages_${testId}`, JSON.stringify(updatedPages));
        }
      } else {
        response = await fetch('https://${URL}/api/multiplechoice/add-questions', {
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
          const newMultiplechoiceId = result.data[0].id;

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
        router.push(`/author/buatSoal?testId=${testId}&category=${category}&pageName=${encodedPageName}`);
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
        router.push(`/author/buatSoal?testId=${testId}&category=${category}&pageName=${encodedPageName}`);
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

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['bold', 'italic', 'underline'],
      ['clean']
    ]
  };
  
  const formats = [
    'header',
    'list',
    'bold',
    'italic',
    'underline',
  ];



  return (
    <div className="container mx-auto p-0" style={{ maxWidth: '1440px' }}>
      <header className="bg-[#0B61AA] text-white p-4 sm:p-6 font-poppins" style={{ maxWidth: '1440px', height: '108px', marginLeft: '0'}}>
        <div className="flex items-center max-w-[1978px] w-full px-2 sm:px-4 mx-auto">
            <button type="button" onClick={handleBack} className="flex items-center space-x-2 sm:space-x-4">
                    <IoMdArrowRoundBack className="text-white text-2xl sm:text-3xl lg:text-4xl" />
                    <img src="/images/etamtest.png" alt="Etamtest" className="h-[40px] sm:h-[50px]" />
                  </button>
                </div>
      </header>
  
      <nav className="bg-[#FFFF] text-black p-4 sm:p-6">
        <ul className="flex space-x-6 sm:space-x-20">
          <li>
            <button
              className={`w-[120px] sm:w-[220px] h-[48px] rounded-[20px] shadow-md font-bold font-poppins ${activeTab === 'buatTes' ? 'bg-[#78AED6]' : ''}`}
              onClick={() => setActiveTab('buatTes')}
              >
              Buat Soal
            </button>
          </li> 
          <li>
            <button
              className={`w-[140px] sm:w-[180px] px-4 sm:px-8 py-2 sm:py-4 rounded-full shadow-xl font-bold font-poppins ${activeTab === 'publikasi' ? 'bg-[#78AED6]' : ''}`}
              >
              Publikasi
            </button>
          </li>
        </ul>
      </nav>
  
      <div className="container mx-auto lg: p-2 p-4 w-full" style={{ maxWidth: '1309px' }}>
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
                readOnly
                required
              />
            </div>
            <div className='m'>
              <div className='border border-black bg-[#D9D9D9] p-2 rounded mb-4' style={{ maxWidth: '1309px', height: '250px' }}>
                <div className='p-4 flex justify-between items-center mb-0.5 w-full'>
                  <div className='flex items-center'>
                    <label className="block mb-2">Soal Pilihan Ganda</label>
                  </div>
                  <div className='flex items-center'>
                    <label className="font-medium-bold mr-2">Bobot</label>
                    <input
                      type="number"
                      step="0"
                      min="1"
                      id="weight"
                      value={weight}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^\d*$/.test(value)) {
                          setWeight(value);
                        }
                      }}
                      className="border p-2 w-full"
                      required
                    />
                  </div>
                </div>
                
                <ReactQuill 
                  value={question} 
                  onChange={setQuestion} 
                  modules={modules}
                  formats={formats}
                  className='bg-white shadow-md rounded-md border border-gray-500'
                  style={{ maxWidth: '1220px', height: '150px' }}
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
              <h2 className="text-lg font-semi-bold mb-2">Jawaban</h2>
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <div className="w-full">
                    {renderOptionContent(option, index)}
                  </div>
                  <div className="flex items-center space-x-4">
                    <button
                      type="button"
                      className="flex items-center justify-between text-black font-bold px-4 rounded-[10px] border border-black space-x-2"
                    >
                      <input
                        type="radio"
                        id={`jawaban-${index}`}
                        name="jawabanBenar"
                        value={index}
                        checked={option.isCorrect}
                        onChange={() => handleCorrectOptionChange(index)}
                        className={`w-4 h-4 ${!isValid && !options.some(opt => opt.isCorrect) ? 'border border-red-700' : ''}`}
                      />
                      <span>Benar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteJawaban(index, option.id)}
                      className="ml-4"
                    >
                      <img
                        src="/images/Hapus.svg" 
                        alt="Delete"
                        className="w-15 h-15 "
                      />
                    </button>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addOption} className="bg-[#7bb3b4] hover:bg-[#8CC7C8] text-black font-bold py-2 px-4 rounded-[15px] border border-black">
                + Tambah
              </button>
            </div>
  
            <div className="mb-4">
              <label className="block mb-2">Pembahasan</label>
              <ReactQuill 
                value={discussion} 
                onChange={setDiscussion} 
                modules={modules}
                formats={formats}
                placeholder='Tulis kunci jawaban di sini...'
              />
            </div>
          </form>
          <div className='mt-4 flex justify-end space-x-4 -mr-2'>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleDelete}
                className="bg-[#E58A7B] border border-black px-4 py-2 hover:text-white font-poppins rounded-[15px]"
              >
                Hapus
              </button>
              </div>
              <div className="flex justify-end space-x-2">
              <button
                onClick={handleSubmit} 
                className="bg-[#E8F4FF] border border-black px-4 py-2 hover:text-white font-poppins rounded-[15px]"
              >
                Simpan
              </button>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleBack}
                className="bg-[#A6D0F7] border border-black px-4 py-2 hover:text-white font-poppins rounded-[15px]"
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

export default MembuatSoal;