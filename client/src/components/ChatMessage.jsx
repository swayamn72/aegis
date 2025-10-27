import React, { memo } from 'react';
import { formatTime } from '../utils/dateUtils';

const ChatMessage = memo(({ msg, userId, chatType, selectedChat, index, messages }) => {
    const isMine = chatType === 'direct'
        ? msg.senderId === userId
        : msg.sender?._id === userId || msg.sender === userId;

    const getSenderInfo = () => {
        if (chatType !== 'tryout' || isMine) return null;

        const senderId = msg.sender?._id || msg.sender;
        const senderData = selectedChat?.participants?.find(p =>
            (p._id || p).toString() === senderId?.toString()
        );

        return senderData || { username: 'Unknown', profilePicture: null };
    };

    const senderInfo = getSenderInfo();
    const showSenderName = chatType === 'tryout' && !isMine && (
        index === 0 || messages[index - 1]?.sender !== msg.sender
    );

    return (
        <div className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end gap-2`}>
            {chatType === 'tryout' && !isMine && (
                <div className="flex-shrink-0 mb-1">
                    {showSenderName ? (
                        <img
                            src={senderInfo?.profilePicture || `https://api.dicebear.com/7.x/avatars/svg?seed=${senderInfo?.username}`}
                            alt={senderInfo?.username}
                            className="w-8 h-8 rounded-full object-cover ring-2 ring-zinc-700"
                        />
                    ) : (
                        <div className="w-8 h-8" />
                    )}
                </div>
            )}

            <div className={`max-w-[70%] lg:max-w-[60%]`}>
                {showSenderName && (
                    <div className="text-xs text-zinc-400 mb-1 ml-3">
                        {senderInfo?.username || 'Unknown'}
                    </div>
                )}

                <div className={`relative px-4 py-2.5 rounded-2xl shadow-lg break-words ${isMine
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-br-sm'
                        : 'bg-zinc-800/90 text-white border border-zinc-700/50 rounded-bl-sm'
                    }`}>
                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {msg.message}
                    </p>

                    <div className={`text-[11px] mt-1 flex items-center gap-1 ${isMine ? 'text-orange-100/70 justify-end' : 'text-zinc-500'
                        }`}>
                        <span>{formatTime(msg.timestamp)}</span>

                        {isMine && (
                            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                                <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z" />
                            </svg>
                        )}
                    </div>
                </div>

                <svg
                    className={`absolute bottom-0 ${isMine ? '-right-2 text-red-600' : '-left-2 text-zinc-800'
                        }`}
                    width="12"
                    height="19"
                    viewBox="0 0 12 19"
                >
                    <path
                        fill="currentColor"
                        d={isMine
                            ? "M0,0 L12,0 L12,19 C12,19 6,15 0,19 Z"
                            : "M12,0 L0,0 L0,19 C0,19 6,15 12,19 Z"
                        }
                    />
                </svg>
            </div>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function
    return (
        prevProps.msg._id === nextProps.msg._id &&
        prevProps.msg.message === nextProps.msg.message &&
        prevProps.index === nextProps.index
    );
});

export default ChatMessage;
