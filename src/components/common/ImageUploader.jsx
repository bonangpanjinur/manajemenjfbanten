import React, { useState } from 'react';
import { FaCloudUploadAlt, FaTimes } from 'react-icons/fa';

const ImageUploader = ({ images = [], onChange, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);

  // Upload Manual via Fetch (Multipart/Form-Data)
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
        alert(`Maksimal ${maxImages} gambar.`);
        return;
    }

    setUploading(true);

    // Ambil Nonce WP dari variabel global (umumnya diload di header)
    const nonce = window.umhApiSettings?.nonce || ''; 
    const rootUrl = window.umhApiSettings?.root || '/wp-json/';

    try {
      const newImages = [...images];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${rootUrl}umh/v1/upload`, {
             method: 'POST',
             headers: {
                 'X-WP-Nonce': nonce
             },
             body: formData
        });
        
        const data = await response.json();

        if (data.success) {
          newImages.push(data.url);
        } else {
            console.error("Upload error:", data);
            alert("Gagal upload: " + (data.message || 'Error'));
        }
      }

      onChange(newImages);
    } catch (error) {
      console.error("Upload network error:", error);
      alert("Gagal mengunggah gambar. Cek koneksi.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Preview Gambar */}
        {images.map((url, index) => (
          <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-sm bg-gray-100">
            <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
            
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <button
                type="button"
                onClick={() => removeImage(index)}
                className="bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all transform scale-75 group-hover:scale-100 shadow-lg"
                title="Hapus"
                >
                <FaTimes />
                </button>
            </div>
          </div>
        ))}

        {/* Tombol Upload */}
        {images.length < maxImages && (
          <label className={`
            border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer 
            hover:border-green-500 hover:bg-green-50 transition aspect-square group
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}>
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-200 border-t-green-600 mb-2"></div>
            ) : (
              <>
                <FaCloudUploadAlt className="text-3xl text-gray-400 group-hover:text-green-500 transition mb-2" />
                <span className="text-xs text-gray-500 text-center font-medium group-hover:text-green-600">
                  + Tambah Foto<br/>
                  <span className="text-[10px] opacity-70">({images.length}/{maxImages})</span>
                </span>
              </>
            )}
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={uploading}
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;