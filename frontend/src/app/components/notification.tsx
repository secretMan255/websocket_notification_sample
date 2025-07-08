'use client'
import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'

type NotificationType = "new_message" | "system_alert" | "order_update" | "system_update"

interface Notification {
    id: number,
    type: NotificationType,
    message: string,
}

type Orders = Record<string, number>

interface Props {
    position?: 'top' | 'bottom'
    onOrders: (orders: Orders) => void
}

export default function NotificationBar({ position = 'top', onOrders }: Props) {
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        const socket: SocketIOClient.Socket = io('http://localhost:8080')

        socket.on('notification', (data: any) => {
            const id: number = Date.now()

            if (data.message && data.type) {
                setNotifications(prev => [...prev, { id, ...data }])

                setTimeout(() => {
                    setNotifications(prev => prev.filter(n => n.id !== id))
                }, 5000)
            }

            if (data.orders) {
                onOrders(data.orders)
            }
        })

        return () => {
            socket.disconnect()
        }
    }, [])

    const dismiss = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    return (
        <div className={`notification-container ${position}`}>
            {
                notifications.map(n => (
                    <div key={n.id} className={`notification ${n.type}`}>
                        <span>{n.message}</span>
                        <button onClick={() => dismiss(n.id)}>X</button>
                    </div>
                ))
            }
        </div>
    )
}