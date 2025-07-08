import express, { Express, Request, Response } from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

let systemStatus: string = 'Active'
const orders: Record<string, number> = {}
const port: number = 8080

const app: Express = express()
app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const io = new Server(server, {
    cors: { origin: '*' }
})

io.on('connection', (socket) => {
    console.log(`client ${socket.id} connected`)
    socket.on('disconnect', () => {
        console.log(`client ${socket.id} disconnected`)
    })
})

// send notification
app.post('/message', (req: Request, res: Response) => {
    try {
        const message: string = req.body.message

        io.emit('notification', {
            type: 'new_message',
            message: message || 'new message'
        })
        res.json({ status: 0, data: { message: message } })
    } catch (err) {
        res.status(401).json({ status: 1, data: err })
    }
})

// system alert
app.post('/alert', (req: Request, res: Response) => {
    res.json({ status: 0, data: systemStatus })
})

// update system 
app.post('/update/system', (req: Request, res: Response) => {
    try {
        const { status } = req.body
        if (!status) {
            res.json({ status: 1, data: 'status required' })
            return
        }
        if (typeof status != 'string') {
            res.json({ status: 1, data: 'status required string' })
            return
        }

        if (!['Active', 'Inactive'].includes(status)) {
            res.json({ status: 1, data: "status accepted 'Active' or 'Inactive'" })
            return
        }

        systemStatus = status

        io.emit('notification', {
            type: 'system_update',
            message: `System status: ${status}`
        })

        res.json({ status: 0, data: `System status: ${status}` })
    } catch (err) {
        res.status(401).json({ status: 1, data: err })
    }
})

// get orders
app.get('/orders', (req: Request, res: Response) => {
    res.json({ status: 0, data: orders })
})

// add orders
app.post('/orders', (req: Request, res: Response) => {
    try {
        const { name, qty } = req.body
        if (!name || !qty) {
            res.json({ status: 1, data: 'name and qty required' })
            return
        }
        if (typeof name != 'string') {
            res.json({ status: 1, data: 'name required string' })
            return
        }
        if (typeof qty != 'number') {
            res.json({ status: 1, data: 'qty required number' })
            return
        }

        orders[name] = qty

        io.emit('notification', {
            type: 'order_update',
            message: `Order ${name} create with quantity ${qty}`,
            orders: orders
        })

        res.json({ status: 0, data: orders })
    } catch (err) {
        res.status(401).json({ status: 1, data: err })
    }
})

// delete order
app.post('/delete/order', (req: Request, res: Response) => {
    try {
        const { name } = req.body
        if (!name) {
            res.json({ status: 1, data: 'name required' })
            return
        }
        if (typeof name != 'string') {
            res.json({ status: 1, data: 'name required string' })
        }

        const order: number = orders[name]
        if (!(name in orders)) {
            io.emit('notification', {
                type: 'order_update',
                message: `Order ${name} not found`,
                orders: orders
            })
            res.json({ status: 1, data: `Order ${name} not found` })
            return
        }

        delete orders[name]

        io.emit('notification', {
            type: 'order_update',
            message: `Order ${name} deleted`,
            orders: orders
        })

        res.json({ status: 0, data: `Order ${name} deleted` })
    } catch (err) {
        res.status(401).json({ status: 1, data: err })
    }
})

// edit order
app.post('/edit/order', (req: Request, res: Response) => {
    try {
        const { name, qty } = req.body
        if (!name || !qty) {
            res.json({ status: 1, data: 'name and qty required' })
            return
        }
        if (typeof name != 'string') {
            res.json({ status: 1, data: 'name required string' })
            return
        }
        if (typeof qty != 'number') {
            res.json({ status: 1, data: 'qty required number' })
            return
        }

        if (!(name in orders)) {
            io.emit('notification', {
                type: 'order_update',
                message: `Order ${name} not found`,
                orders: orders
            })
            res.json({ status: 1, data: `Order ${name} not found` })
            return
        }

        orders[name] = qty

        io.emit('notification', {
            type: 'order_update',
            message: `Order ${name} updated quantity: ${qty}`,
            orders: orders
        })

        res.json({ status: 0, data: `Order ${name} updated quantity: ${qty}` })
    } catch (err) {
        res.status(401).json({ status: 1, data: err })
    }
})

server.listen(port, () => {
    console.log(`server listen on http://localhost:${port}`)
})