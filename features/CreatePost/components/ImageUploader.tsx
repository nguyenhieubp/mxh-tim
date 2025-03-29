import { Box } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import CloseIcon from '@mui/icons-material/Close';
import React from 'react';

interface ImageUploaderProps {
    previewUrls: string[];
    onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    previewUrls,
    onImageChange,
    onRemoveImage
}) => {
    return (
        <div className="my-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {previewUrls.map((url, index) => (
                    <div
                        key={index}
                        className="relative aspect-square group overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                    >
                        <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <button
                            onClick={() => onRemoveImage(index)}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white 
                                     rounded-full shadow-lg transform translate-y-[-1rem] opacity-0 
                                     group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300"
                        >
                            <CloseIcon className="w-4 h-4 text-gray-700" />
                        </button>
                    </div>
                ))}

                <label className="relative aspect-square cursor-pointer group">
                    <div className="absolute inset-0 rounded-xl border-2 border-dashed 
                                  border-gray-300 group-hover:border-blue-500 
                                  flex items-center justify-center transition-colors duration-300
                                  bg-gray-50 group-hover:bg-blue-50/30">
                        <div className="flex flex-col items-center gap-2">
                            <AddPhotoAlternateIcon
                                className="w-8 h-8 text-gray-400 group-hover:text-blue-500 
                                         transition-colors duration-300 transform group-hover:scale-110"
                            />
                            <span className="text-sm text-gray-500 group-hover:text-blue-500">
                                Add Photos
                            </span>
                        </div>
                    </div>
                    <input
                        type="file"
                        multiple
                        onChange={onImageChange}
                        accept="image/*"
                        className="hidden"
                    />
                </label>
            </div>
        </div>
    );
};

export default ImageUploader;