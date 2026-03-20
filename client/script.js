// ==========================
// script.js for Modern Expense Tracker
// ==========================

// Global chart variable
let expenseChart;

// --------------------------
// FORM HANDLE (index.html)
// --------------------------
const form = document.getElementById('expenseForm');
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const title = document.getElementById('title').value;
        const amount = document.getElementById('amount').value;
        const category = document.getElementById('category').value;

        if (!title || !amount || !category) {
            document.getElementById('message').innerText = "Please fill all fields!";
            return;
        }

        const expense = { title, amount, category };

        // POST to backend
        await fetch('http://localhost:5000/api/expenses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(expense)
        });

        document.getElementById('message').innerText = "Expense Added Successfully!";
        form.reset();

        // Reload dashboard if open
        if (document.getElementById('expenseCards')) loadExpenses();
    });
}

// --------------------------
// DASHBOARD FUNCTIONALITY
// --------------------------
const categoryFilter = document.getElementById('categoryFilter');
const expenseCards = document.getElementById('expenseCards');

async function loadExpenses(filter = 'all') {
    const res = await fetch('http://localhost:5000/api/expenses');
    const data = await res.json();

    if (!expenseCards) return;

    expenseCards.innerHTML = '';
    let total = 0;

    // Fill category dropdown dynamically
    if (categoryFilter) {
        const categories = new Set(['all']);
        data.forEach(exp => categories.add(exp.category || 'No Category'));
        categoryFilter.innerHTML = '';
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            if (cat === filter) option.selected = true;
            categoryFilter.appendChild(option);
        });
    }

    // Filter data
    const filteredData = filter === 'all' ? data : data.filter(exp => exp.category === filter);

    filteredData.forEach(exp => {
        const card = document.createElement('div');
        card.classList.add('expense-card');

        card.innerHTML = `
            <h3>${exp.title || 'No Title'}</h3>
            <p>Amount: ₹${exp.amount || 0}</p>
            <p>Category: ${exp.category || 'No Category'}</p>
        `;

        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.classList.add('edit-btn');
        editBtn.onclick = () => editExpense(exp);

        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.classList.add('delete-btn');
        delBtn.onclick = async () => {
            await fetch(`http://localhost:5000/api/expenses/${exp.id}`, { method: 'DELETE' });
            loadExpenses(categoryFilter ? categoryFilter.value : 'all');
        };

        card.appendChild(editBtn);
        card.appendChild(delBtn);

        expenseCards.appendChild(card);

        total += Number(exp.amount || 0);
    });

    // Update total
    const totalElement = document.getElementById('totalAmount');
    if (totalElement) totalElement.innerText = `Total: ₹${total}`;

    // Update chart
    updateChart(filteredData);
}

// --------------------------
// Edit Expense Function
// --------------------------
function editExpense(exp) {
    const newTitle = prompt('Enter new title:', exp.title);
    if (newTitle === null) return;

    const newAmount = prompt('Enter new amount:', exp.amount);
    if (newAmount === null) return;

    const newCategory = prompt('Enter new category:', exp.category);
    if (newCategory === null) return;

    fetch(`http://localhost:5000/api/expenses/${exp.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: newTitle,
            amount: newAmount,
            category: newCategory
        })
    }).then(() => loadExpenses(categoryFilter ? categoryFilter.value : 'all'));
}

// --------------------------
// Chart Update Function
// --------------------------
function updateChart(expenseData) {
    if (!expenseData || expenseData.length === 0) {
        if (expenseChart) expenseChart.destroy();
        expenseChart = null;
        return;
    }

    const categoryTotals = {};
    expenseData.forEach(exp => {
        const cat = exp.category || 'No Category';
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount || 0);
    });

    const labels = Object.keys(categoryTotals);
    const chartData = Object.values(categoryTotals);

    const ctx = document.getElementById('expenseChart').getContext('2d');

    if (expenseChart) expenseChart.destroy();

    expenseChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels,
            datasets: [{
                label: 'Expenses by Category',
                data: chartData,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(153, 102, 255, 0.6)',
                    'rgba(255, 159, 64, 0.6)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

// --------------------------
// Filter Change Listener
// --------------------------
if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
        loadExpenses(categoryFilter.value);
    });
}

// --------------------------
// Initial Load
// --------------------------
loadExpenses();