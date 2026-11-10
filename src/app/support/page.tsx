"use client";

import { useApp } from "@/contexts/AppContext";
import { useState } from "react";
import {
  MessageSquare,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Send,
  LogIn,
  LifeBuoy,
} from "lucide-react";
import Link from "next/link";

export default function SupportPage() {
  const {
    currentUser,
    tickets,
    addTicket,
    addTicketReply,
    updateTicketStatus,
  } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        <div className="glass-panel rounded-2xl p-8 text-center max-w-md w-full border border-white/[0.08]">
          <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300 mx-auto mb-4">
            <LogIn size={22} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">
            Giriş Yapmalısınız
          </h2>
          <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
            Destek talebi oluşturmak veya yetkili yanıtlarını takip etmek için lütfen hesabınıza giriş yapın.
          </p>
          <Link
            href="/login?callbackUrl=/support"
            className="gradient-btn inline-block text-white font-medium text-xs rounded-lg px-6 py-2.5"
          >
            Giriş Yap
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === "admin";
  const userTickets = isAdmin
    ? tickets
    : tickets.filter((t) => t.userId === currentUser.id);

  const runTicketAction = async (action: () => void | Promise<void>) => {
    try {
      await action();
      return true;
    } catch (error) {
      alert(error instanceof Error ? error.message : "İşlem tamamlanamadı.");
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;
    if (!(await runTicketAction(() => addTicket({ subject: subject.trim(), message: message.trim() })))) return;
    setSubject("");
    setMessage("");
    setShowForm(false);
  };

  const handleReply = async (ticketId: string) => {
    if (!replyText.trim()) return;
    if (await runTicketAction(() => addTicketReply(ticketId, replyText.trim()))) setReplyText("");
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
      answered: "bg-amber-500/10 text-amber-300 border-amber-500/25",
      closed: "bg-zinc-800 text-zinc-400 border-zinc-700",
    };
    const labels: Record<string, string> = {
      open: "Açık",
      answered: "Yetkili Yanıtladı",
      closed: "Kapatıldı",
    };
    return (
      <span
        className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
          styles[status] || styles.open
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-zinc-300">
                <LifeBuoy size={16} />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Destek Talepleri
              </h1>
            </div>
            <p className="text-xs text-zinc-400">
              {isAdmin
                ? "Yönetici paneli: Tüm oyuncu destek taleplerini görüntüleyip yanıtlayabilirsiniz."
                : "Bir sorun veya sorunuz mu var? Destek talebi açarak ekibimize ulaşabilirsiniz."}
            </p>
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            className="gradient-btn flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-medium text-xs cursor-pointer shrink-0"
          >
            {showForm ? <X size={14} /> : <Plus size={14} />}
            <span>{showForm ? "İptal" : "Yeni Talep"}</span>
          </button>
        </div>

        {/* New Ticket Form */}
        {showForm && (
          <div className="glass-panel rounded-xl p-5 sm:p-6 mb-8 border border-white/[0.1]">
            <h2 className="text-base font-bold text-white mb-1">
              Yeni Destek Talebi Aç
            </h2>
            <p className="text-xs text-zinc-400 mb-4">
              Lütfen yaşadığınız durumu açıkça belirtin.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Konu Başlığı
                </label>
                <input
                  type="text"
                  placeholder="Örn: Kredi yükleme veya hesap durumu"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1">
                  Açıklama
                </label>
                <textarea
                  rows={4}
                  placeholder="Sorununuzu ayrıntılı bir şekilde açıklayın..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary px-4 py-2 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="gradient-btn px-5 py-2 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Talebi Gönder
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket List */}
        {userTickets.length === 0 ? (
          <div className="glass-panel rounded-xl p-10 text-center border border-white/[0.08]">
            <MessageSquare size={32} className="text-zinc-600 mx-auto mb-2.5" />
            <h3 className="text-sm font-semibold text-white mb-1">
              Henüz bir destek talebi bulunmuyor
            </h3>
            <p className="text-xs text-zinc-400">
              Yeni bir talep açmak için &ldquo;Yeni Talep&rdquo; butonunu kullanabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="glass-panel rounded-xl border border-white/[0.08] overflow-hidden transition-all"
              >
                {/* Header Row */}
                <div
                  onClick={() =>
                    setExpandedTicket(
                      expandedTicket === ticket.id ? null : ticket.id
                    )
                  }
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white truncate">
                        {ticket.subject}
                      </h3>
                      {statusBadge(ticket.status)}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-mono">
                      <span>{ticket.username}</span>
                      <span>•</span>
                      <span>
                        {new Date(ticket.createdAt).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span>•</span>
                      <span>{ticket.replies.length} yanıt</span>
                    </div>
                  </div>

                  <div className="text-zinc-500 p-1">
                    {expandedTicket === ticket.id ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </div>
                </div>

                {/* Details */}
                {expandedTicket === ticket.id && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-white/[0.06] space-y-3.5">
                    {/* First message */}
                    <div className="p-3.5 rounded-lg bg-black/40 border border-white/[0.06] mt-3.5">
                      <div className="flex items-center justify-between mb-1.5 text-[11px]">
                        <span className="font-semibold text-zinc-300">
                          {ticket.username}
                        </span>
                        <span className="text-zinc-500 font-mono">
                          {new Date(ticket.createdAt).toLocaleString("tr-TR")}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed whitespace-pre-line">
                        {ticket.message}
                      </p>
                    </div>

                    {/* Replies */}
                    {ticket.replies.length > 0 && (
                      <div className="space-y-2.5 pt-1">
                        {ticket.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
                              reply.isAdmin
                                ? "bg-purple-950/20 border-purple-500/30"
                                : "bg-black/30 border-white/[0.06]"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-semibold text-white">
                                  {reply.username}
                                </span>
                                {reply.isAdmin && (
                                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                    Yetkili
                                  </span>
                                )}
                              </div>
                              <span className="text-zinc-500 font-mono">
                                {new Date(reply.date || reply.createdAt || Date.now()).toLocaleString("tr-TR")}
                              </span>
                            </div>
                            <p className="text-zinc-300 whitespace-pre-line">
                              {reply.message}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Admin Status Switch */}
                    {isAdmin && (
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/[0.06]">
                        <span className="text-xs text-zinc-400 mr-1">
                          Durum:
                        </span>
                        {(["open", "answered", "closed"] as const).map((st) => (
                          <button
                            key={st}
                            onClick={() => runTicketAction(() => updateTicketStatus(ticket.id, st))}
                            className={`text-xs px-2.5 py-1 rounded font-medium transition-all cursor-pointer ${
                              ticket.status === st
                                ? "bg-purple-600 text-white"
                                : "bg-white/[0.04] text-zinc-400 hover:text-white"
                            }`}
                          >
                            {st === "open"
                              ? "Açık"
                              : st === "answered"
                              ? "Yanıtlandı"
                              : "Kapat"}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Reply Input */}
                    {ticket.status !== "closed" && (
                      <div className="pt-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Cevabınızı yazın..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleReply(ticket.id);
                            }}
                            className="flex-1 px-3.5 py-2 rounded-lg bg-black/40 border border-white/[0.08] focus:border-purple-400 text-white text-xs focus:outline-none transition-all placeholder:text-zinc-600"
                          />
                          <button
                            onClick={() => handleReply(ticket.id)}
                            className="gradient-btn px-4 py-2 rounded-lg text-white font-medium text-xs flex items-center gap-1.5 cursor-pointer shrink-0"
                          >
                            <Send size={12} />
                            Yanıtla
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
