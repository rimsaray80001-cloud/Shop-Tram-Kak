// Shop System - Main JavaScript File

// App State
const appState = {
    transactions: [],
    settings: {
        shopName: 'ស្មាតសប អេចប្រេស ត្រាំកក់',
        shopAddress: '',
        shopPhone: '',
        shopEmail: '',
        currency: 'USD',
        language: 'km',
        darkMode: false
    },
    stats: {
        todaySales: 0,
        transactionCount: 0,
        customerCount: 0,
        totalRevenue: 0
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    loadSettings();
    setupEventListeners();
    updateDateTime();
    updateStats();
    loadTransactions();
    
    // Update date/time every second
    setInterval(updateDateTime, 1000);
}

// Date and Time
function updateDateTime() {
    const now = new Date();
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    };
    
    const dateTimeStr = now.toLocaleDateString('en-US', options);
    document.getElementById('datetime').textContent = dateTimeStr;
}

// Event Listeners
function setupEventListeners() {
    // Menu navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', () => handleMenuClick(item));
    });
    
    // Settings buttons
    document.getElementById('saveSettings').addEventListener('click', saveSettings);
    document.getElementById('resetSettings').addEventListener('click', resetSettings);
    
    // Dark mode toggle
    document.getElementById('darkMode').addEventListener('change', toggleDarkMode);
}

// Navigation
function handleMenuClick(clickedItem) {
    // Remove active class from all menu items
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to clicked item
    clickedItem.classList.add('active');
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const pageName = clickedItem.getAttribute('data-page');
    const selectedPage = document.getElementById(`${pageName}-page`);
    if (selectedPage) {
        selectedPage.classList.add('active');
    }
}

// Stats Management
function updateStats() {
    document.getElementById('todaySales').textContent = formatCurrency(appState.stats.todaySales);
    document.getElementById('transactionCount').textContent = appState.stats.transactionCount;
    document.getElementById('customerCount').textContent = appState.stats.customerCount;
    document.getElementById('totalRevenue').textContent = formatCurrency(appState.stats.totalRevenue);
}

function formatCurrency(amount) {
    const currency = appState.settings.currency;
    const symbols = {
        USD: '$',
        KHR: '៛',
        THB: '฿'
    };
    
    return `${symbols[currency]}${amount.toFixed(2)}`;
}

// Transactions Management
function loadTransactions() {
    // Load from localStorage
    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
        appState.transactions = JSON.parse(savedTransactions);
        calculateStats();
        renderTransactions();
    }
}

function renderTransactions() {
    const tbody = document.getElementById('transactionTableBody');
    
    if (appState.transactions.length === 0) {
        tbody.innerHTML = '<tr class="empty-state"><td colspan="5">No transactions yet</td></tr>';
        return;
    }
    
    // Show last 10 transactions
    const recentTransactions = appState.transactions.slice(-10).reverse();
    
    tbody.innerHTML = recentTransactions.map(transaction => `
        <tr>
            <td><strong>#${transaction.id}</strong></td>
            <td>${formatDateTime(transaction.date)}</td>
            <td>${transaction.customer || 'Walk-in'}</td>
            <td><strong>${formatCurrency(transaction.amount)}</strong></td>
            <td><span class="status-badge ${transaction.status}">${transaction.status}</span></td>
        </tr>
    `).join('');
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateStats() {
    const today = new Date().toDateString();
    
    appState.stats.transactionCount = appState.transactions.length;
    appState.stats.totalRevenue = appState.transactions.reduce((sum, t) => sum + t.amount, 0);
    appState.stats.todaySales = appState.transactions
        .filter(t => new Date(t.date).toDateString() === today)
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Count unique customers
    const uniqueCustomers = new Set(appState.transactions.map(t => t.customer));
    appState.stats.customerCount = uniqueCustomers.size;
    
    updateStats();
}

function saveTransaction(transaction) {
    appState.transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(appState.transactions));
    calculateStats();
    renderTransactions();
}

// Settings Management
function loadSettings() {
    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
        appState.settings = { ...appState.settings, ...JSON.parse(savedSettings) };
    }
    
    // Populate form fields
    document.getElementById('shopName').value = appState.settings.shopName;
    document.getElementById('shopAddress').value = appState.settings.shopAddress;
    document.getElementById('shopPhone').value = appState.settings.shopPhone;
    document.getElementById('shopEmail').value = appState.settings.shopEmail;
    document.getElementById('currency').value = appState.settings.currency;
    document.getElementById('language').value = appState.settings.language;
    document.getElementById('darkMode').checked = appState.settings.darkMode;
    
    if (appState.settings.darkMode) {
        document.body.classList.add('dark-mode');
    }
}

function saveSettings() {
    // Get form values
    appState.settings.shopName = document.getElementById('shopName').value;
    appState.settings.shopAddress = document.getElementById('shopAddress').value;
    appState.settings.shopPhone = document.getElementById('shopPhone').value;
    appState.settings.shopEmail = document.getElementById('shopEmail').value;
    appState.settings.currency = document.getElementById('currency').value;
    appState.settings.language = document.getElementById('language').value;
    appState.settings.darkMode = document.getElementById('darkMode').checked;
    
    // Save to localStorage
    localStorage.setItem('settings', JSON.stringify(appState.settings));
    
    // Update header title
    document.querySelector('.header-title').textContent = appState.settings.shopName;
    
    // Update stats display
    updateStats();
    
    // Show success message
    showNotification('Settings saved successfully!', 'success');
}

function resetSettings() {
    if (confirm('Are you sure you want to reset all settings to default?')) {
        localStorage.removeItem('settings');
        appState.settings = {
            shopName: 'ស្មាតសប អេចប្រេស ត្រាំកក់',
            shopAddress: '',
            shopPhone: '',
            shopEmail: '',
            currency: 'USD',
            language: 'km',
            darkMode: false
        };
        loadSettings();
        showNotification('Settings reset to default!', 'success');
    }
}

function toggleDarkMode(event) {
    if (event.target.checked) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// Notifications
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Utility function to generate transaction ID
function generateTransactionId() {
    return 'TXN' + Date.now() + Math.floor(Math.random() * 1000);
}

// Example: Add demo transaction (for testing)
function addDemoTransaction() {
    const demoTransaction = {
        id: generateTransactionId(),
        date: new Date().toISOString(),
        customer: 'John Doe',
        amount: Math.random() * 100 + 10,
        status: 'completed'
    };
    saveTransaction(demoTransaction);
}

// Export functions for later use
window.shopSystem = {
    saveTransaction,
    generateTransactionId,
    addDemoTransaction
};