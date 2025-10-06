import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  token?: string;
}

interface LoginError {
  success: boolean;
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email harus diisi';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>('http://localhost:8000/api/login', formData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.data.success) {
        if (response.data.token) {
          localStorage.setItem('auth_token', response.data.token);
        }
        
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }

        window.location.href = '/hero';
      }
    } catch (err) {
      const axiosError = err as AxiosError<LoginError>;
      
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;

        if (status === 401) {
          setErrors({ general: 'Email atau password salah' });
        } else if (status === 422) {
          if (data.errors) {
            const validationErrors: { email?: string; password?: string } = {};
            if (data.errors.email) validationErrors.email = data.errors.email[0];
            if (data.errors.password) validationErrors.password = data.errors.password[0];
            setErrors(validationErrors);
          } else {
            setErrors({ general: data.message || 'Data yang dimasukkan tidak valid' });
          }
        } else if (status === 429) {
          setErrors({ general: 'Terlalu banyak percobaan login. Silakan coba beberapa saat lagi' });
        } else if (status >= 500) {
          setErrors({ general: 'Terjadi kesalahan server. Silakan coba lagi nanti' });
        } else {
          setErrors({ general: data.message || 'Login gagal. Silakan coba lagi' });
        }
      } else if (axiosError.request) {
        setErrors({ general: 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda' });
      } else {
        setErrors({ general: 'Terjadi kesalahan. Silakan coba lagi' });
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  return (
    <div className="h-screen w-full bg-[#827062] flex items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-[95%] sm:max-w-[85%] md:max-w-2xl lg:max-w-3xl xl:max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row h-[580px] sm:h-[620px] md:h-[640px] lg:h-[660px]">
          
          {/* Left Section - Form */}
          <div className="w-full md:w-1/2 bg-[#F5F1ED] px-6 sm:px-10 md:px-12 lg:px-16 py-10 sm:py-12 md:py-14 flex flex-col justify-center">
            <div className="w-full max-w-md mx-auto">
              
              {/* Header */}
              <div className="mb-10 sm:mb-12">
                <h1 className="text-[28px] font-semibold text-center leading-[42px] tracking-[0.0025em] mb-0 font-['Poppins'] text-[#7A2B1E]">
                  Welcome to
                </h1>
                <h2 className="text-[28px] font-semibold text-center leading-[42px] tracking-[0.02em] font-['Poppins']"
                    style={{
                      background: 'linear-gradient(90deg, #7A2B1E 55.77%, #F1E0CB 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}>
                  Arzeta Co-Living!
                </h2>
              </div>

              {/* General Error Alert */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-['Poppins']">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Email Input */}
                <div>
                  <label htmlFor="email" className="block text-[#3D3D3D] font-medium mb-3 text-base font-['Poppins']">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="absolute left-0 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="demo@email.com"
                      className="w-full pl-8 pr-3 py-3 border-b-2 border-gray-400 focus:border-[#7D4E3D] outline-none transition-colors bg-transparent placeholder-gray-400 text-gray-800 text-base font-['Poppins']"
                    />
                  </div>
                  <div className="h-5 mt-1">
                    {errors.email && (
                      <p className="text-xs text-red-600 font-['Poppins']">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label htmlFor="password" className="block text-[#3D3D3D] font-medium mb-3 text-base font-['Poppins']">
                    Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-0 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      id="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="enter your password"
                      className="w-full pl-8 pr-12 py-3 border-b-2 border-gray-400 focus:border-[#7D4E3D] outline-none transition-colors bg-transparent placeholder-gray-400 text-gray-800 text-base font-['Poppins']"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-0 flex items-center"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                  <div className="h-5 mt-1">
                    {errors.password && (
                      <p className="text-xs text-red-600 font-['Poppins']">{errors.password}</p>
                    )}
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7D6A5F] hover:bg-[#6B5A50] active:bg-[#5a4a42] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-4 rounded-full transition-all duration-200 mt-8 text-lg shadow-lg hover:shadow-xl font-['Poppins']"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Section - Image */}
          <div className="w-full md:w-1/2 h-48 sm:h-56 md:h-full relative overflow-hidden order-2">
            <img
              src="/LivingRoom.jpg"
              alt="Arzeta Co-Living Interior"
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;