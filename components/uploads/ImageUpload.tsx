import { ChangeEvent, useRef } from 'react';
import { Button } from '@mui/material';
import { AddAPhoto } from '@mui/icons-material';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
}

const ImageUpload = ({ onImageSelect }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <Button
        variant="outlined"
        size="small"
        startIcon={<AddAPhoto />}
        onClick={handleClick}
      >
        Change Photo
      </Button>
    </>
  );
};

export default ImageUpload;