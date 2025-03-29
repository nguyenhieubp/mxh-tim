import React from "react";
import { IChatMessage } from "@/types/message";
import { formatDistanceToNow } from "date-fns";

interface MessageListProps {
  messages: IChatMessage[];
  chatEndRef: React.RefObject<HTMLDivElement>;
}

const MessageList: React.FC<MessageListProps> = ({ messages, chatEndRef }) => {
  return (
    <div className="flex-1 p-4 overflow-y-auto h-0">
      {messages.map((msg, index) => (
        <div key={index} className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}>
          <div
            className={`max-w-[70%] px-4 py-2 rounded-lg my-1 ${
              msg.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            <div>{msg.text}</div>
            {msg.timestamp && (
              <div className={`text-xs mt-1 ${msg.sender === "me" ? "text-blue-100" : "text-gray-500"}`}>
                {formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </div>
  );
};

export default MessageList; 