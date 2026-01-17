// Budget & Expense Tracker JavaScript

// Data storage
let transactions = [];
let budget = {
    monthly: 0,
    categoryLimits: {}
};
let savingsGoals = [];
let currentTab = 'transactions';

// Categories
const categories = {
    food: { name: 'Food', icon: 'ri-restaurant-line' },
    rent: { name: 'Rent', icon: 'ri-home-line' },
    transport: { name: 'Transport', icon: 'ri-car-line' },
    shopping: { name: 'Shopping', icon: 'ri-shopping-bag-line' },
    bills: { name: 'Bills', icon: 'ri-file-list-line' },
    emi: { name: 'EMI/Loans', icon: 'ri-bank-card-line' },
    health: { name: 'Health', icon: 'ri-heart-pulse-line' },
    entertainment: { name: 'Entertainment', icon: 'ri-gamepad-line' },
    education: { name: 'Education', icon: 'ri-book-line' },
    others: { name: 'Others', icon: 'ri-more-line' }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializeCharts();
    loadThemeFromStorage();
});

// Theme Management
let currentTheme = 'default';

// Load theme from storage
function loadThemeFromStorage() {
    const savedTheme = localStorage.getItem('budgetTrackerTheme');
    if (savedTheme) {
        switchTheme(savedTheme, false);
    }
}

// Switch theme
function switchTheme(themeName, saveToStorage = true) {
    const themeStyles = document.getElementById('theme-styles');
    
    // Remove existing theme
    themeStyles.textContent = '';
    
    // Load new theme
    if (themeName !== 'default') {
        const themeLink = document.createElement('link');
        themeLink.rel = 'stylesheet';
        themeLink.href = `theme-${themeName}.css`;
        themeStyles.appendChild(themeLink);
    }
    
    currentTheme = themeName;
    
    // Save to storage
    if (saveToStorage) {
        localStorage.setItem('budgetTrackerTheme', themeName);
        showMessage(`Theme changed to ${getThemeDisplayName(themeName)}`, 'success');
    }
    
    // Update charts for theme compatibility
    setTimeout(() => {
        if (expenseChart) expenseChart.update();
        if (categoryChart) categoryChart.update();
    }, 100);
}

// Get theme display name
function getThemeDisplayName(themeName) {
    const names = {
        'default': 'Default',
        'dark-fintech': 'Dark Fintech',
        'colorful-playful': 'Colorful Playful',
        'ultra-realistic': 'Ultra-Realistic',
        'minimal-icons': 'Minimal Icons',
        'mobile-hero': 'Mobile Hero',
        'indian-finance': 'Indian Finance'
    };
    return names[themeName] || themeName;
}

// Toggle theme switcher dropdown
function toggleThemeSwitcher() {
    const switcher = document.getElementById('theme-switcher');
    switcher.classList.toggle('hidden');
}

// Close theme switcher when clicking outside
document.addEventListener('click', function(event) {
    const switcher = document.getElementById('theme-switcher');
    const button = event.target.closest('button[onclick="toggleThemeSwitcher()"]');
    
    if (!button && !switcher.contains(event.target)) {
        switcher.classList.add('hidden');
    }
});


// Chart variables
let expenseChart = null;
let categoryChart = null;

