import React, { useState, FormEvent, ChangeEvent } from 'react';
import axios, { AxiosError } from 'axios';
import { User, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  name: string;
  password: string;
}

interface LoginResponse {
  message: string;
  access_token?: string;
  user?: {
    id: number;
    name: string;
    username: string;
    role?: string;
  };
}

interface LoginError {
  message: string;
  errors?: {
    [key: string]: string[];
  };
}

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({ name: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; password?: string; general?: string }>({});

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { name?: string; password?: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Username harus diisi';
    if (!formData.password) newErrors.password = 'Password harus diisi';
    else if (formData.password.length < 6) newErrors.password = 'Password minimal 6 karakter';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.post<LoginResponse>(
        `${API_BASE}/login`,
        formData,
        {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          withCredentials: true, // pastikan cookie/session dikirim
        }
      );
      console.log(`${API_BASE}/login`)
      if (response.status === 200) {
        const data = response.data;

        // Simpan token & user
        if (data.access_token) localStorage.setItem('auth_token', data.access_token);
        if (data.user) localStorage.setItem('user', JSON.stringify(data.user));

        // --- Redirect sesuai role (tombol Back tetap bisa) ---
        const role = data.user?.role?.toLowerCase();
        if (role === 'admin') window.location.href = '/admin/dashboard';
        else window.location.href = '/profile';
      }
    } catch (err) {
      const axiosError = err as AxiosError<LoginError>;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const data = axiosError.response.data;
        if (status === 401) setErrors({ general: 'Username atau password salah' });
        else if (status === 422) {
          const validationErrors: { name?: string; password?: string } = {};
          if (data.errors?.name) validationErrors.name = data.errors.name[0];
          if (data.errors?.password) validationErrors.password = data.errors.password[0];
          setErrors(validationErrors);
        } else setErrors({ general: data.message || 'Login gagal. Silakan coba lagi' });
      } else if (axiosError.request) setErrors({ general: 'Tidak dapat terhubung ke server.' });
      else setErrors({ general: 'Terjadi kesalahan tidak terduga.' });
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

              <div className="mb-10 sm:mb-12 text-center">
                <h1 className="text-[28px] font-semibold text-[#7A2B1E] font-['Poppins']">Welcome to</h1>
                <h2 className="text-[28px] font-semibold font-['Poppins']"
                  style={{
                    background: 'linear-gradient(90deg, #7A2B1E 55.77%, #F1E0CB 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                  Arzeta Co-Living!
                </h2>
              </div>

              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Username */}
                <div>
                  <label htmlFor="name" className="block text-[#3D3D3D] font-medium mb-3 text-base font-['Poppins']">Name</label>
                  <div className="relative flex items-center">
                    <User className="absolute left-0 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="your name"
                      className="w-full pl-8 pr-3 py-3 border-b-2 border-gray-400 focus:border-[#7D4E3D] outline-none bg-transparent placeholder-gray-400 text-gray-800 text-base font-['Poppins']"
                    />
                  </div>
                  <div className="h-5 mt-1">
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="block text-[#3D3D3D] font-medium mb-3 text-base font-['Poppins']">Password</label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-0 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="enter your password"
                      className="w-full pl-8 pr-10 py-3 border-b-2 border-gray-400 focus:border-[#7D4E3D] outline-none bg-transparent placeholder-gray-400 text-gray-800 text-base font-['Poppins']"
                    />
                    <button type="button" onClick={togglePasswordVisibility} className="absolute right-0 flex items-center">
                      {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
                    </button>
                  </div>
                  <div className="h-5 mt-1">
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#7D6A5F] hover:bg-[#6B5A50] text-white font-semibold py-3 rounded-full mt-6 transition-all"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Section */}
          <div className="w-full md:w-1/2 h-48 sm:h-56 md:h-full relative overflow-hidden">
            <img src="/LivingRoom.jpg" alt="Arzeta Co-Living" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
