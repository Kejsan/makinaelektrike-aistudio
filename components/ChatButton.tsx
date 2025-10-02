import React from 'react';
import { Sparkles } from 'lucide-react';

interface ChatButtonProps {
  onClick: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-24 bg-gray-cyan/80 text-white p-3 rounded-full shadow-lg hover:bg-gray-cyan transition-all duration-300 ease-in-out backdrop-blur-sm border border-white/10 z-50 transform hover:scale-110"
      aria-label="Open EV Assistant"
    >
      <Sparkles size={24} />
    </button>
  );
};

export default ChatButton;
