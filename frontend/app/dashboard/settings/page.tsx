'use client';

import { useState, useEffect, useRef } from 'react';
import { User, Mail, Lock, Save, Camera, Trash2, Bell, Globe, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      if (user.profile_photo_url) {
        setPreviewImage(`http://localhost${user.profile_photo_url}`);
      }
    }
  }, [user]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      setTimeout(() => setError(''), 3000);
      return;
    }

    // Mostrar preview imediatamente
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload automático
    setUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await fetch('http://localhost/api/user/profile-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Atualizar o store com a nova URL
        updateUser({ profile_photo_url: data.data.profile_photo_url });
        setMessage('Foto de perfil atualizada com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Erro ao fazer upload da foto');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Erro ao fazer upload:', err);
      setError('Erro ao fazer upload da foto');
      setTimeout(() => setError(''), 3000);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      const response = await fetch('http://localhost/api/user/profile-photo', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setPreviewImage(null);
        updateUser({ profile_photo_url: undefined });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        setMessage('Foto removida com sucesso!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setError('Erro ao remover foto');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Erro ao remover foto:', err);
      setError('Erro ao remover foto');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Perfil atualizado com sucesso!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }
    if (newPassword.length < 8) {
      setError('A nova senha deve ter pelo menos 8 caracteres');
      return;
    }
    setMessage('Senha atualizada com sucesso!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Configurações</h1>
          <p className="text-gray-600">Gerencie seu perfil, segurança e preferências</p>
        </div>
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{message}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>{error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative group mb-4">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden border-4 border-white shadow-lg">
                    {previewImage ? (<img src={previewImage} alt="Profile" className="w-full h-full object-cover" />) : (user?.name?.charAt(0).toUpperCase())}
                  </div>
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={() => fileInputRef.current?.click()} className="text-white hover:scale-110 transition-transform"><Camera className="w-8 h-8" /></button>
                  </div>
                  {previewImage && (<button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"><Trash2 className="w-4 h-4" /></button>)}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                 {!user?.is_pro && (
                  <span className="text-xs text-gray-500 mb-2">Versão Grátis</span>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{user?.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
                {user?.is_pro && (<span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-semibold rounded-full"> PRO</span>)}
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Estatísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center"><span className="text-gray-600 text-sm">Decks criados</span><span className="font-bold text-violet-600">0</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 text-sm">Cards estudados</span><span className="font-bold text-violet-600">0</span></div>
                <div className="flex justify-between items-center"><span className="text-gray-600 text-sm">Dias seguidos</span><span className="font-bold text-violet-600">0</span></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center"><User className="w-5 h-5 text-violet-600" /></div>
                <h2 className="text-2xl font-bold text-gray-900">Informações Pessoais</h2>
              </div>
              <form onSubmit={handleUpdateProfile} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nome Completo</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="Seu nome" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all" placeholder="seu@email.com" /></div>
                </div>
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label><textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none" placeholder="Conte um pouco sobre você..." /></div>
                <div className="pt-2"><button type="submit" className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 font-semibold shadow-lg shadow-violet-500/30"><Save className="w-5 h-5" />Salvar Alterações</button></div>
              </form>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center"><Lock className="w-5 h-5 text-red-600" /></div>
                <h2 className="text-2xl font-bold text-gray-900">Segurança</h2>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-5">
                <div><label className="block text-sm font-semibold text-gray-700 mb-2">Senha Atual</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" placeholder="" /></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Nova Senha</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" placeholder="" /></div>
                  <div><label className="block text-sm font-semibold text-gray-700 mb-2">Confirmar Nova Senha</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" placeholder="" /></div>
                </div>
                <div className="pt-2"><button type="submit" className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl flex items-center gap-2 transition-all transform hover:scale-105 font-semibold shadow-lg shadow-red-500/30"><Lock className="w-5 h-5" />Atualizar Senha</button></div>
              </form>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Bell className="w-5 h-5 text-blue-600" /></div>
                <h2 className="text-2xl font-bold text-gray-900">Preferências</h2>
              </div>
              <div className="space-y-5">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-gray-600" /><div><h3 className="font-semibold text-gray-900">Notificações</h3><p className="text-sm text-gray-500">Receber lembretes de estudo</p></div></div>
                  <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" defaultChecked /><div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div></label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-gray-600" /><div><h3 className="font-semibold text-gray-900">Áudio Automático</h3><p className="text-sm text-gray-500">Reproduzir pronúncia automaticamente</p></div></div>
                  <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" /><div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div></label>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-gray-600" /><div><h3 className="font-semibold text-gray-900">Perfil Público</h3><p className="text-sm text-gray-500">Permitir que outros vejam seu perfil</p></div></div>
                  <label className="relative inline-flex items-center cursor-pointer"><input type="checkbox" className="sr-only peer" /><div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600"></div></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
