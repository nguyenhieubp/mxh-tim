interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: () => void;
  isConnected: boolean;
}

import { useTranslation } from 'react-i18next';

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  sendMessage,
  isConnected
}) => {
  const { t } = useTranslation();

  return (
    <div className="border-t p-3 flex items-center">
      <input
        type="text"
        placeholder={t('messages.inputPlaceholder')}
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        className="flex-1 px-4 py-2 border rounded-full outline-none"
        disabled={!isConnected}
      />
      <button
        onClick={sendMessage}
        className={`ml-3 px-4 py-2 rounded-lg ${isConnected
            ? "bg-blue-500 text-white"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        disabled={!isConnected}
      >
        {isConnected ? t('messages.send') : t('messages.connecting')}
      </button>
    </div>
  );
};

export default MessageInput;