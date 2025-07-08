'use client'
import NotificationBar from './components/notification';
import { useState } from 'react';

export default function Home() {
  const [orders, setOrders] = useState<Record<string, number>>({})

  return (
    <div className="w-full flex flex-col items-center">
      <NotificationBar position='top' onOrders={setOrders}></NotificationBar>

      <div className="orders-container">
        <h3>Orders</h3>
        {Object.entries(orders).map(([name, qty]) => (
          <div key={name}>
            {name}: {qty}
          </div>
        ))}
      </div>
    </div>
  );
}
