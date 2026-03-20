const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('client'));

const DATA_FILE = './server/data.json';

// GET all expenses
app.get('/api/expenses', (req, res) => {
    const data = fs.readFileSync(DATA_FILE);
    res.json(JSON.parse(data));
});

// ADD expense (FIXED ✅)
app.post('/api/expenses', (req, res) => {
    const data = fs.readFileSync(DATA_FILE);
    const expenses = JSON.parse(data);

    const newExpense = {
        id: Date.now(),
        title: req.body.title,
        amount: Number(req.body.amount), // 🔥 IMPORTANT FIX
        category: req.body.category
    };

    expenses.push(newExpense);

    fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2));

    res.json(newExpense);
});

// DELETE expense
app.delete('/api/expenses/:id', (req, res) => {
    const id = Number(req.params.id);

    const data = fs.readFileSync(DATA_FILE);
    let expenses = JSON.parse(data);

    expenses = expenses.filter(exp => exp.id !== id);

    fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2));

    res.json({ message: 'Deleted successfully' });
});

// Server start
app.listen(5000, () => {
    console.log('Server running on port 5000 🚀');
});