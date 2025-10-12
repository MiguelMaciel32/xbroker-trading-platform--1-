"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2, MessageCircle } from "lucide-react"
import type { SupportMessage } from "@/lib/types/support"
import Image from "next/image"

interface LiveChatProps {
  userId: string
  isAdmin?: boolean
  adminId?: string
}

export function LiveChat({ userId, isAdmin = false, adminId }: LiveChatProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadMessages()
    const unsubscribe = subscribeToMessages()

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId])

  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
    return () => clearTimeout(timer)
  }, [messages])

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error("[v0] Error loading messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`support-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "support_messages",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setMessages((prev) => {
            const exists = prev.some((msg) => msg.id === payload.new.id)
            if (exists) return prev
            return [...prev, payload.new as SupportMessage]
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return

    setSending(true)
    const tempMessage = newMessage.trim()
    setNewMessage("")

    try {
      const messageData: any = {
        user_id: userId,
        sender_type: isAdmin ? "admin" : "client",
        message: tempMessage,
      }

      if (isAdmin && adminId) {
        messageData.admin_id = adminId
      }

      const { error } = await supabase.from("support_messages").insert(messageData)

      if (error) throw error
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      setNewMessage(tempMessage)
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[500px] border border-gray-200 rounded-lg bg-white">
      <div className="flex-1 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-center">
                <MessageCircle className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500 text-sm">Nenhuma mensagem ainda</p>
                <p className="text-gray-400 text-xs mt-1">Envie uma mensagem para começar</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwnMessage = isAdmin ? msg.sender_type === "admin" : msg.sender_type === "client"
                  const isAdminMessage = msg.sender_type === "admin"

                  return (
                    <div key={msg.id} className={`flex gap-2 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
                      {!isOwnMessage && isAdminMessage && (
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-gray-200">
                            <Image
                              src="/images/support-avatar.jpg"
                              alt="Suporte"
                              width={36}
                              height={36}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                      )}

                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                          isOwnMessage ? "bg-black text-white" : "bg-gray-100 text-black border border-gray-200"
                        }`}
                      >
                        {isAdminMessage && !isOwnMessage && (
                          <p className="text-xs font-semibold text-gray-600 mb-1">Suporte</p>
                        )}
                        <p className="text-base break-words leading-relaxed">{msg.message}</p>
                        <p className={`text-xs mt-1.5 ${isOwnMessage ? "text-gray-400" : "text-gray-500"}`}>
                          {new Date(msg.created_at).toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="bg-white border-gray-300 text-black placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
            disabled={sending}
          />
          <Button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            size="icon"
            className="bg-black hover:bg-gray-800 text-white shrink-0"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
