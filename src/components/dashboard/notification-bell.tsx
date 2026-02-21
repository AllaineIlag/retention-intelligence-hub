"use client"

import * as React from "react"
import { Bell, Check, Trash2 } from "lucide-react"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    AppNotification
} from "@/app/actions/notification-actions"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

export function NotificationBell() {
    const [notifications, setNotifications] = React.useState<AppNotification[]>([])
    const [unreadCount, setUnreadCount] = React.useState(0)
    const [isOpen, setIsOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(true)
    const [isMounted, setIsMounted] = React.useState(false)
    const router = useRouter()
    const supabase = createClient()

    const fetchNotifications = React.useCallback(async () => {
        const res = await getNotifications()
        if (res.success && res.data) {
            setNotifications(res.data)
            setUnreadCount(res.data.filter(n => !n.is_read).length)
        }
        setLoading(false)
    }, [])

    React.useEffect(() => {
        setIsMounted(true)
        fetchNotifications()

        // Realtime Subscription
        const channel = supabase
            .channel('notifications-changes')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    // Check if the notification belongs to the current user
                    // We need to know current user ID. 
                    // However, RLS might prevent receiving events for others if row security is on?
                    // Yes, Postgres changes respect RLS if enabled and configured correctly for the publication.
                    // But standard 'postgres_changes' usually broadcasts all unless 'filter' is used.
                    // For security, it's better to verify user_id or rely on RLS if using 'broadcast' (which requires special setup).
                    // Simpler approach: On ANY insert (if low volume) or filtered by user_id if possible in client (but 'user_id=eq.X' requires knowing ID here).
                    // We'll just refetch for simplicity and safety, ensuring we only get our own.
                    fetchNotifications()
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [fetchNotifications, supabase])

    const handleMarkAsRead = async (id: string, link?: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))

        await markAsRead(id)

        if (link) {
            setIsOpen(false)
            router.push(link)
        }
    }

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => { return { ...n, is_read: true } }))
        setUnreadCount(0)
        await markAllAsRead()
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <div className="h-2 w-2 rounded-full bg-green-500" />
            case 'warning': return <div className="h-2 w-2 rounded-full bg-amber-500" />
            case 'error': return <div className="h-2 w-2 rounded-full bg-red-500" />
            default: return <div className="h-2 w-2 rounded-full bg-indigo-500" />
        }
    }

    if (!isMounted) return (
        <Button variant="ghost" size="icon" className="relative text-zinc-400">
            <Bell className="h-5 w-5" />
        </Button>
    )

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-white/5 data-[state=open]:bg-white/5">
                    <Bell className={cn("h-5 w-5 transition-colors", unreadCount > 0 ? "text-indigo-400" : "text-zinc-400")} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#0f0f11] animate-pulse" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[calc(100vw-2rem)] sm:w-96 border-white/10 bg-[#0f0f11]/95 backdrop-blur-xl text-white p-0 shadow-2xl rounded-xl" align="end" sideOffset={10} collisionPadding={16}>
                <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-indigo-400" />
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-500/20">
                                {unreadCount} New
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-muted-foreground hover:text-white"
                            onClick={handleMarkAllRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[400px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-zinc-500 space-y-3">
                            <Bell className="h-10 w-10 opacity-10" />
                            <p className="text-sm font-medium text-zinc-400">All caught up</p>
                            <p className="text-xs max-w-[180px]">No new notifications to display at this time.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 transition-colors hover:bg-white/5 cursor-pointer flex gap-4 relative group",
                                        !notification.is_read ? "bg-indigo-500/[0.03]" : ""
                                    )}
                                    onClick={() => handleMarkAsRead(notification.id, notification.link)}
                                >
                                    <div className="mt-1.5 shrink-0">
                                        {getIcon(notification.type)}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <p className={cn("text-sm leading-tight", !notification.is_read ? "font-medium text-zinc-100" : "text-zinc-400")}>
                                            {notification.title}
                                        </p>
                                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                                            {notification.message}
                                        </p>
                                        <p className="text-[10px] text-zinc-600 font-mono pt-1">
                                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                        </p>
                                    </div>
                                    {!notification.is_read && (
                                        <div className="shrink-0 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-indigo-500/20" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

            </PopoverContent>
        </Popover>
    )
}
