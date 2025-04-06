import axios from 'axios';

export const validateEmail = async (email: string): Promise<boolean> => {
    try {
        const response = await axios.get(
            `https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.NEXT_PUBLIC_ABSTRACT_API_KEY}&email=${email}`
        );
        
        const data = response.data;
        
        // Kiểm tra các tiêu chí
        const isValid = 
            data.is_valid_format?.value && // Định dạng email hợp lệ
            data.is_mx_found?.value && // Có MX record
            data.is_smtp_valid?.value && // SMTP server hợp lệ
            !data.is_disposable_email?.value && // Không phải email tạm thời
            !data.is_role_email?.value; // Không phải email role (info@, support@, etc.)

        return isValid;
    } catch (error) {
        console.error('Error validating email:', error);
        return false;
    }
}; 