import { Box, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from 'react-i18next';

interface ImagePreviewItemProps {
    url: string;
    index: number;
    onRemove: (index: number) => void;
}

const ImagePreviewItem: React.FC<ImagePreviewItemProps> = ({ url, index, onRemove }) => {
    const { t } = useTranslation();
    
    return (
        <Box sx={{ position: 'relative' }}>
            <img 
                src={url} 
                alt={t('createPost.imagePreview')}
                style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '4px'
                }}
            />
            <IconButton
                onClick={() => onRemove(index)}
                sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                    }
                }}
                size="small"
            >
                <CloseIcon sx={{ color: 'white' }} />
            </IconButton>
        </Box>
    );
};
export default ImagePreviewItem;
