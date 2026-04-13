"use client";

import { motion } from "framer-motion";
import { MessageSquareText, Send, Trash2, Users } from "lucide-react";
import type {
  AdminChatMessage,
  AdminChatRoom,
} from "@/features/admin/types";

type AdminMessagesTabProps = {
  activeChatRoom: AdminChatRoom | null;
  chatMessages: AdminChatMessage[];
  chatRooms: AdminChatRoom[];
  onDeleteRoom: (room: AdminChatRoom) => void;
  onReplyTextChange: (value: string) => void;
  onSelectRoom: (room: AdminChatRoom) => void;
  onSendMessage: (roomId: string, text: string) => void;
  replyText: string;
};

export default function AdminMessagesTab({
  activeChatRoom,
  chatMessages,
  chatRooms,
  onDeleteRoom,
  onReplyTextChange,
  onSelectRoom,
  onSendMessage,
  replyText,
}: AdminMessagesTabProps) {
  return (
    <motion.div
      key="messages"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Sohbetler</h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Öğrencilerle yapılan canlı sohbetler
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <MessageSquareText className="w-4 h-4" />
          {chatRooms.length} aktif oda
        </div>
      </div>

      {chatRooms.length === 0 ? (
        <div className="glass rounded-2xl p-8 sm:p-12 text-center">
          <MessageSquareText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
          <p className="text-slate-400">Henüz sohbet başlatılmadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {chatRooms.map((room) => {
              const isActive = activeChatRoom?.id === room.id;
              const studentName = room.name || "Öğrenci";

              return (
                <button
                  key={room.id}
                  onClick={() => onSelectRoom(room)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive
                      ? "bg-indigo-500/20 border-indigo-500/50 shadow-lg shadow-indigo-500/10"
                      : "glass border-white/5 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isActive
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      <Users className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {studentName}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {room.updated_at
                          ? new Date(room.updated_at).toLocaleString("tr-TR")
                          : "Tarih yok"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2 flex flex-col h-[600px] glass rounded-2xl overflow-hidden border border-white/5">
            {activeChatRoom ? (
              <>
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white">
                      {activeChatRoom.name?.[0] || "Ö"}
                    </div>
                    <span className="text-white font-semibold text-sm">
                      {activeChatRoom.name || "Öğrenci"}
                    </span>
                  </div>
                  <button
                    onClick={() => onDeleteRoom(activeChatRoom)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((message) => {
                    const isAdmin = message.sender_tc === "admin";

                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isAdmin ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                            isAdmin
                              ? "bg-indigo-600 text-white rounded-tr-none"
                              : "bg-slate-800 text-slate-300 rounded-tl-none border border-white/5"
                          }`}
                        >
                          {!isAdmin && (
                            <p className="text-[10px] font-bold text-indigo-400 mb-1">
                              {message.display_name || "Öğrenci"}
                            </p>
                          )}
                          <p className="whitespace-pre-wrap">{message.text}</p>
                          <p
                            className={`text-[9px] mt-1 text-right ${
                              isAdmin ? "text-white/60" : "text-slate-500"
                            }`}
                          >
                            {new Date(
                              message.ts ?? message.created_at ?? Date.now(),
                            ).toLocaleTimeString("tr-TR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-900/50 border-t border-white/10">
                  <div className="flex gap-2">
                    <textarea
                      value={replyText}
                      onChange={(event) => onReplyTextChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          onSendMessage(activeChatRoom.id, replyText);
                        }
                      }}
                      placeholder="Mesajınızı yazın..."
                      className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 h-10 resize-none"
                    />
                    <button
                      onClick={() => onSendMessage(activeChatRoom.id, replyText)}
                      className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white hover:bg-indigo-600 transition-colors"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <MessageSquareText className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm">
                  Konuşma seçmek için soldan bir oda seçin
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
