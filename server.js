const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// In-memory database for demo purposes
let orders = [];
let subscribers = [];

// ============ API ROUTES ============

// GET: Fetch all products
app.get('/api/products', (req, res) => {
    const products = [
        {
            id: 1,
            name: 'Wireless Headphones',
            price: 79.99,
            description: 'Premium noise-cancelling headphones',
            rating: 4.5,
            emoji: '🎧'
        },
        {
            id: 2,
            name: 'Smart Watch',
            price: 199.99,
            description: 'Advanced fitness tracking',
            rating: 4.8,
            emoji: '⌚'
        },
        {
            id: 3,
            name: 'USB-C Cable',
            price: 12.99,
            description: 'High-speed data transfer',
            rating: 4.3,
            emoji: '🔌'
        },
        {
            id: 4,
            name: 'Portable Charger',
            price: 34.99,
            description: '20000mAh capacity',
            rating: 4.6,
            emoji: '🔋'
        },
        {
            id: 5,
            name: 'Wireless Mouse',
            price: 24.99,
            description: 'Ergonomic design',
            rating: 4.4,
            emoji: '🖱️'
        },
        {
            id: 6,
            name: 'Phone Stand',
            price: 14.99,
            description: 'Adjustable angle',
            rating: 4.2,
            emoji: '📱'
        }
    ];
    res.json(products);
});

// GET: Fetch single product by ID
app.get('/api/products/:id', (req, res) => {
    const products = require('./products.json');
    const product = products.find(p => p.id === parseInt(req.params.id));
    
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
});

// POST: Create order
app.post('/api/orders', (req, res) => {
    const { items, email, name, address } = req.body;

    // Validation
    if (!items || items.length === 0) {
        return res.status(400).json({ error: 'Cart cannot be empty' });
    }

    if (!email || !name || !address) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate total
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    // Create order
    const order = {
        id: orders.length + 1,
        items,
        email,
        name,
        address,
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        status: 'pending',
        createdAt: new Date().toISOString()
    };

    orders.push(order);

    res.status(201).json({
        message: 'Order created successfully',
        order: order
    });
});

// GET: Fetch all orders
app.get('/api/orders', (req, res) => {
    res.json(orders);
});

// GET: Fetch order by ID
app.get('/api/orders/:id', (req, res) => {
    const order = orders.find(o => o.id === parseInt(req.params.id));
    
    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
});

// PUT: Update order status
app.put('/api/orders/:id', (req, res) => {
    const { status } = req.body;
    const order = orders.find(o => o.id === parseInt(req.params.id));

    if (!order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (!['pending', 'processing', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    order.status = status;
    res.json({ message: 'Order updated', order });
});

// POST: Subscribe to newsletter
app.post('/api/subscribe', (req, res) => {
    const { email } = req.body;

    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    if (subscribers.includes(email)) {
        return res.status(400).json({ error: 'Email already subscribed' });
    }

    subscribers.push(email);
    res.status(201).json({ message: 'Successfully subscribed to newsletter' });
});

// POST: Contact form submission
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    // In a real application, you would send an email here
    console.log(`New contact message from ${name} (${email}): ${message}`);

    res.status(201).json({
        message: 'Your message has been received. We will get back to you soon.'
    });
});

// GET: Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// ============ STATIC FILE ROUTES ============

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ============ START SERVER ============

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║    Nova Cart Server Running 🚀         ║
    ║                                        ║
    ║    URL: http://localhost:${PORT}        ║
    ║                                        ║
    ║    Available Endpoints:                ║
    ║    GET    /api/products                ║
    ║    GET    /api/products/:id            ║
    ║    POST   /api/orders                  ║
    ║    GET    /api/orders                  ║
    ║    GET    /api/orders/:id              ║
    ║    PUT    /api/orders/:id              ║
    ║    POST   /api/subscribe               ║
    ║    POST   /api/contact                 ║
    ║    GET    /api/health                  ║
    ╚════════════════════════════════════════╝
    `);
});

module.exports = app;
