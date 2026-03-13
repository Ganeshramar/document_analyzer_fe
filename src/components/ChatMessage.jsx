import { Sparkles, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const ChatMessage = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
          isUser
            ? 'bg-gradient-to-br from-violet-600 to-indigo-600'
            : 'bg-gradient-to-br from-emerald-600 to-teal-600'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-tr-sm'
            : 'bg-gray-800 border border-gray-700 text-gray-100 rounded-tl-sm'
        }`}
      >
        {isUser ? (
          <p className="text-sm leading-relaxed">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
        {message.timestamp && (
          <p className={`text-xs mt-1.5 ${isUser ? 'text-violet-300' : 'text-gray-500'}`}>
            {new Date(message.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
