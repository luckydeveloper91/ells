import React, { useState, useEffect } from 'react';
import { Settings } from '../../types';
import { Save, Music, Image, Upload, X } from 'lucide-react';
import { supabase } from '../../services/apiService';

interface SettingsFormProps {
  settings: Settings;
  onSave: (settings: Settings) => Promise<void>;
}

const SettingsForm: React.FC<SettingsFormProps> = ({ settings, onSave }) => {
  const [formData, setFormData] = useState<Settings>(settings);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<'image' | 'music' | null>(null);
  
  useEffect(() => {
    setFormData(settings);
  }, [settings]);
  
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'music') => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (type === 'image' && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, backgroundImage: 'Please upload an image file' }));
      return;
    }
    
    if (type === 'music' && !file.type.startsWith('audio/')) {
      setErrors(prev => ({ ...prev, backgroundMusic: 'Please upload an audio file' }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, [type === 'image' ? 'backgroundImage' : 'backgroundMusic']: 'File must be less than 5MB' }));
      return;
    }
    
    setUploading(type);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = type === 'image' ? `backgrounds/${fileName}` : `sounds/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('system')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('system')
        .getPublicUrl(filePath);
      
      setFormData(prev => ({
        ...prev,
        [type === 'image' ? 'backgroundImage' : 'backgroundMusic']: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrors(prev => ({ 
        ...prev, 
        [type === 'image' ? 'backgroundImage' : 'backgroundMusic']: 'Failed to upload file' 
      }));
    } finally {
      setUploading(null);
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.buttonText?.trim()) {
      newErrors.buttonText = 'Button text is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Lucky Draw Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title*
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 mb-1">
            Spin Button Text*
          </label>
          <input
            type="text"
            id="buttonText"
            name="buttonText"
            value={formData.buttonText}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.buttonText ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.buttonText && <p className="text-red-500 text-xs mt-1">{errors.buttonText}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Image className="w-4 h-4 mr-1" />
            Background Image
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'image')}
                className="hidden"
                id="image-upload"
                disabled={uploading === 'image'}
              />
              <label
                htmlFor="image-upload"
                className={`
                  inline-flex items-center px-4 py-2 border border-gray-300 rounded-md
                  shadow-sm text-sm font-medium text-gray-700 bg-white
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                  ${uploading === 'image' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading === 'image' ? 'Uploading...' : 'Upload Image'}
              </label>
            </div>
            
            {formData.backgroundImage && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, backgroundImage: '' }))}
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {formData.backgroundImage && (
            <div className="mt-2">
              <img 
                src={formData.backgroundImage} 
                alt="Background preview" 
                className="h-20 object-cover w-full rounded"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/800x200/FEDF89/6B4226?text=Image+Error';
                }}
              />
            </div>
          )}
          {errors.backgroundImage && <p className="text-red-500 text-xs mt-1">{errors.backgroundImage}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
            <Music className="w-4 h-4 mr-1" />
            Background Music
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => handleFileUpload(e, 'music')}
                className="hidden"
                id="music-upload"
                disabled={uploading === 'music'}
              />
              <label
                htmlFor="music-upload"
                className={`
                  inline-flex items-center px-4 py-2 border border-gray-300 rounded-md
                  shadow-sm text-sm font-medium text-gray-700 bg-white
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                  ${uploading === 'music' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading === 'music' ? 'Uploading...' : 'Upload Music'}
              </label>
            </div>
            
            {formData.backgroundMusic && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, backgroundMusic: '' }))}
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {formData.backgroundMusic && (
            <div className="mt-2">
              <audio controls className="w-full h-10">
                <source src={formData.backgroundMusic} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}
          {errors.backgroundMusic && <p className="text-red-500 text-xs mt-1">{errors.backgroundMusic}</p>}
        </div>
        
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            value={formData.theme}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="default">Default</option>
            <option value="festive">Festive</option>
            <option value="elegant">Elegant</option>
            <option value="playful">Playful</option>
          </select>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-amber-600 text-white rounded-md flex items-center hover:bg-amber-700 transition-colors"
        >
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;