// Initialize charts
function initializeCharts() {
    const expenseCtx = document.getElementById('expenseChart');
    const categoryCtx = document.getElementById('categoryChart');
    
    if (expenseCtx && categoryCtx) {
        // Expense trend chart
        expenseChart = new Chart(expenseCtx, {
            type: 'line',
            data: {
                labels: getLastSixMonths(),
                datasets: [{
                    label: 'Monthly Expenses',
                    data: getMonthlyExpenseData(),
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#ef4444',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return '₹' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
        
        // Category distribution chart
        categoryChart = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: getCategoryLabels(),
                datasets: [{
                    data: getCategoryData(),
                    backgroundColor: [
                        '#ef4444',
                        '#f59e0b', 
                        '#10b981',
                        '#3b82f6',
                        '#8b5cf6',
                        '#ec4899',
                        '#14b8a6',
                        '#f97316',
                        '#06b6d4',
                        '#84cc16'
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = '₹' + context.parsed.toFixed(2);
                                const percentage = ((context.parsed / context.dataset.data.reduce((a, b) => a + b, 0)) * 100).toFixed(1);
                                return label + ': ' + value + ' (' + percentage + '%)';
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
}

// Get last six months labels
function getLastSixMonths() {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push(date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    }
    return months;
}

// Get monthly expense data for chart
function getMonthlyExpenseData() {
    const data = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthExpenses = transactions
            .filter(t => {
                if (t.type !== 'expense') return false;
                const transactionDate = new Date(t.date);
                return transactionDate.getMonth() === date.getMonth() && 
                       transactionDate.getFullYear() === date.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);
        data.push(monthExpenses);
    }
    
    return data;
}

// Get category labels for chart
function getCategoryLabels() {
    const categoryExpenses = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!categoryExpenses[t.category]) {
                categoryExpenses[t.category] = 0;
            }
            categoryExpenses[t.category] += t.amount;
        });
    
    return Object.keys(categoryExpenses)
        .map(cat => categories[cat]?.name || cat)
        .slice(0, 5);
}

// Get category data for chart
function getCategoryData() {
    const categoryExpenses = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!categoryExpenses[t.category]) {
                categoryExpenses[t.category] = 0;
            }
            categoryExpenses[t.category] += t.amount;
        });
    
    return Object.values(categoryExpenses)
        .sort((a, b) => b - a)
        .slice(0, 5);
}

// Update charts with new data
function updateCharts() {
    if (expenseChart) {
        expenseChart.data.datasets[0].data = getMonthlyExpenseData();
        expenseChart.update();
    }
    
    if (categoryChart) {
        categoryChart.data.labels = getCategoryLabels();
        categoryChart.data.datasets[0].data = getCategoryData();
        categoryChart.update();
    }
}

function initializeApp() {
    loadDataFromStorage();
    updateCurrentDate();
    setDefaultDate();
    updateSummary();
    renderTransactions();
    setupEventListeners();
    initializeCategoryLimits();
    updateAllTabs();
}

// Setup event listeners
function setupEventListeners() {
    // Transaction form
    document.getElementById('transactionForm').addEventListener('submit', handleTransactionSubmit);
    
    // Transaction type change
    document.getElementById('transactionType').addEventListener('change', handleTransactionTypeChange);
    
    // Filters
    document.getElementById('filterCategory').addEventListener('change', renderTransactions);
    document.getElementById('filterType').addEventListener('change', renderTransactions);
    
    // Report period
    document.getElementById('reportPeriod').addEventListener('change', updateReports);
    
    // Initialize transaction type
    handleTransactionTypeChange();
}

// Handle transaction type change
function handleTransactionTypeChange() {
    const type = document.getElementById('transactionType').value;
    const categoryField = document.getElementById('categoryField');
    const incomeFrequencyField = document.getElementById('incomeFrequencyField');
    
    if (type === 'expense') {
        categoryField.classList.remove('hidden');
        incomeFrequencyField.classList.add('hidden');
    } else {
        categoryField.classList.add('hidden');
        incomeFrequencyField.classList.remove('hidden');
    }
}

// Handle transaction form submission
function handleTransactionSubmit(e) {
    e.preventDefault();
    
    const type = document.getElementById('transactionType').value;
    const description = document.getElementById('transactionDescription').value;
    const amount = parseFloat(document.getElementById('transactionAmount').value);
    const date = document.getElementById('transactionDate').value;
    
    const transaction = {
        id: Date.now(),
        type,
        description,
        amount,
        date,
        timestamp: new Date().toISOString()
    };
    
    if (type === 'expense') {
        transaction.category = document.getElementById('transactionCategory').value;
    } else {
        transaction.frequency = document.getElementById('incomeFrequency').value;
    }
    
    transactions.push(transaction);
    saveDataToStorage();
    
    // Reset form
    document.getElementById('transactionForm').reset();
    setDefaultDate();
    
    // Update UI
    updateSummary();
    renderTransactions();
    updateAllTabs();
    updateCharts();
    
    // Show success message
    showMessage('Transaction added successfully!', 'success');
}

// Render transactions list
function renderTransactions() {
    const container = document.getElementById('transactionsList');
    const categoryFilter = document.getElementById('filterCategory').value;
    const typeFilter = document.getElementById('filterType').value;
    
    let filteredTransactions = transactions.filter(t => {
        const categoryMatch = categoryFilter === 'all' || t.category === categoryFilter;
        const typeMatch = typeFilter === 'all' || t.type === typeFilter;
        return categoryMatch && typeMatch;
    });
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    if (filteredTransactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-inbox-line"></i>
                <p>No transactions found</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredTransactions.map(transaction => {
        const categoryInfo = transaction.category ? categories[transaction.category] : null;
        const isIncome = transaction.type === 'income';
        
        return `
            <div class="transaction-item ${isIncome ? 'income' : 'expense'} fade-in">
                <div class="flex items-center space-x-3">
                    <div class="flex-shrink-0">
                        ${isIncome 
                            ? '<i class="ri-arrow-up-circle-line text-2xl text-green-500"></i>'
                            : `<i class="${categoryInfo.icon} text-2xl text-red-500"></i>`
                        }
                    </div>
                    <div class="flex-1">
                        <p class="font-medium text-gray-900">${transaction.description}</p>
                        <p class="text-sm text-gray-500">
                            ${formatDate(transaction.date)}
                            ${transaction.category ? ` • ${categoryInfo.name}` : ''}
                            ${transaction.frequency ? ` • ${transaction.frequency}` : ''}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'}">
                            ${isIncome ? '+' : '-'}₹${transaction.amount.toFixed(2)}
                        </p>
                        <button onclick="deleteTransaction(${transaction.id})" class="text-gray-400 hover:text-red-500 text-sm">
                            <i class="ri-delete-bin-line"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Delete transaction
function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveDataToStorage();
        updateSummary();
        renderTransactions();
        updateAllTabs();
        updateCharts();
        showMessage('Transaction deleted', 'success');
    }
}

// Update summary cards
function updateSummary() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    document.getElementById('totalIncome').textContent = `₹${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${expenses.toFixed(2)}`;
    document.getElementById('balance').textContent = `₹${balance.toFixed(2)}`;
    
    // Update savings progress
    if (savingsGoals.length > 0) {
        const activeGoal = savingsGoals.find(g => !g.completed);
        if (activeGoal) {
            const progress = Math.min((balance / activeGoal.targetAmount) * 100, 100);
            document.getElementById('savingsProgress').textContent = `${progress.toFixed(1)}%`;
        } else {
            document.getElementById('savingsProgress').textContent = '100%';
        }
    } else {
        document.getElementById('savingsProgress').textContent = '0%';
    }
}

// Tab navigation
function showTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active', 'border-indigo-600', 'text-indigo-600');
        btn.classList.add('border-transparent', 'text-gray-600');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.remove('hidden');
    
    // Add active class to selected button
    const activeBtn = event.target;
    activeBtn.classList.add('active', 'border-indigo-600', 'text-indigo-600');
    activeBtn.classList.remove('border-transparent', 'text-gray-600');
    
    currentTab = tabName;
    updateTabContent(tabName);
}

// Show add expense modal (quick action)
function showAddExpenseModal() {
    // Switch to transactions tab and set expense type
    showTab('transactions');
    document.getElementById('transactionType').value = 'expense';
    handleTransactionTypeChange();
    
    // Scroll to form
    document.getElementById('transactionForm').scrollIntoView({ behavior: 'smooth' });
    
    // Focus on description field
    setTimeout(() => {
        document.getElementById('transactionDescription').focus();
    }, 300);
}

// Update tab content
function updateTabContent(tabName) {
    switch(tabName) {
        case 'transactions':
            // Transactions tab is already handled by renderTransactions()
            break;
        case 'auto-detection':
            updateAutoDetectionTab();
            break;
        case 'budget':
            updateBudgetTab();
            break;
        case 'savings':
            updateSavingsTab();
            break;
        case 'reports':
            updateReports();
            break;
        case 'insights':
            updateInsights();
            break;
    }
}

// Update all tabs
function updateAllTabs() {
    updateBudgetTab();
    updateSavingsTab();
    updateReports();
    updateInsights();
}

// Budget tab functions
function updateBudgetTab() {
    // Load monthly budget
    document.getElementById('monthlyBudget').value = budget.monthly || '';
    
    // Update category limits
    updateCategoryLimitsDisplay();
    
    // Update budget overview
    updateBudgetOverview();
}

function initializeCategoryLimits() {
    Object.keys(categories).forEach(category => {
        if (!budget.categoryLimits[category]) {
            budget.categoryLimits[category] = 0;
        }
    });
}

function updateCategoryLimitsDisplay() {
    const container = document.getElementById('categoryLimits');
    container.innerHTML = Object.keys(categories).map(category => `
        <div class="flex items-center justify-between">
            <label class="flex items-center space-x-2">
                <i class="${categories[category].icon}"></i>
                <span class="text-sm font-medium">${categories[category].name}</span>
            </label>
            <input type="number" 
                   id="limit-${category}" 
                   min="0" 
                   step="0.01" 
                   value="${budget.categoryLimits[category] || 0}"
                   class="w-24 px-2 py-1 border border-gray-300 rounded-md text-sm"
                   placeholder="0.00">
        </div>
    `).join('');
}

function saveBudget() {
    budget.monthly = parseFloat(document.getElementById('monthlyBudget').value) || 0;
    saveDataToStorage();
    updateBudgetOverview();
    showMessage('Budget saved successfully!', 'success');
}

function saveCategoryLimits() {
    Object.keys(categories).forEach(category => {
        const input = document.getElementById(`limit-${category}`);
        budget.categoryLimits[category] = parseFloat(input.value) || 0;
    });
    saveDataToStorage();
    updateBudgetOverview();
    showMessage('Category limits saved successfully!', 'success');
}

function updateBudgetOverview() {
    const container = document.getElementById('budgetOverview');
    const currentMonthExpenses = getCurrentMonthExpenses();
    
    // Overall budget status
    const budgetUsed = (currentMonthExpenses / budget.monthly) * 100;
    const remaining = budget.monthly - currentMonthExpenses;
    
    let budgetStatus = 'good';
    let statusColor = 'green';
    if (budgetUsed > 100) {
        budgetStatus = 'overspent';
        statusColor = 'red';
    } else if (budgetUsed > 80) {
        budgetStatus = 'warning';
        statusColor = 'yellow';
    }
    
    container.innerHTML = `
        <div class="category-budget-card ${budgetStatus === 'overspent' ? 'overspent' : budgetStatus === 'warning' ? 'warning' : ''}">
            <h4 class="font-medium text-gray-900 mb-2">Monthly Budget</h4>
            <div class="space-y-2">
                <div class="flex justify-between text-sm">
                    <span>Budget Used</span>
                    <span class="font-medium">₹${currentMonthExpenses.toFixed(2)} / ₹${budget.monthly.toFixed(2)}</span>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${statusColor === 'green' ? 'good' : statusColor === 'yellow' ? 'warning' : 'danger'}" 
                         style="width: ${Math.min(budgetUsed, 100)}%"></div>
                </div>
                <div class="flex justify-between text-sm">
                    <span>Remaining</span>
                    <span class="font-medium ${remaining < 0 ? 'text-red-600' : 'text-green-600'}">
                        ₹${remaining.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    // Category-wise budget
    Object.keys(categories).forEach(category => {
        const spent = getCategoryExpenses(category);
        const limit = budget.categoryLimits[category];
        const used = limit > 0 ? (spent / limit) * 100 : 0;
        
        if (limit > 0) {
            let categoryStatus = '';
            if (used > 100) {
                categoryStatus = 'overspent';
            } else if (used > 80) {
                categoryStatus = 'warning';
            }
            
            container.innerHTML += `
                <div class="category-budget-card ${categoryStatus}">
                    <div class="flex items-center space-x-2 mb-2">
                        <i class="${categories[category].icon}"></i>
                        <h4 class="font-medium text-gray-900">${categories[category].name}</h4>
                    </div>
                    <div class="space-y-2">
                        <div class="flex justify-between text-sm">
                            <span>Spent</span>
                            <span class="font-medium">₹${spent.toFixed(2)} / ₹${limit.toFixed(2)}</span>
                        </div>
                        <div class="budget-progress">
                            <div class="budget-progress-bar ${categoryStatus === 'overspent' ? 'danger' : categoryStatus === 'warning' ? 'warning' : 'good'}" 
                                 style="width: ${Math.min(used, 100)}%"></div>
                        </div>
                    </div>
                </div>
            `;
        }
    });
}

// Savings tab functions
function updateSavingsTab() {
    const container = document.getElementById('savingsGoals');
    
    if (savingsGoals.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="ri-piggy-bank-line"></i>
                <p>No savings goals set</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = savingsGoals.map(goal => {
        const currentBalance = getCurrentBalance();
        const progress = Math.min((currentBalance / goal.targetAmount) * 100, 100);
        const remaining = Math.max(goal.targetAmount - currentBalance, 0);
        const daysLeft = Math.ceil((new Date(goal.targetDate) - new Date()) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="savings-goal-card">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <h4 class="font-medium text-gray-900">${goal.name}</h4>
                        <p class="text-sm text-gray-500">Target: ${formatDate(goal.targetDate)}</p>
                    </div>
                    <button onclick="deleteGoal(${goal.id})" class="text-gray-400 hover:text-red-500">
                        <i class="ri-delete-bin-line"></i>
                    </button>
                </div>
                <div class="space-y-2">
                    <div class="flex justify-between text-sm">
                        <span>Progress</span>
                        <span class="font-medium">${progress.toFixed(1)}%</span>
                    </div>
                    <div class="savings-progress">
                        <div class="savings-progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span>Target Amount</span>
                        <span class="font-medium">₹${goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                        <span>Remaining</span>
                        <span class="font-medium ${remaining > 0 ? 'text-orange-600' : 'text-green-600'}">
                            ₹${remaining.toFixed(2)}
                        </span>
                    </div>
                    ${daysLeft > 0 ? `
                        <div class="text-sm text-gray-500">
                            ${daysLeft} days remaining
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function saveSavingsGoal() {
    const name = document.getElementById('goalName').value;
    const amount = parseFloat(document.getElementById('goalAmount').value);
    const date = document.getElementById('goalDate').value;
    
    if (!name || !amount || !date) {
        showMessage('Please fill all fields', 'error');
        return;
    }
    
    const goal = {
        id: Date.now(),
        name,
        targetAmount: amount,
        targetDate: date,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    savingsGoals.push(goal);
    saveDataToStorage();
    
    // Reset form
    document.getElementById('goalName').value = '';
    document.getElementById('goalAmount').value = '';
    document.getElementById('goalDate').value = '';
    
    updateSavingsTab();
    updateSummary();
    showMessage('Savings goal added successfully!', 'success');
}

function deleteGoal(id) {
    if (confirm('Are you sure you want to delete this savings goal?')) {
        savingsGoals = savingsGoals.filter(g => g.id !== id);
        saveDataToStorage();
        updateSavingsTab();
        updateSummary();
        showMessage('Savings goal deleted', 'success');
    }
}

// Reports tab functions
function updateReports() {
    const period = document.getElementById('reportPeriod').value;
    updateExpenseSummary(period);
    updateCategoryAnalysis();
    updateMonthComparison();
}

function updateExpenseSummary(period) {
    const container = document.getElementById('expenseSummary');
    const expenses = getExpensesByPeriod(period);
    
    if (expenses.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No expenses found for this period</p>';
        return;
    }
    
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const average = total / expenses.length;
    
    container.innerHTML = `
        <div class="space-y-3">
            <div class="flex justify-between">
                <span class="text-gray-600">Total Expenses</span>
                <span class="font-semibold">₹${total.toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Average per ${period === 'daily' ? 'day' : period === 'weekly' ? 'week' : 'month'}</span>
                <span class="font-semibold">₹${average.toFixed(2)}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-600">Number of Transactions</span>
                <span class="font-semibold">${expenses.length}</span>
            </div>
        </div>
    `;
}

function updateCategoryAnalysis() {
    const container = document.getElementById('categoryAnalysis');
    const categoryExpenses = {};
    
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!categoryExpenses[t.category]) {
                categoryExpenses[t.category] = 0;
            }
            categoryExpenses[t.category] += t.amount;
        });
    
    const sortedCategories = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    if (sortedCategories.length === 0) {
        container.innerHTML = '<p class="text-gray-500">No expense data available</p>';
        return;
    }
    
    const totalExpenses = Object.values(categoryExpenses).reduce((sum, amount) => sum + amount, 0);
    
    container.innerHTML = sortedCategories.map(([category, amount]) => {
        const percentage = (amount / totalExpenses) * 100;
        return `
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-2">
                    <i class="${categories[category].icon}"></i>
                    <span class="text-sm">${categories[category].name}</span>
                </div>
                <div class="text-right">
                    <div class="font-medium">₹${amount.toFixed(2)}</div>
                    <div class="text-xs text-gray-500">${percentage.toFixed(1)}%</div>
                </div>
            </div>
        `;
    }).join('');
}

function updateMonthComparison() {
    const container = document.getElementById('monthComparison');
    const currentMonth = getCurrentMonthExpenses();
    const lastMonth = getLastMonthExpenses();
    const change = currentMonth - lastMonth;
    const changePercent = lastMonth > 0 ? (change / lastMonth) * 100 : 0;
    
    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center">
                <p class="text-sm text-gray-600">Last Month</p>
                <p class="text-xl font-semibold">₹${lastMonth.toFixed(2)}</p>
            </div>
            <div class="text-center">
                <p class="text-sm text-gray-600">Current Month</p>
                <p class="text-xl font-semibold">₹${currentMonth.toFixed(2)}</p>
            </div>
            <div class="text-center">
                <p class="text-sm text-gray-600">Change</p>
                <p class="text-xl font-semibold ${change > 0 ? 'text-red-600' : 'text-green-600'}">
                    ${change > 0 ? '+' : ''}₹${change.toFixed(2)} (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)
                </p>
            </div>
        </div>
    `;
}

// Insights tab functions
function updateInsights() {
    updateSpendingInsights();
    updateBudgetWarnings();
    updateSuggestions();
}

function updateSpendingInsights() {
    const container = document.getElementById('spendingInsights');
    const insights = [];
    
    // Highest spending category
    const categoryExpenses = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!categoryExpenses[t.category]) {
                categoryExpenses[t.category] = 0;
            }
            categoryExpenses[t.category] += t.amount;
        });
    
    const highestCategory = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a)[0];
    
    if (highestCategory) {
        insights.push({
            type: 'info',
            icon: 'ri-bar-chart-line',
            title: 'Highest Spending Category',
            message: `You spend the most on ${categories[highestCategory[0]].name} (₹${highestCategory[1].toFixed(2)})`
        });
    }
    
    // Fixed vs variable expenses
    const fixedExpenses = transactions
        .filter(t => t.type === 'expense' && ['rent', 'emi', 'bills'].includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const variableExpenses = transactions
        .filter(t => t.type === 'expense' && !['rent', 'emi', 'bills'].includes(t.category))
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = fixedExpenses + variableExpenses;
    if (totalExpenses > 0) {
        const fixedPercent = (fixedExpenses / totalExpenses) * 100;
        insights.push({
            type: 'info',
            icon: 'ri-pie-chart-line',
            title: 'Fixed vs Variable Expenses',
            message: `${fixedPercent.toFixed(1)}% of your expenses are fixed (₹${fixedExpenses.toFixed(2)})`
        });
    }
    
    container.innerHTML = insights.map(insight => `
        <div class="insight-card ${insight.type}">
            <div class="flex items-start space-x-3">
                <i class="${insight.icon} text-xl"></i>
                <div>
                    <h4 class="font-medium text-gray-900">${insight.title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${insight.message}</p>
                </div>
            </div>
        </div>
    `).join('');
}

function updateBudgetWarnings() {
    const container = document.getElementById('budgetWarnings');
    const warnings = [];
    
    const currentMonthExpenses = getCurrentMonthExpenses();
    
    // Check if expenses exceed income
    const currentIncome = getCurrentMonthIncome();
    if (currentMonthExpenses > currentIncome) {
        warnings.push({
            type: 'danger',
            icon: 'ri-alert-line',
            title: 'Expenses Exceed Income',
            message: `Your expenses (₹${currentMonthExpenses.toFixed(2)}) are higher than your income (₹${currentIncome.toFixed(2)})`
        });
    }
    
    // Check budget overspending
    if (budget.monthly > 0 && currentMonthExpenses > budget.monthly) {
        warnings.push({
            type: 'danger',
            icon: 'ri-alert-line',
            title: 'Budget Overspent',
            message: `You've spent ₹${(currentMonthExpenses - budget.monthly).toFixed(2)} over your monthly budget`
        });
    }
    
    // Check category limits
    Object.keys(categories).forEach(category => {
        const spent = getCategoryExpenses(category);
        const limit = budget.categoryLimits[category];
        if (limit > 0 && spent > limit) {
            warnings.push({
                type: 'warning',
                icon: 'ri-alert-line',
                title: 'Category Limit Exceeded',
                message: `${categories[category].name} spending (₹${spent.toFixed(2)}) exceeds limit (₹${limit.toFixed(2)})`
            });
        }
    });
    
    if (warnings.length === 0) {
        container.innerHTML = `
            <div class="insight-card success">
                <div class="flex items-center space-x-3">
                    <i class="ri-checkbox-circle-line text-xl"></i>
                    <div>
                        <h4 class="font-medium text-gray-900">All Good!</h4>
                        <p class="text-sm text-gray-600 mt-1">No budget warnings at this time</p>
                    </div>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = warnings.map(warning => `
            <div class="insight-card ${warning.type}">
                <div class="flex items-start space-x-3">
                    <i class="${warning.icon} text-xl"></i>
                    <div>
                        <h4 class="font-medium text-gray-900">${warning.title}</h4>
                        <p class="text-sm text-gray-600 mt-1">${warning.message}</p>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function updateSuggestions() {
    const container = document.getElementById('suggestions');
    const suggestions = [];
    
    const categoryExpenses = {};
    transactions
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!categoryExpenses[t.category]) {
                categoryExpenses[t.category] = 0;
            }
            categoryExpenses[t.category] += t.amount;
        });
    
    // Suggest reducing highest spending category
    const sortedCategories = Object.entries(categoryExpenses)
        .sort(([,a], [,b]) => b - a);
    
    if (sortedCategories.length > 0) {
        const [category, amount] = sortedCategories[0];
        suggestions.push({
            type: 'info',
            icon: 'ri-lightbulb-line',
            title: 'Reduce Spending',
            message: `Consider reducing ${categories[category].name} expenses by 10-20% to save ₹${(amount * 0.1).toFixed(2)} per month`
        });
    }
    
    // Suggest setting up savings
    if (savingsGoals.length === 0) {
        suggestions.push({
            type: 'info',
            icon: 'ri-piggy-bank-line',
            title: 'Start Saving',
            message: 'Set up a savings goal to build better financial habits'
        });
    }
    
    // Suggest budget planning
    if (budget.monthly === 0) {
        suggestions.push({
            type: 'info',
            icon: 'ri-calculator-line',
            title: 'Set a Budget',
            message: 'Create a monthly budget to better control your spending'
        });
    }
    
    container.innerHTML = suggestions.map(suggestion => `
        <div class="insight-card ${suggestion.type}">
            <div class="flex items-start space-x-3">
                <i class="${suggestion.icon} text-xl"></i>
                <div>
                    <h4 class="font-medium text-gray-900">${suggestion.title}</h4>
                    <p class="text-sm text-gray-600 mt-1">${suggestion.message}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Utility functions
function getCurrentBalance() {
    const income = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    return income - expenses;
}

function getCurrentMonthExpenses() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
        .filter(t => {
            if (t.type !== 'expense') return false;
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

function getCurrentMonthIncome() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
        .filter(t => {
            if (t.type !== 'income') return false;
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

function getLastMonthExpenses() {
    const now = new Date();
    const lastMonth = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
    const lastMonthYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
    
    return transactions
        .filter(t => {
            if (t.type !== 'expense') return false;
            const date = new Date(t.date);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

function getCategoryExpenses(category) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    return transactions
        .filter(t => {
            if (t.type !== 'expense' || t.category !== category) return false;
            const date = new Date(t.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, t) => sum + t.amount, 0);
}

function getExpensesByPeriod(period) {
    const now = new Date();
    let startDate;
    
    switch(period) {
        case 'daily':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case 'weekly':
            const dayOfWeek = now.getDay();
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek);
            break;
        case 'monthly':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
    }
    
    return transactions
        .filter(t => {
            if (t.type !== 'expense') return false;
            const date = new Date(t.date);
            return date >= startDate;
        });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
    });
}

function updateCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    const today = new Date();
    dateElement.textContent = today.toLocaleDateString('en-IN', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
}

function showMessage(message, type) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `${type}-message fade-in`;
    messageDiv.textContent = message;
    
    // Insert at the top of the main content
    const main = document.querySelector('main');
    main.insertBefore(messageDiv, main.firstChild);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Data persistence
function saveDataToStorage() {
    const data = {
        transactions,
        budget,
        savingsGoals
    };
    localStorage.setItem('budgetTrackerData', JSON.stringify(data));
}

function loadDataFromStorage() {
    const storedData = localStorage.getItem('budgetTrackerData');
    if (storedData) {
        const data = JSON.parse(storedData);
        transactions = data.transactions || [];
        budget = data.budget || { monthly: 0, categoryLimits: {} };
        savingsGoals = data.savingsGoals || [];
    }
}

function exportData() {
    const data = {
        transactions,
        budget,
        savingsGoals,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `budget-tracker-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    showMessage('Data exported successfully!', 'success');
}
