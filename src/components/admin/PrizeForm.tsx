import React, { useState, useEffect } from 'react';
import { Prize } from '../../types';
import { Save, Trash2, Upload, X } from 'lucide-react';
import { supabase } from '../../services/apiService';

interface PrizeFormProps {
  prize?: Prize;
  onSave: (prize: Partial<Prize>) => Promise<void>;
  onCancel: () => void;
  onDelete?: (id: number) => Promise<void>;
}

const initialPrize: Partial<Prize> = {
  name: '',
  description: '',
  image: '',
  probability: 5,
  position: 1,
  isActive: true,
};

const PrizeForm: React.FC<PrizeFormProps> = ({
  prize,
  onSave,
  onCancel,
  onDelete
}) => {
  const [formData, setFormData] = useState<Partial<Prize>>(prize || initialPrize);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  
  useEffect(() => {
    if (prize) {
      setFormData(prize);
    } else {
      setFormData(initialPrize);
    }
  }, [prize]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : 
              type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, image: 'Please upload an image file' }));
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, image: 'Image must be less than 5MB' }));
      return;
    }
    
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `prize-images/${fileName}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('prizes')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('prizes')
        .getPublicUrl(filePath);
      
      setFormData(prev => ({
        ...prev,
        image: publicUrl
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
    } finally {
      setUploading(false);
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name?.trim()) {
      newErrors.name = 'Prize name is required';
    }
    
    if (formData.probability === undefined || formData.probability < 0 || formData.probability > 100) {
      newErrors.probability = 'Probability must be between 0 and 100';
    }
    
    if (formData.position === undefined || formData.position < 1 || formData.position > 12) {
      newErrors.position = 'Position must be between 1 and 12';
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
      console.error("Error saving prize:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!prize?.id) return;
    
    if (window.confirm(`Are you sure you want to delete prize "${prize.name}"?`)) {
      setIsSubmitting(true);
      try {
        await onDelete?.(prize.id);
      } catch (error) {
        console.error("Error deleting prize:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {prize ? 'Edit Prize' : 'Add New Prize'}
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Prize Name*
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
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
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prize Image
          </label>
          <div className="mt-1 flex items-center space-x-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploading}
              />
              <label
                htmlFor="image-upload"
                className={`
                  inline-flex items-center px-4 py-2 border border-gray-300 rounded-md
                  shadow-sm text-sm font-medium text-gray-700 bg-white
                  hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500
                  ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Uploading...' : 'Upload Image'}
              </label>
            </div>
            
            {formData.image && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {formData.image && (
            <div className="mt-2">
              <img 
                src={formData.image} 
                alt="Prize preview" 
                className="h-20 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://placehold.co/100x100/FEDF89/6B4226?text=Image+Error';
                }}
              />
            </div>
          )}
          {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="probability" className="block text-sm font-medium text-gray-700 mb-1">
              Win Probability (%)*
            </label>
            <input
              type="number"
              id="probability"
              name="probability"
              value={formData.probability || 0}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className={`w-full px-3 py-2 border rounded-md ${errors.probability ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.probability && <p className="text-red-500 text-xs mt-1">{errors.probability}</p>}
          </div>
          
          <div>
            <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
              Grid Position (1-12)*
            </label>
            <input
              type="number"
              id="position"
              name="position"
              value={formData.position || 1}
              onChange={handleChange}
              min="1"
              max="12"
              className={`w-full px-3 py-2 border rounded-md ${errors.position ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position}</p>}
          </div>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive || false}
            onChange={(e) => {
              setFormData(prev => ({
                ...prev,
                isActive: e.target.checked
              }));
            }}
            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Active (available in lucky draw)
          </label>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end space-x-3">
        {prize?.id && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-md flex items-center hover:bg-red-100 transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-amber-600 text-white rounded-md flex items-center hover:bg-amber-700 transition-colors"
        >
          <Save className="w-4 h-4 mr-1" />
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default PrizeForm;