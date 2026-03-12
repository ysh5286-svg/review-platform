"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

interface Partner {
  id: string;
  name: string | null;
  image: string | null;
  role: string | null;
  businessName?: string | null;
}

interface Conversation {
  partner: Partner;
  lastMessage: {
    content: string;
    createdAt: string;
    campaign?: { id: string; title: string } | null;
  } | null;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  content: string;
  read: boolean;
  createdAt: string;
  sender: Partner;
  receiver: Partner;
  campaign?: { id: string; title: string } | null;
}

function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialPartner = searchParams.get("partner");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<string | null>(initialPartner);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/messages")
      .then((r) => r.json())
      .then(async (data) => {
        const convs: Conversation[] = Array.isArray(data) ? data : [];
        setConversations(convs);

        // If initialPartner is set but not in conversations, fetch partner info
        if (initialPartner && !convs.find((c) => c.partner.id === initialPartner)) {
          try {
            const res = await fetch(`/api/users/${initialPartner}`);
            if (res.ok) {
              const partner = await res.json();
              setConversations((prev) => [
                { partner, lastMessage: null, unreadCount: 0 },
                ...prev,
              ]);
            }
          } catch {}
        }
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedPartner) {
      fetch(`/api/messages?partnerId=${selectedPartner}`)
        .then((r) => r.json())
        .then((data) => {
          setMessages(Array.isArray(data) ? data : []);
          // Update unread count
          setConversations((prev) =>
            prev.map((c) =>
              c.partner.id === selectedPartner ? { ...c, unreadCount: 0 } : c
            )
          );
        });
    }
  }, [selectedPartner]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Poll for new messages
  useEffect(() => {
    if (!selectedPartner) return;
    const interval = setInterval(() => {
      fetch(`/api/messages?partnerId=${selectedPartner}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setMessages(data);
        });
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedPartner]);

  async function handleSend() {
    if (!newMessage.trim() || !selectedPartner || sending) return;
    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedPartner,
          content: newMessage.trim(),
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setNewMessage("");
      }
    } finally {
      setSending(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "방금";
    if (mins < 60) return `${mins}분 전`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}시간 전`;
    const days = Math.floor(hours / 24);
    return `${days}일 전`;
  }

  const selectedConv = conversations.find((c) => c.partner.id === selectedPartner);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">메시지</h1>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden" style={{ height: "calc(100vh - 200px)" }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className="w-80 border-r flex-shrink-0 flex flex-col">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="font-semibold text-gray-700 text-sm">대화 목록</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8 text-gray-400 text-sm">로딩중...</div>
              ) : conversations.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  아직 대화가 없습니다
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.partner.id}
                    onClick={() => setSelectedPartner(conv.partner.id)}
                    className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedPartner === conv.partner.id ? "bg-red-50 border-l-2 border-l-red-500" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {conv.partner.image ? (
                        <img src={conv.partner.image} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm font-bold">
                          {conv.partner.name?.[0] || "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {conv.partner.name || conv.partner.businessName || "사용자"}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            conv.partner.role === "ADVERTISER" ? "bg-blue-100 text-blue-600" : "bg-green-100 text-green-600"
                          }`}>
                            {conv.partner.role === "ADVERTISER" ? "광고주" : "리뷰어"}
                          </span>
                          {conv.unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        {conv.lastMessage && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <p className="text-xs text-gray-500 truncate flex-1">
                              {conv.lastMessage.content}
                            </p>
                            <span className="text-[10px] text-gray-400 flex-shrink-0">
                              {timeAgo(conv.lastMessage.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedPartner ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-gray-50 flex items-center gap-3">
                  {selectedConv?.partner.image ? (
                    <img src={selectedConv.partner.image} alt="" className="w-8 h-8 rounded-full" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-bold">
                      {selectedConv?.partner.name?.[0] || "?"}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {selectedConv?.partner.name || selectedConv?.partner.businessName || "사용자"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedConv?.partner.role === "ADVERTISER" ? "광고주" : "리뷰어"}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMine = msg.senderId === session?.user?.id;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[70%] ${isMine ? "order-1" : ""}`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm ${
                              isMine
                                ? "bg-red-500 text-white rounded-br-md"
                                : "bg-gray-100 text-gray-900 rounded-bl-md"
                            }`}
                          >
                            {msg.content}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                            <span className="text-[10px] text-gray-400">
                              {timeAgo(msg.createdAt)}
                            </span>
                            {isMine && msg.read && (
                              <span className="text-[10px] text-blue-500">읽음</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                      placeholder="메시지를 입력하세요..."
                      className="flex-1 px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      onClick={handleSend}
                      disabled={sending || !newMessage.trim()}
                      className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-medium hover:bg-red-600 disabled:opacity-50 transition-colors cursor-pointer"
                    >
                      전송
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-4">💬</p>
                  <p>대화를 선택하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-400">로딩중...</div>}>
      <MessagesContent />
    </Suspense>
  );
}
