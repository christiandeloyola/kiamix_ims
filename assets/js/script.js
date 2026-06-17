const INVENTORY_API =
'api/inventory';

// Application State
const state = {
    currentUser: null,
    isLoggedIn: false,
    currentPage: 'dashboard'
};

// Attachments array
let attachments = [];

// Inventory items cache for PO item price lookup
let inventoryItemsCache = [];

// ============================================
// SHIPPING METHOD HELPER FUNCTIONS
// ============================================
function getShippingMethodName(method) {
    const shippingMethods = {
        'ground': 'Standard Shipping',
        'express': 'Express Delivery',
        'pickup': 'Supplier Pickup',
        'local': 'Local Delivery',
        'Standard Shipping': 'Standard Shipping',
        'Express Delivery': 'Express Delivery',
        'Supplier Pickup': 'Supplier Pickup',
        'Local Delivery': 'Local Delivery'
    };
    return shippingMethods[method] || method || 'Not Specified';
}

function getShippingBadgeClass(method) {
    const badgeClasses = {
        'ground': 'shipping-ground',
        'express': 'shipping-express',
        'pickup': 'shipping-pickup',
        'local': 'shipping-local',
        'Standard Shipping': 'shipping-ground',
        'Express Delivery': 'shipping-express',
        'Supplier Pickup': 'shipping-pickup',
        'Local Delivery': 'shipping-local'
    };
    return badgeClasses[method] || 'shipping-ground';
}

function getStatusBadgeClass(status) {
    const badgeClasses = {
        'Pending': 'status-pending',
        'Approved': 'status-approved',
        'Shipped': 'status-shipped',
        'Delivered': 'status-delivered',
        'Cancelled': 'status-cancelled'
    };
    return badgeClasses[status] || '';
}

// ============================================
// MIGRATION FUNCTION - FIX EXISTING ORDERS
// ============================================
function migrateExistingOrders() {
    const orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
    let needsUpdate = false;
    
    orders.forEach(order => {
        if (!order.shippingMethod && order.shippingMethodDisplay) {
            const displayToMethod = {
                'Standard Shipping': 'ground',
                'Express Delivery': 'express',
                'Supplier Pickup': 'pickup',
                'Local Delivery': 'local'
            };
            order.shippingMethod = displayToMethod[order.shippingMethodDisplay] || 'ground';
            needsUpdate = true;
        }
        if (!order.shippingMethod && !order.shippingMethodDisplay) {
            order.shippingMethod = 'ground';
            order.shippingMethodDisplay = 'Standard Shipping';
            needsUpdate = true;
        }
        if (!order.hasOwnProperty('deliveredAt')) {
            order.deliveredAt = null;
            needsUpdate = true;
        }
    });
    
    if (needsUpdate) {
        localStorage.setItem('coffeeShopOrders', JSON.stringify(orders));
        console.log('✅ Existing orders migrated');
    }
}

// ============================================
// INITIALIZATION FUNCTIONS
// ============================================
function initializeData() {
    if (!localStorage.getItem('coffeeShopUsers')) {
        const defaultUsers = [
            { username: 'admin', password: 'admin123', name: 'Administrator', email: 'admin@kiamix.com', role: 'admin' },
            { username: 'manager', password: 'manager123', name: 'Store Manager', email: 'manager@kiamix.com', role: 'manager' },
            { username: 'staff', password: 'staff123', name: 'Staff Member', email: 'staff@kiamix.com', role: 'staff' }
        ];
        localStorage.setItem('coffeeShopUsers', JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem('coffeeShopInventory')) {
        const defaultItems = [
            { id: 1, name: 'Arabica Coffee Beans', category: 'coffee', quantity: 25, unit: 'kg', price: 950.99, supplier: 'Coffee Supply Co.', minQuantity: 5, status: 'in-stock', description: 'Premium Arabica beans from Colombia' },
            { id: 2, name: 'Espresso Roast', category: 'coffee', quantity: 18, unit: 'kg', price: 1125.50, supplier: 'Coffee Supply Co.', minQuantity: 5, status: 'in-stock', description: 'Dark roast for espresso' },
            { id: 3, name: 'Green Tea Leaves', category: 'tea', quantity: 8, unit: 'kg', price: 637.75, supplier: 'Tea Imports Ltd.', minQuantity: 3, status: 'low-stock', description: 'Organic green tea leaves' },
            { id: 4, name: 'Croissants', category: 'pastry', quantity: 48, unit: 'unit', price: 62.50, supplier: 'Bakery Supply Inc.', minQuantity: 20, status: 'in-stock', description: 'Freshly baked croissants' },
            { id: 5, name: 'Vanilla Syrup', category: 'syrup', quantity: 12, unit: 'liter', price: 449.99, supplier: 'Coffee Supply Co.', minQuantity: 5, status: 'in-stock', description: 'Pure vanilla syrup' },
            { id: 6, name: 'Whole Milk', category: 'milk', quantity: 15, unit: 'liter', price: 74.49, supplier: 'Dairy Distributors', minQuantity: 10, status: 'in-stock', description: 'Fresh whole milk' },
            { id: 7, name: 'Paper Cups (12oz)', category: 'cup', quantity: 1200, unit: 'unit', price: 6.00, supplier: 'Packaging Company', minQuantity: 500, status: 'in-stock', description: 'Eco-friendly paper cups' },
            { id: 8, name: 'Coffee Filters', category: 'cleaning', quantity: 300, unit: 'unit', price: 4.00, supplier: 'Coffee Supply Co.', minQuantity: 200, status: 'in-stock', description: '#4 coffee filters' }
        ];
        localStorage.setItem('coffeeShopInventory', JSON.stringify(defaultItems));
    }

    if (!localStorage.getItem('coffeeShopOrders')) {
        localStorage.setItem('coffeeShopOrders', JSON.stringify([]));
    }

    if (!localStorage.getItem('coffeeShopSuppliers')) {
        const defaultSuppliers = [
            { id: 1, name: 'Coffee Supply Co.', contact: 'John Smith', phone: '555-0123', email: 'john@coffeesupply.com', items: 'Coffee beans, syrups, filters' },
            { id: 2, name: 'Tea Imports Ltd.', contact: 'Sarah Johnson', phone: '555-0124', email: 'sarah@teaimports.com', items: 'Tea leaves, herbal teas' },
            { id: 3, name: 'Bakery Supply Inc.', contact: 'Michael Brown', phone: '555-0125', email: 'michael@bakerysupply.com', items: 'Pastries, baked goods' },
            { id: 4, name: 'Dairy Distributors', contact: 'Emily Davis', phone: '555-0126', email: 'emily@dairydist.com', items: 'Milk, cream, dairy products' },
            { id: 5, name: 'Packaging Company', contact: 'Robert Wilson', phone: '555-0127', email: 'robert@packagingco.com', items: 'Cups, lids, napkins' }
        ];
        localStorage.setItem('coffeeShopSuppliers', JSON.stringify(defaultSuppliers));
    }

    if (!localStorage.getItem('coffeeShopSettings')) {
        const defaultSettings = {
            shopName: 'KiAMiX CoffeeBar',
            shopAddress: '72 A. Mabini St, Rodriguez, Rizal (1860)',
            contactEmail: 'founder@kiamixcoffeebar.com',
            contactPhone: '0917 145 5202',
            lastUpdated: new Date().toISOString(),
            updatedBy: 'system'
        };
        localStorage.setItem('coffeeShopSettings', JSON.stringify(defaultSettings));
    }

    if (!localStorage.getItem('activeSessions')) {
        localStorage.setItem('activeSessions', JSON.stringify([]));
    }
    
    updateInventoryCache();
}

async function updateInventoryCache() {
    try {

        const response = await fetch(
            `${INVENTORY_API}/read.php`
        );

        inventoryItemsCache = await response.json();

    } catch (error) {

        console.error(
            'Error loading inventory cache:',
            error
        );

        inventoryItemsCache = [];
    }
}

function getItemPriceById(itemId) {
    const item = inventoryItemsCache.find(item => item.id === parseInt(itemId));
    return item ? item.price : 0;
}

function getItemDetailsById(itemId) {
    return inventoryItemsCache.find(item => item.id === parseInt(itemId));
}

// ============================================
// GENERATE PO NUMBER
// ============================================
function generatePONumber() {
    const orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
    if (orders.length === 0) return 'PO-001';
    const poNumbers = orders.map(order => {
        const match = order.poNumber.match(/PO-(\d+)/);
        return match ? parseInt(match[1]) : 0;
    });
    const maxNumber = Math.max(...poNumbers, 0);
    return `PO-${(maxNumber + 1).toString().padStart(3, '0')}`;
}

function reorderPONumbers() {
    const orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
    const sortedOrders = [...orders].sort((a, b) => new Date(a.date) - new Date(b.date) || a.id - b.id);
    const renumberedOrders = sortedOrders.map((order, index) => ({
        ...order,
        poNumber: `PO-${(index + 1).toString().padStart(3, '0')}`
    }));
    localStorage.setItem('coffeeShopOrders', JSON.stringify(renumberedOrders));
    return renumberedOrders;
}

function generateReferenceNumber() {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    return `${year}${month}${day}${randomNum}`;
}

function isReferenceNumberExists(refNumber) {
    const orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
    return orders.some(order => order.referenceNumber === refNumber);
}

function generateUniqueReferenceNumber() {
    let refNumber;
    let attempts = 0;
    const maxAttempts = 100;
    do {
        refNumber = generateReferenceNumber();
        attempts++;
        if (attempts > maxAttempts) {
            const timestamp = Date.now().toString().slice(-6);
            refNumber = `${timestamp}${Math.floor(1000 + Math.random() * 9000)}`;
            break;
        }
    } while (isReferenceNumberExists(refNumber));
    return refNumber;
}

async function loadNextPONumber() {

    try {

        const response = await fetch(
            'api/purchase_orders/get_next_po.php'
        );

        const data = await response.json();

        document.getElementById('po-number').value =
            data.po_number;

    } catch(error) {

        console.error(error);

    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// ============================================
// DOM ELEMENTS
// ============================================
const loginPage = document.getElementById('login-page');
const appContainer = document.getElementById('app-container');
const loginForm = document.querySelector('.login-form');
const registerForm = document.querySelector('.register-form');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const logoutBtn = document.getElementById('logout-btn');
const loggedInUser = document.getElementById('logged-in-user');
const sidebarMenuItems = document.querySelectorAll('.sidebar-menu li a');
const pages = document.querySelectorAll('.page');
const addItemBtn = document.getElementById('add-item-btn');
const addPoItemBtn = document.getElementById('add-po-item');
const submitPoBtn = document.getElementById('submit-po');
const clearFormBtn = document.getElementById('clear-form-btn');
const loginPasswordToggle = document.getElementById('login-password-toggle');
const regPasswordToggle = document.getElementById('reg-password-toggle');
const loginPasswordInput = document.getElementById('login-password');
const regPasswordInput = document.getElementById('reg-password');

// Initialize data
initializeData();

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    migrateExistingOrders();
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        state.currentUser = JSON.parse(savedUser);
        state.isLoggedIn = true;
        showApp();
    }

    const today = new Date().toISOString().split('T')[0];
    const poDateInput = document.getElementById('po-date');
    if (poDateInput) poDateInput.value = today;
    
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 7);
    const poExpectedDate = document.getElementById('po-expected-date');
    if (poExpectedDate) poExpectedDate.value = expectedDate.toISOString().split('T')[0];
    
    loadSuppliersForDropdowns();
    document.getElementById('po-items-container').addEventListener('input', updatePOTotal);
    
    loginPasswordToggle.addEventListener('click', function() {
        const type = loginPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPasswordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    regPasswordToggle.addEventListener('click', function() {
        const type = regPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        regPasswordInput.setAttribute('type', type);
        this.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    });
    
    if (clearFormBtn) clearFormBtn.addEventListener('click', clearInventoryForm);
    
    document.getElementById('cancel-po-btn')?.addEventListener('click', function() {
        if (confirm('Are you sure you want to cancel this purchase order?')) {
            clearPurchaseOrderForm();
            showPage('view-orders');
        }
    });
    
    document.getElementById('save-draft-btn')?.addEventListener('click', function() {
        showNotification('Purchase order saved as draft', 'info');
    });
    
    document.getElementById('report-period')?.addEventListener('change', function() {
        const customRange = document.getElementById('custom-date-range');
        if (customRange) customRange.style.display = this.value === 'custom' ? 'flex' : 'none';
    });
    
    const attachmentInput = document.getElementById('po-attachment-1');
    if (attachmentInput) attachmentInput.addEventListener('change', handleAttachmentUpload);
    
    const orderFilterStatus = document.getElementById('order-filter-status');
    const orderFilterSupplier = document.getElementById('order-filter-supplier');
    const orderFilterDate = document.getElementById('order-filter-date');
    const clearOrderFiltersBtn = document.getElementById('clear-order-filters');
    
    if (orderFilterStatus) orderFilterStatus.addEventListener('change', loadPurchaseOrders);
    if (orderFilterSupplier) orderFilterSupplier.addEventListener('change', loadPurchaseOrders);
    if (orderFilterDate) orderFilterDate.addEventListener('change', loadPurchaseOrders);
    if (clearOrderFiltersBtn) clearOrderFiltersBtn.addEventListener('click', clearOrderFilters);
    
    const generateReportBtn = document.getElementById('generate-report-btn');
    const exportReportBtn = document.getElementById('export-report-btn');
    
    if (generateReportBtn) generateReportBtn.addEventListener('click', generateReport);
    if (exportReportBtn) exportReportBtn.addEventListener('click', exportReport);
    
    const addSupplierBtn = document.getElementById('add-supplier-btn');
    if (addSupplierBtn) addSupplierBtn.addEventListener('click', showAddSupplierModal);
    
    initializeReports();
    initializePOItemEventListeners();
    initializeGeneralSettings();
    
    const settingsGeneralLink = document.querySelector('[data-page="settings-general"]');
    if (settingsGeneralLink) settingsGeneralLink.addEventListener('click', () => setTimeout(loadGeneralSettings, 100));
});

// Login/Register Form Toggle
showRegister.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
});

showLogin.addEventListener('click', function(e) {
    e.preventDefault();
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
});

// Login Functionality
loginBtn.addEventListener('click', function() {
    const usernameOrEmail = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const role = document.getElementById('login-role').value;

    if (!usernameOrEmail || !password) {
        showNotification('Please enter username/email and password', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('coffeeShopUsers'));
    const user = users.find(u => 
        (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
        u.password === password && 
        u.role === role
    );

    if (user) {
        state.currentUser = user;
        state.isLoggedIn = true;
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
        const existingSessionIndex = activeSessions.findIndex(session => session.username === user.username);
        
        if (existingSessionIndex !== -1) {
            activeSessions[existingSessionIndex].loginTime = new Date().toLocaleString();
            activeSessions[existingSessionIndex].status = 'Active';
        } else {
            activeSessions.push({
                username: user.username,
                name: user.name,
                role: user.role,
                loginTime: new Date().toLocaleString(),
                status: 'Active',
                ipAddress: '192.168.1.' + Math.floor(Math.random() * 255)
            });
        }
        localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
        showApp();
        showNotification(`Welcome back, ${user.name}!`, 'success');
    } else {
        showNotification('Invalid username/email, password, or role', 'error');
    }
});

// Registration Functionality
registerBtn.addEventListener('click', function() {
    const name = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;

    if (!name || !username || !password || !email) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    const users = JSON.parse(localStorage.getItem('coffeeShopUsers'));
    
    if (users.find(u => u.username === username)) {
        showNotification('Username already exists', 'error');
        return;
    }

    if (users.find(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }

    const newUser = { name, username, password, email, role };
    users.push(newUser);
    localStorage.setItem('coffeeShopUsers', JSON.stringify(users));

    showNotification('Registration successful! You can now login.', 'success');
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    
    document.getElementById('reg-name').value = '';
    document.getElementById('reg-username').value = '';
    document.getElementById('reg-password').value = '';
    document.getElementById('reg-email').value = '';
});

// Logout Functionality
logoutBtn.addEventListener('click', function() {
    if (state.currentUser) {
        const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
        const sessionIndex = activeSessions.findIndex(session => session.username === state.currentUser.username);
        if (sessionIndex !== -1) {
            activeSessions.splice(sessionIndex, 1);
            localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
        }
    }
    
    state.currentUser = null;
    state.isLoggedIn = false;
    localStorage.removeItem('currentUser');
    showLoginPage();
    showNotification('Logged out successfully', 'info');
});

// ============================================
// PAGE MANAGEMENT FUNCTIONS
// ============================================
function showApp() {
    loginPage.classList.add('hidden');
    appContainer.classList.remove('hidden');
    
    loggedInUser.textContent = state.currentUser.name;
    
    updateInventoryCache();
    updateDashboardStats();
    loadRecentItems();
    loadInventoryItems();
    loadPurchaseOrders();
    loadSuppliers();
    
    setActiveMenuItem('dashboard');
}

function showLoginPage() {
    appContainer.classList.add('hidden');
    loginPage.classList.remove('hidden');
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

sidebarMenuItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        const pageId = this.getAttribute('data-page');
        
        if (this.querySelector('.arrow')) {
            const dropdown = this.parentElement.querySelector('.dropdown-menu');
            dropdown.classList.toggle('show');
            const arrow = this.querySelector('.arrow i');
            arrow.style.transform = dropdown.classList.contains('show') ? 'rotate(90deg)' : 'rotate(0deg)';
        }
        
        let menuItem = this;
        if (this.parentElement.parentElement.classList.contains('dropdown-menu')) {
            menuItem = this.closest('.sidebar-menu li > a');
        }
        
        setActiveMenuItem(pageId);
        showPage(pageId);
    });
});

function setActiveMenuItem(pageId) {
    sidebarMenuItems.forEach(item => {
        item.classList.remove('active');
        if (item.querySelector('.arrow i')) {
            item.querySelector('.arrow i').style.transform = 'rotate(0deg)';
        }
    });
    
    let targetMenuItem = null;
    sidebarMenuItems.forEach(item => {
        if (item.getAttribute('data-page') === pageId) targetMenuItem = item;
    });
    
    if (!targetMenuItem) {
        const dropdownItems = document.querySelectorAll('.dropdown-menu li a');
        dropdownItems.forEach(item => {
            if (item.getAttribute('data-page') === pageId) {
                targetMenuItem = item.closest('.sidebar-menu li').querySelector('a:first-child');
                const dropdown = targetMenuItem.parentElement.querySelector('.dropdown-menu');
                if (dropdown) {
                    dropdown.classList.add('show');
                    const arrow = targetMenuItem.querySelector('.arrow i');
                    if (arrow) arrow.style.transform = 'rotate(90deg)';
                }
            }
        });
    }
    
    if (!targetMenuItem) {
        targetMenuItem = document.querySelector('[data-page="dashboard"]');
        pageId = 'dashboard';
    }
    
    if (targetMenuItem) targetMenuItem.classList.add('active');
    state.currentPage = pageId;
}

function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    
    if (targetPage) {
        targetPage.classList.add('active');
        
        if (pageId === 'dashboard') {
            updateDashboardStats();
            loadRecentItems();
        } else if (pageId === 'view-inventory') {
            loadInventoryItems();
        } else if (pageId === 'view-orders') {
            loadPurchaseOrders();
        } else if (pageId === 'user-management') {
            loadUsers();
            loadActiveSessions();
        } else if (pageId === 'suppliers') {
            loadSuppliers();
        } else if (pageId === 'reports') {
            generateReport();
        } else if (pageId === 'settings-general') {
            loadGeneralSettings();
        } else if (pageId === 'purchase-order') {
            loadNextPONumber();
            loadSuppliersForDropdowns();
            clearAttachments();
            const poSupplierSelect = document.getElementById('po-supplier');
            if (poSupplierSelect) poSupplierSelect.value = '';
            
            const poItemsContainer = document.getElementById('po-items-container');
            if (poItemsContainer) {
                const firstItem = poItemsContainer.querySelector('.po-item');
                if (firstItem) {
                    const itemSelect = firstItem.querySelector('.po-item-select');
                    if (itemSelect) itemSelect.innerHTML = '<option value="">Select an item</option>';
                    const priceInput = firstItem.querySelector('.po-item-price');
                    if (priceInput) priceInput.value = '0.00';
                    const totalInput = firstItem.querySelector('.po-item-total');
                    if (totalInput) totalInput.value = '₱0.00';
                    const deleteBtnContainer = firstItem.querySelector('.form-group:last-child');
                    if (deleteBtnContainer) deleteBtnContainer.style.visibility = 'hidden';
                }
            }
            updatePOTotal();
        }
    } else {
        showPage('dashboard');
    }
}

// ============================================
// DASHBOARD FUNCTIONS
// ============================================
async function updateDashboardStats() {

    try {

        const response = await fetch('api/inventory/read.php');
        const items = await response.json();

        document.getElementById('total-items').textContent =
            items.length;

        let totalValue = 0;
        let lowStockCount = 0;

        items.forEach(item => {

            totalValue +=
                parseFloat(item.quantity) *
                parseFloat(item.unit_price);

            if (
                parseFloat(item.quantity) <
                parseFloat(item.min_stock || 5)
            ) {
                lowStockCount++;
            }

        });

        document.getElementById('total-value').textContent =
            '₱' + totalValue.toFixed(2);

        document.getElementById('low-stock').textContent =
            lowStockCount;

    } catch (error) {

        console.error(error);

    }

}

async function loadRecentItems() {

    try {

        const response = await fetch('api/inventory/read.php');
        const items = await response.json();

        const recentItemsContainer =
            document.getElementById('recent-items');

        recentItemsContainer.innerHTML = '';

        const recentItems = items.slice(0, 5);

        if (recentItems.length === 0) {

            recentItemsContainer.innerHTML =
                '<tr><td colspan="5" style="text-align:center;padding:20px;color:#8d6e63;">No inventory items found.</td></tr>';

            return;
        }

        recentItems.forEach(item => {

            let statusText = '';
            let statusClass = '';

            if (parseFloat(item.quantity) <= 0) {

                statusText = 'Out of Stock';
                statusClass = 'status-out-of-stock';

            } else if (
                parseFloat(item.quantity) <
                parseFloat(item.min_stock || 5)
            ) {

                statusText = 'Low Stock';
                statusClass = 'status-low-stock';

            } else {

                statusText = 'In Stock';
                statusClass = 'status-in-stock';

            }

            const row = document.createElement('tr');

            row.innerHTML = `
                <td>${item.id}</td>
                <td>${item.item_name}</td>
                <td>${getCategoryBadge(item.category)}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>
            `;

            recentItemsContainer.appendChild(row);

        });

    } catch(error) {

        console.error(error);

    }

}

// ============================================
// INVENTORY FUNCTIONS - ALL ROLES CAN DELETE
// ============================================
async function loadInventoryItems() {

    const inventoryContainer =
        document.getElementById('inventory-items');

    inventoryContainer.innerHTML =
        '<tr><td colspan="8">Loading...</td></tr>';

    try {

        const response = await fetch(
            'api/inventory/read.php'
        );

        const items = await response.json();

        inventoryContainer.innerHTML = '';

        if (!items || items.length === 0) {

            inventoryContainer.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="text-align:center;padding:30px;">
                        No inventory items found.
                    </td>
                </tr>
            `;

            return;
        }

        items.forEach(item => {

            let statusText = '';
            let statusClass = '';

            const quantity = parseFloat(item.quantity);
            const minStock = parseFloat(item.min_stock);

            if (quantity <= 0) {

                statusText = 'Out of Stock';
                statusClass = 'status-out-of-stock';

            } else if (quantity < minStock) {

                statusText = 'Low Stock';
                statusClass = 'status-low-stock';

            } else {

                statusText = 'In Stock';
                statusClass = 'status-in-stock';

            }

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>${item.id}</td>

                <td>${item.item_name}</td>

                <td>${getCategoryBadge(item.category)}</td>

                <td>${item.quantity}</td>

                <td>${item.unit}</td>

                <td>
                    ₱${parseFloat(
                        item.unit_price
                    ).toFixed(2)}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        ${statusText}
                    </span>
                </td>

                <td class="action-btns">

                    <button
                        class="action-btn view"
                        data-id="${item.id}">
                        View
                    </button>

                    <button
                        class="action-btn edit"
                        data-id="${item.id}">
                        Edit
                    </button>

                    <button
                        class="action-btn delete"
                        data-id="${item.id}">
                        Delete
                    </button>

                </td>
            `;

            inventoryContainer.appendChild(row);

        });

        document
            .querySelectorAll(
                '#inventory-items .action-btn.view'
            )
            .forEach(btn => {

                btn.addEventListener(
                    'click',
                    function() {

                        const itemId =
                            parseInt(
                                this.getAttribute(
                                    'data-id'
                                )
                            );

                        viewInventoryItem(itemId);

                    }
                );

            });

        document
            .querySelectorAll(
                '#inventory-items .action-btn.edit'
            )
            .forEach(btn => {

                btn.addEventListener(
                    'click',
                    function() {

                        const itemId =
                            parseInt(
                                this.getAttribute(
                                    'data-id'
                                )
                            );

                        editInventoryItem(itemId);

                    }
                );

            });

        document
            .querySelectorAll(
                '#inventory-items .action-btn.delete'
            )
            .forEach(btn => {

                btn.addEventListener(
                    'click',
                    function() {

                        const itemId =
                            parseInt(
                                this.getAttribute(
                                    'data-id'
                                )
                            );

                        deleteInventoryItem(itemId);

                    }
                );

            });

    } catch(error) {

        console.error(error);

        inventoryContainer.innerHTML = `
            <tr>
                <td colspan="8"
                    style="color:red;text-align:center;">
                    Database connection failed
                </td>
            </tr>
        `;
    }
}

// ============================================
// VIEW INVENTORY ITEM FUNCTION - NO EDIT BUTTON
// ============================================
async function viewInventoryItem(itemId){

    try{

        const response = await fetch(
            `api/inventory/read_single.php?id=${itemId}`
        );

        const item = await response.json();

        if(item.success === false){

            showNotification(
                item.message,
                'error'
            );

            return;
        }

        let statusText = '';
        let statusClass = '';

        const quantity =
            parseFloat(item.quantity);

        const minStock =
            parseFloat(item.min_stock);

        if(quantity <= 0){

            statusText = 'Out of Stock';
            statusClass = 'status-out-of-stock';

        }else if(quantity < minStock){

            statusText = 'Low Stock';
            statusClass = 'status-low-stock';

        }else{

            statusText = 'In Stock';
            statusClass = 'status-in-stock';

        }

        const modal =
            document.createElement('div');

        modal.className =
            'modal-overlay';

        console.log(item);

        modal.innerHTML = `

            <div class="modal-content">

                <div style="padding:20px;">

                    <h2>${item.item_name}</h2>

                    <hr>

                    <p>
                        <strong>ID:</strong>
                        ${item.id}
                    </p>

                    <p>
                        <strong>Category:</strong>
                        ${item.category}
                    </p>

                    <p>
                        <strong>Quantity:</strong>
                        ${item.quantity}
                        ${item.unit}
                    </p>

                    <p>
                        <strong>Unit Price:</strong>
                        ₱${parseFloat(
                            item.unit_price
                        ).toFixed(2)}
                    </p>

                    <p>
                        <strong>Minimum Stock:</strong>
                        ${item.min_stock}
                    </p>

                    <p>
                        <strong>Supplier:</strong>
                        ${item.supplier_name || 'N/A'}
                    </p>

                    <p>
                        <strong>Status:</strong>

                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>

                    </p>

                    <p>
                        <strong>Description:</strong>
                        ${item.description || ''}
                    </p>

                    <br>

                    <button
                        id="close-view-btn"
                        class="action-btn">

                        Close

                    </button>

                </div>

            </div>

        `;

        document.body.appendChild(
            modal
        );

        document
            .getElementById(
                'close-view-btn'
            )
            .addEventListener(
                'click',
                function(){

                    modal.remove();

                }
            );

        modal.addEventListener(
            'click',
            function(e){

                if(e.target === modal){

                    modal.remove();

                }

            }
        );

    }catch(error){

        console.error(error);

        showNotification(
            'Unable to load item',
            'error'
        );

    }
}

async function loadSuppliersForDropdowns() {

    try {

        const response = await fetch(
            'api/suppliers/read.php'
        );

        const suppliers = await response.json();
        supplierData = suppliers;

        const itemSupplierSelect =
            document.getElementById('item-supplier');

        const poSupplierSelect =
            document.getElementById('po-supplier');

        const orderFilterSupplier =
            document.getElementById('order-filter-supplier');

        if (itemSupplierSelect) {

            itemSupplierSelect.innerHTML =
                '<option value="">Select a supplier</option>';

            suppliers.forEach(supplier => {

                const option =
                    document.createElement('option');

                option.value =
                    supplier.id;

                option.textContent =
                    supplier.supplier_name;

                itemSupplierSelect.appendChild(option);

            });

        }

        if (poSupplierSelect) {

            poSupplierSelect.innerHTML =
                '<option value="">Select a supplier</option>';

            suppliers.forEach(supplier => {

                const option =
                    document.createElement('option');

                option.value =
                    supplier.id;

                option.textContent =
                    supplier.supplier_name;

                poSupplierSelect.appendChild(option);

            });

        }

        if (orderFilterSupplier) {

            orderFilterSupplier.innerHTML =
                '<option value="all">All Suppliers</option>';

            suppliers.forEach(supplier => {

                const option =
                    document.createElement('option');

                option.value =
                    supplier.id;

                option.textContent =
                    supplier.supplier_name;

                orderFilterSupplier.appendChild(option);

            });

        }

    } catch (error) {

        console.error(
            'Error loading supplier dropdowns:',
            error
        );

    }

}

async function editInventoryItem(itemId){

    await loadSuppliersForDropdowns();

    try{

        const response =
            await fetch(
                `api/inventory/read_single.php?id=${itemId}`
            );

        const item =
            await response.json();

        console.log('Inventory Item:', item);

        const modal =
            document.createElement('div');

        modal.className =
            'modal-overlay';

        modal.innerHTML = `

        <div class="modal-content">

            <h2>Edit Inventory Item</h2>

            <div class="form-group">
                <label>Item Name</label>

                <input
                    type="text"
                    id="edit-name"
                    value="${item.item_name}">
            </div>

            <div class="form-group">
                <label>Category</label>

                <select id="edit-category">
                    <option value="Coffee Beans">Coffee Beans</option>
                    <option value="Tea & Herbal">Tea & Herbal</option>
                    <option value="Pastries & Food">Pastries & Food</option>
                    <option value="Syrups & Flavorings">Syrups & Flavorings</option>
                    <option value="Milk & Dairy">Milk & Dairy</option>
                    <option value="Cups & Packaging">Cups & Packaging</option>
                    <option value="Cleaning Supplies">Cleaning Supplies</option>
                    <option value="Equipment">Equipment</option>
                </select>
            </div>

            <div class="form-group">
                <label>Quantity</label>

                <input
                    type="number"
                    id="edit-quantity"
                    value="${item.quantity}">
            </div>

            <div class="form-group">
                <label>Unit</label>

                <input
                    type="text"
                    id="edit-unit"
                    value="${item.unit}">
            </div>

            <div class="form-group">
                <label>Unit Price</label>

                <input
                    type="number"
                    step="0.01"
                    id="edit-price"
                    value="${item.unit_price}">
            </div>

            <div class="form-group">
                <label>Minimum Stock</label>

                <input
                    type="number"
                    id="edit-minstock"
                    value="${item.min_stock}">
            </div>

            <div class="form-group">
                <label>Supplier</label>

                <select id="edit-supplier">
                    ${loadSuppliersForSelect(item.supplier_id)}
                </select>
            </div>

            <div class="form-group">
                <label>Description</label>

                <textarea
                    id="edit-description">${item.description || ''}</textarea>
            </div>

            <br>

            <button
                id="save-edit-item"
                class="btn btn-success">

                Update

            </button>

            <button
                id="cancel-edit-item"
                class="btn">

                Cancel

            </button>

        </div>
        `;

        document.body.appendChild(
            modal
        );

        document.getElementById('edit-category').value =
            item.category;

        document
        .getElementById(
            'save-edit-item'
        )
        .addEventListener(
            'click',
            async function(){

                const updateResponse =
                    await fetch(
                        'api/inventory/update.php',
                        {
                            method:'POST',
                            headers:{
                                'Content-Type':
                                'application/json'
                            },
                            body:JSON.stringify({
                                id:item.id,
                                item_name:
                                    document.getElementById('edit-name').value,
                                category:
                                    document.getElementById('edit-category').value,
                                quantity:
                                    document.getElementById('edit-quantity').value,
                                unit:
                                    document.getElementById('edit-unit').value,
                                unit_price:
                                    document.getElementById('edit-price').value,
                                min_stock:
                                    document.getElementById('edit-minstock').value,
                                supplier_id:
                                    parseInt(
                                        document.getElementById('edit-supplier').value
                                    ),
                                description:
                                    document.getElementById('edit-description').value
                            })
                        }
                    );

                const result =
                    await updateResponse.json();

                if(result.success){

                    showNotification(
                        'Inventory updated',
                        'success'
                    );

                    modal.remove();

                    await loadInventoryItems();

                    await loadRecentItems();

                    updateDashboardStats();

                }else{

                    showNotification(
                        result.message,
                        'error'
                    );

                }

            }
        );

        document
        .getElementById(
            'cancel-edit-item'
        )
        .addEventListener(
            'click',
            () => modal.remove()
        );

    }
    catch(error){

        console.error(error);

        showNotification(
            'Unable to load item',
            'error'
        );

    }

}

function loadSuppliersForSelect(selectedSupplierId = '') {

    let options =
        '<option value="">Select a supplier</option>';

    supplierData.forEach(supplier => {

        const selected =
            Number(supplier.id) === Number(selectedSupplierId)
                ? 'selected'
                : '';

        options += `
            <option
                value="${supplier.id}"
                ${selected}
            >
                ${supplier.supplier_name}
            </option>
        `;
    });

    return options;
}

addItemBtn?.addEventListener('click', async function() {

    const name = document.getElementById('item-name').value;
    const category = document.getElementById('item-category').value;
    console.log("Selected Category:", category);
    const unit = document.getElementById('item-unit').value;
    const quantity = parseFloat(
        document.getElementById('item-quantity').value
    );
    const price = parseFloat(
        document.getElementById('item-price').value
    );
    const supplier = document.getElementById('item-supplier').value;
    const minQuantity =
        parseFloat(
            document.getElementById('item-min-quantity').value
        ) || 5;

    const description =
        document.getElementById('item-description').value;

    if (
        !name ||
        !category ||
        !unit ||
        isNaN(quantity) ||
        isNaN(price)
    ) {
        showNotification(
            'Please fill in all required fields',
            'error'
        );
        return;
    }

    try {

        const response = await fetch(
            'api/inventory/create.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    item_name: name,
                    category: category,
                    quantity: quantity,
                    unit: unit,
                    unit_price: price,
                    min_stock: minQuantity,
                    supplier_id: parseInt(supplier),
                    description: description
                })
            }
        );

        const result = await response.json();

        if(result.success){

            showNotification(
                'Item added to MySQL database!',
                'success'
            );

            clearInventoryForm();

            loadInventoryItems();

            updateDashboardStats();

        } else {

            showNotification(
                result.message,
                'error'
            );

        }

    } catch(error){

        console.error(error);

        showNotification(
            'Database connection error',
            'error'
        );

    }

});

function clearInventoryForm() {
    document.getElementById('item-name').value = '';
    document.getElementById('item-quantity').value = '';
    document.getElementById('item-price').value = '';
    document.getElementById('item-supplier').value = '';
    document.getElementById('item-min-quantity').value = '';
    document.getElementById('item-description').value = '';
}

// ============================================
// DELETE INVENTORY ITEM - ALL ROLES CAN DELETE
// ============================================
function deleteInventoryItem(itemId) {

    if (!confirm("Are you sure you want to delete this item? This action cannot be undone.")) {
        return;
    }

    fetch(`api/inventory/delete.php?id=${itemId}`)
    .then(response => response.json())
    .then(data => {

        if (data.success) {

            showNotification(
                data.message,
                'success'
            );

            loadInventoryItems();

            updateDashboardStats();

        } else {

            showNotification(
                data.message,
                'error'
            );

        }

    })
    .catch(error => {

        console.error(error);

        showNotification(
            'Error deleting inventory item',
            'error'
        );

    });
}

function getCategoryName(category) {
    const categoryNames = {
        'coffee': 'Coffee Beans',
        'tea': 'Tea & Herbal',
        'pastry': 'Pastries & Food',
        'syrup': 'Syrups & Flavorings',
        'milk': 'Milk & Dairy',
        'cup': 'Cups & Packaging',
        'cleaning': 'Cleaning Supplies',
        'equipment': 'Equipment'
    };
    return categoryNames[category] || category;
}

function getCategoryBadge(category){

    let className = '';

    switch(category){

        case 'Coffee Beans':
            className = 'category-coffee';
            break;

        case 'Tea & Herbal':
            className = 'category-tea';
            break;

        case 'Pastries & Food':
            className = 'category-pastry';
            break;

        case 'Syrups & Flavorings':
            className = 'category-syrup';
            break;

        case 'Milk & Dairy':
            className = 'category-milk';
            break;

        case 'Cups & Packaging':
            className = 'category-cups';
            break;

        case 'Cleaning Supplies':
            className = 'category-cleaning';
            break;

        case 'Equipment':
            className = 'category-equipment';
            break;

        default:
            className = 'category-coffee';
    }

    return `
        <span class="category-badge ${className}">
            ${category}
        </span>
    `;
}

// ============================================
// PURCHASE ORDER FUNCTIONS
// ============================================
async function loadInventoryForPOBySupplier(supplierId) {
    await updateInventoryCache();
    const items = supplierId
        ? inventoryItemsCache.filter(
            item =>
                parseInt(item.supplier_id) ===
                parseInt(supplierId)
        )
        : [];

    // console.log('supplierId:', supplierId);
    // console.log('inventoryItemsCache:', inventoryItemsCache);
    // console.log('filtered items:', items);

    const selectElements = document.querySelectorAll('.po-item-select');
    
    selectElements.forEach(select => {
        const currentValue = select.value;
        select.innerHTML = '<option value="">Select an item</option>';
        items.forEach(item => {
            // console.log('PO Item:', item);
            const option = document.createElement('option');

            option.value = item.id;

            const price = parseFloat(item.unit_price || 0);

            option.textContent =
            `${item.item_name} (${item.unit}) - ₱${price.toFixed(2)}`;

            option.setAttribute('data-price', price);
            option.setAttribute('data-unit', item.unit);
            option.setAttribute('data-name', item.item_name);

            select.appendChild(option);
        });
        
        if (currentValue) {
            select.value = currentValue;
            if (currentValue) {
                const selectedOption = select.options[select.selectedIndex];
                const price = selectedOption ? parseFloat(selectedOption.getAttribute('data-price')) || 0 : 0;
                const priceInput = select.closest('.po-item').querySelector('.po-item-price');
                priceInput.value = price.toFixed(2);
                updateItemTotal(select.closest('.po-item'));
            }
        }
    });
    updatePOTotal();
}

function initializePOItemEventListeners() {
    const firstItemSelect =
        document.querySelector('.po-item-select');

    if (firstItemSelect) {

        firstItemSelect.addEventListener(
            'change',
            function() {

                const selectedOption =
                    this.options[this.selectedIndex];

                const price =
                    selectedOption
                        ? parseFloat(
                            selectedOption.getAttribute('data-price')
                        ) || 0
                        : 0;

                const priceInput =
                    this.closest('.po-item')
                        .querySelector('.po-item-price');

                priceInput.value =
                    price.toFixed(2);

                updateItemTotal(
                    this.closest('.po-item')
                );

                updatePOTotal();
            }
        );

        const qtyInput =
            firstItemSelect
                .closest('.po-item')
                .querySelector('.po-item-quantity');

        qtyInput.addEventListener(
            'input',
            function() {

                updateItemTotal(
                    this.closest('.po-item')
                );

                updatePOTotal();
            }
        );
    }

    const poSupplierSelect = document.getElementById('po-supplier');
    if (poSupplierSelect) {
        poSupplierSelect.addEventListener('change', async function() {
            const supplierId = this.value;
            await loadInventoryForPOBySupplier(supplierId);
            
            const poItems = document.querySelectorAll('.po-item');
            poItems.forEach((item, index) => {
                if (index > 0) item.remove();
            });
            
            const firstItem = document.querySelector('.po-item');
            if (firstItem) {
                const deleteBtnContainer = firstItem.querySelector('.form-group:last-child');
                if (deleteBtnContainer) deleteBtnContainer.style.visibility = 'hidden';
                
                const firstItemSelect = firstItem.querySelector('.po-item-select');
                if (firstItemSelect) {
                    firstItemSelect.value = '';
                    const priceInput = firstItemSelect.closest('.po-item').querySelector('.po-item-price');
                    priceInput.value = '0.00';
                    updateItemTotal(firstItemSelect.closest('.po-item'));
                }
            }
            updatePOTotal();
        });
    }
    
    if (addPoItemBtn) {
        addPoItemBtn.removeEventListener('click', handleAddPOItem);
        addPoItemBtn.addEventListener('click', handleAddPOItem);
    }
}

function handleAddPOItem() {
    const container = document.getElementById('po-items-container');
    const newItem = document.createElement('div');
    newItem.className = 'po-item form-row';
    newItem.innerHTML = `
        <div class="form-group">
            <label>Item</label>
            <select class="po-item-select">
                <option value="">Select an item</option>
            </select>
        </div>
        <div class="form-group">
            <label>Quantity</label>
            <input type="number" class="po-item-quantity" min="1" value="1">
        </div>
        <div class="form-group">
            <label>Unit Price (₱)</label>
            <input type="number" step="0.01" class="po-item-price" value="0.00" readonly>
        </div>
        <div class="form-group">
            <label>Total</label>
            <input type="text" class="po-item-total" value="₱0.00" readonly>
        </div>
        <div class="form-group">
            <label>&nbsp;</label>
            <button type="button" class="btn btn-danger remove-po-item" style="margin-top: 8px; padding: 5px 10px; font-size: 14px;">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    container.appendChild(newItem);
    const selectedSupplier = document.getElementById('po-supplier').value;
    loadInventoryForPOBySupplier(selectedSupplier);
    
    newItem.querySelector('.remove-po-item').addEventListener('click', function() {
        if (container.querySelectorAll('.po-item').length > 1) {
            newItem.remove();
            updatePOTotal();
        } else {
            showNotification('At least one item is required', 'error');
        }
    });
    
    newItem.querySelector('.po-item-select').addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        const price = selectedOption ? parseFloat(selectedOption.getAttribute('data-price')) || 0 : 0;
        const priceInput = this.closest('.po-item').querySelector('.po-item-price');
        priceInput.value = price.toFixed(2);
        updateItemTotal(this.closest('.po-item'));
        updatePOTotal();
    });
    
    newItem.querySelector('.po-item-quantity').addEventListener('input', function() {
        updateItemTotal(this.closest('.po-item'));
        updatePOTotal();
    });
    
    const firstItem = document.querySelector('.po-item');
    if (firstItem) {
        const deleteBtnContainer = firstItem.querySelector('.form-group:last-child');
        if (deleteBtnContainer) deleteBtnContainer.style.visibility = 'hidden';
    }
}

function updateItemTotal(itemElement) {
    const quantity = parseFloat(itemElement.querySelector('.po-item-quantity').value) || 0;
    const price = parseFloat(itemElement.querySelector('.po-item-price').value) || 0;
    const total = quantity * price;
    itemElement.querySelector('.po-item-total').value = `₱${total.toFixed(2)}`;
}

function updatePOTotal() {
    const itemElements = document.querySelectorAll('.po-item');
    let total = 0;
    itemElements.forEach(item => {
        const totalText = item.querySelector('.po-item-total').value;
        total += parseFloat(totalText.replace('₱', '')) || 0;
    });
    document.getElementById('po-total').textContent = `₱${total.toFixed(2)}`;
}

function clearPurchaseOrderForm() {
    const container = document.getElementById('po-items-container');
    while (container.children.length > 1) container.removeChild(container.lastChild);
    
    const firstItem = container.querySelector('.po-item');
    firstItem.querySelector('.po-item-select').innerHTML = '<option value="">Select an item</option>';
    firstItem.querySelector('.po-item-quantity').value = 1;
    firstItem.querySelector('.po-item-price').value = '0.00';
    firstItem.querySelector('.po-item-total').value = '₱0.00';
    
    const deleteBtnContainer = firstItem.querySelector('.form-group:last-child');
    if (deleteBtnContainer) deleteBtnContainer.style.visibility = 'hidden';
    
    loadNextPONumber();
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('po-date').value = today;
    
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 7);
    document.getElementById('po-expected-date').value = expectedDate.toISOString().split('T')[0];
    
    document.getElementById('po-shipping-method').value = '';
    document.getElementById('po-shipping-notes').value = '';
    document.getElementById('po-supplier').value = '';
    
    clearAttachments();
    updatePOTotal();
}

// ============================================
// Submit purchase order
// ============================================
submitPoBtn?.addEventListener('click', function () {

    if (!state.currentUser) {

        showNotification(
            'You must be logged in to create purchase orders.',
            'error'
        );

        return;
    }

    const poNumber = document.getElementById('po-number').value;
    const poDate = document.getElementById('po-date').value;
    const supplier = document.getElementById('po-supplier').value;
    const expectedDate = document.getElementById('po-expected-date').value;
    const shippingMethod = document.getElementById('po-shipping-method').value;
    const shippingNotes = document.getElementById('po-shipping-notes').value;
    const attachmentCount = 0;

    if (
        !supplier ||
        !poDate ||
        !expectedDate ||
        !shippingMethod
    ) {

        showNotification(
            'Please fill in all required fields',
            'error'
        );

        return;
    }

    const poItems = [];
    const itemElements = document.querySelectorAll('.po-item');

    let hasValidItems = false;

    itemElements.forEach(item => {

        const itemSelect =
            item.querySelector('.po-item-select');

        const itemId =
            itemSelect.value;

        const selectedOption =
            itemSelect.options[itemSelect.selectedIndex];

        const itemName =
            selectedOption
                ? selectedOption.text.split(' - ')[0]
                : '';

        const quantity =
            parseFloat(
                item.querySelector('.po-item-quantity').value
            ) || 0;

        const price =
            parseFloat(
                item.querySelector('.po-item-price').value
            ) || 0;

        const total =
            parseFloat(
                item.querySelector('.po-item-total')
                    .value
                    .replace('₱', '')
                    .replace(',', '')
            ) || 0;

        if (
            itemId &&
            quantity > 0 &&
            price > 0
        ) {

            hasValidItems = true;

            poItems.push({

                itemId: parseInt(itemId),

                itemName,

                quantity,

                price,

                total

            });
        }

    });

    if (!hasValidItems) {

        showNotification(
            'Please add at least one valid item to the purchase order',
            'error'
        );

        return;
    }

    const payload = {
        supplier_id: parseInt(supplier),

        order_date: poDate,

        expected_date: expectedDate,

        shipping_method: shippingMethod,

        attachment_count: attachmentCount,

        items: poItems.map(item => ({
            inventory_item_id: item.itemId,
            quantity: item.quantity,
            unit_price: item.price
        }))
    };

    console.log('PO Payload:', payload);

    fetch(
        'api/purchase_orders/create.php',
        {

            method: 'POST',

            headers: {

                'Content-Type': 'application/json'

            },

            body: JSON.stringify(payload)

        }
    )

    .then(response => response.json())

    .then(data => {

        if (data.success) {

            showNotification(
                data.message || 'Purchase Order Created',
                'success'
            );

            clearPurchaseOrderForm();

            loadPurchaseOrders();

            updateDashboardStats();

            setActiveMenuItem(
                'view-orders'
            );

            showPage(
                'view-orders'
            );

        } else {

            showNotification(
                data.message || 'Failed to create Purchase Order',
                'error'
            );

        }

    })

    .catch(error => {

        console.error(
            'Purchase Order Error:',
            error
        );

        showNotification(
            'Database error while creating Purchase Order',
            'error'
        );

    });

});

// ============================================
// ATTACHMENT FUNCTIONS
// ============================================
function handleAttachmentUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
        showNotification('File size must be less than 5MB', 'error');
        return;
    }
    
    const allowedTypes = ['application/pdf', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                         'image/jpeg', 'image/png',
                         'application/vnd.ms-excel',
                         'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!allowedTypes.includes(file.type)) {
        showNotification('File type not allowed. Please upload PDF, DOC, JPG, PNG, or Excel files.', 'error');
        return;
    }
    
    const attachment = {
        id: Date.now(),
        name: file.name,
        type: file.type,
        size: formatFileSize(file.size),
        file: file,
        uploadedAt: new Date().toISOString()
    };
    
    attachments.push(attachment);
    createAttachmentPreview(attachment);
    event.target.value = '';
    showNotification('Attachment added successfully', 'success');
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function createAttachmentPreview(attachment) {
    const attachmentList = document.getElementById('attachment-list');
    let fileIcon = 'fa-file';
    if (attachment.type.includes('pdf')) fileIcon = 'fa-file-pdf';
    else if (attachment.type.includes('word') || attachment.type.includes('document')) fileIcon = 'fa-file-word';
    else if (attachment.type.includes('excel') || attachment.type.includes('spreadsheet')) fileIcon = 'fa-file-excel';
    else if (attachment.type.includes('image')) fileIcon = 'fa-file-image';
    
    const preview = document.createElement('div');
    preview.className = 'attachment-preview';
    preview.innerHTML = `
        <i class="fas ${fileIcon}"></i>
        <span class="attachment-name" title="${attachment.name}">${attachment.name}</span>
        <span style="font-size: 12px; color: #8d6e63;">${attachment.size}</span>
        <button type="button" class="remove-attachment" data-id="${attachment.id}">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    attachmentList.appendChild(preview);
    preview.querySelector('.remove-attachment').addEventListener('click', function() {
        const attachmentId = parseInt(this.getAttribute('data-id'));
        removeAttachment(attachmentId, preview);
    });
}

function removeAttachment(attachmentId, previewElement) {
    attachments = attachments.filter(att => att.id !== attachmentId);
    previewElement.remove();
    showNotification('Attachment removed', 'info');
}

function clearAttachments() {
    attachments = [];
    const attachmentList = document.getElementById('attachment-list');
    if (attachmentList) attachmentList.innerHTML = '';
}

// ============================================
// PURCHASE ORDERS FUNCTIONS
// ============================================
function loadPurchaseOrders() {

    const ordersContainer =
        document.getElementById('orders-list');

    if (!ordersContainer) return;

    fetch('api/purchase_orders/read.php')

        .then(response => response.json())

        .then(orders => {

            const statusFilter =
                document.getElementById('order-filter-status')?.value || 'all';

            const supplierFilter =
                document.getElementById('order-filter-supplier')?.value || 'all';

            const dateFilter =
                document.getElementById('order-filter-date')?.value || 'all';

            let filteredOrders = orders;

            if (statusFilter !== 'all') {

                filteredOrders = filteredOrders.filter(
                    order => order.status === statusFilter
                );

            }

            if (supplierFilter !== 'all') {

                filteredOrders = filteredOrders.filter(
                    order =>
                        String(order.supplier_id) ===
                        String(supplierFilter)
                );

            }

            if (dateFilter !== 'all') {

                const today = new Date();

                filteredOrders = filteredOrders.filter(order => {

                    const orderDate =
                        new Date(order.order_date);

                    switch (dateFilter) {

                        case 'today':
                            return orderDate.toDateString() ===
                                   today.toDateString();

                        case 'week':

                            const weekAgo = new Date();

                            weekAgo.setDate(
                                today.getDate() - 7
                            );

                            return orderDate >= weekAgo;

                        case 'month':

                            return (
                                orderDate.getMonth() ===
                                today.getMonth()
                                &&
                                orderDate.getFullYear() ===
                                today.getFullYear()
                            );

                        case 'quarter':

                            const quarter =
                                Math.floor(
                                    today.getMonth() / 3
                                );

                            return (
                                orderDate.getFullYear() ===
                                today.getFullYear()
                                &&
                                Math.floor(
                                    orderDate.getMonth() / 3
                                ) === quarter
                            );

                        default:
                            return true;
                    }

                });

            }

            ordersContainer.innerHTML = '';

            if (filteredOrders.length === 0) {

                ordersContainer.innerHTML = `
                    <tr>
                        <td colspan="8"
                            style="
                                text-align:center;
                                padding:30px;
                                color:#8d6e63;
                            ">
                            No purchase orders found
                        </td>
                    </tr>
                `;

                return;
            }

            filteredOrders.forEach(order => {

                const row =
                    document.createElement('tr');

                row.innerHTML = `
                    <td>${order.reference_no ? `${order.po_number}-${order.reference_no}` : order.po_number}</td>

                    <td>${order.supplier_name || '-'}</td>

                    <td>
                        ${order.order_date}
                        <br>
                        <small>
                            ETA: ${order.expected_date || '-'}
                        </small>
                    </td>

                    <td>
                        <span class="order-status-badge status-${order.status.toLowerCase()}">
                            ${order.status}
                        </span>
                    </td>

                    <td>
                        ${order.shipping_method
                            ? order.shipping_method.charAt(0).toUpperCase() +
                              order.shipping_method.slice(1).toLowerCase()
                            : 'Ground'}
                    </td>

                    <td>
                        ₱${parseFloat(order.total_amount || 0).toLocaleString()}
                    </td>

                    <td>
                        ${order.attachment_count || 0}
                    </td>

                    <td>
                        <button
                            class="action-btn view-order-btn"
                            data-id="${order.id}">
                            View
                        </button>
                    </td>
                `;

                ordersContainer.appendChild(row);

                row.querySelector('.view-order-btn')
                    .addEventListener('click', function () {

                        const orderId =
                            parseInt(this.dataset.id);

                        viewOrderDetails(orderId);

                    });

            });

        })

        .catch(error => {

            console.error(
                'Load Purchase Orders Error:',
                error
            );

            ordersContainer.innerHTML = `
                <tr>
                    <td colspan="8"
                        style="
                            text-align:center;
                            padding:30px;
                            color:red;
                        ">
                        Failed to load purchase orders
                    </td>
                </tr>
            `;
        });

}

function exportPurchaseOrder(orderId) {

    window.open(
        `api/reports/export_purchase_order.php?id=${orderId}`,
        '_blank'
    );

}

function attachOrderEventListeners() {
    document.querySelectorAll('.view-order-btn').forEach(btn => {
        btn.removeEventListener('click', handleViewOrder);
        btn.addEventListener('click', handleViewOrder);
    });
    
    document.querySelectorAll('.approve').forEach(btn => {
        btn.removeEventListener('click', handleApproveOrder);
        btn.addEventListener('click', handleApproveOrder);
    });
    
    document.querySelectorAll('.ship').forEach(btn => {
        btn.removeEventListener('click', handleShipOrder);
        btn.addEventListener('click', handleShipOrder);
    });
    
    document.querySelectorAll('.deliver').forEach(btn => {
        btn.removeEventListener('click', handleDeliverOrder);
        btn.addEventListener('click', handleDeliverOrder);
    });
    
    document.querySelectorAll('.cancel').forEach(btn => {
        btn.removeEventListener('click', handleCancelOrder);
        btn.addEventListener('click', handleCancelOrder);
    });
    
    document.querySelectorAll('.delete-order-btn').forEach(btn => {
        btn.removeEventListener('click', handleDeleteOrder);
        btn.addEventListener('click', handleDeleteOrder);
    });
}

function handleViewOrder(e) {
    e.preventDefault();
    const orderId = parseInt(e.currentTarget.getAttribute('data-id'));
    viewOrderDetails(orderId);
}

function handleApproveOrder(e) {
    e.preventDefault();
    const orderId = parseInt(e.currentTarget.getAttribute('data-id'));
    updateOrderStatus(orderId, 'Approved');
}

function handleShipOrder(e) {
    e.preventDefault();
    const orderId = parseInt(e.currentTarget.getAttribute('data-id'));
    updateOrderStatus(orderId, 'Shipped');
}

function handleDeliverOrder(e) {
    e.preventDefault();
    const orderId = parseInt(e.currentTarget.getAttribute('data-id'));
    updateOrderStatus(orderId, 'Delivered');
}

function handleCancelOrder(e) {
    e.preventDefault();
    const orderId = parseInt(e.currentTarget.getAttribute('data-id'));
    cancelPurchaseOrder(orderId);
}

function handleDeleteOrder(e) {
    e.preventDefault();
    e.stopPropagation();
    const orderId = parseInt(e.currentTarget.getAttribute('data-id'));
    const poNumber = e.currentTarget.getAttribute('data-ponumber') || 'Unknown';
    
    if (!state.currentUser) {
        showNotification('You must be logged in to delete orders', 'error');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
    const orderToDelete = orders.find(o => o.id === orderId);
    
    if (!orderToDelete) {
        showNotification('Order not found', 'error');
        return;
    }
    
    if (orderToDelete.status !== 'Cancelled') {
        showNotification(`❌ Cannot delete order ${poNumber} because it is ${orderToDelete.status}. Only CANCELLED orders can be deleted.`, 'error');
        return;
    }
    
    if (!confirm(`⚠️ Are you sure you want to DELETE purchase order ${poNumber}?\n\nThis action cannot be undone and PO numbers will be reorganized.`)) return;
    
    deletePurchaseOrder(orderId, poNumber);
}

function deletePurchaseOrder(orderId, poNumber) {
    try {
        let orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
        const orderToDelete = orders.find(o => o.id === orderId);
        
        if (!orderToDelete) {
            showNotification('Order not found', 'error');
            return;
        }
        
        if (orderToDelete.status !== 'Cancelled') {
            showNotification(`❌ Cannot delete order ${poNumber} because it is ${orderToDelete.status}. Only CANCELLED orders can be deleted.`, 'error');
            return;
        }
        
        orders = orders.filter(o => o.id !== orderId);
        localStorage.setItem('coffeeShopOrders', JSON.stringify(orders));
        reorderPONumbers();
        showNotification(`✅ Purchase order ${poNumber} deleted successfully.`, 'success');
        loadPurchaseOrders();
        updateDashboardStats();
        loadRecentItems();
        const modal = document.getElementById('order-details-modal');
        if (modal) modal.classList.add('hidden');
    } catch (error) {
        console.error('Error deleting order:', error);
        showNotification('Error deleting order. Please try again.', 'error');
    }
}

function cancelPurchaseOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    if (order.status !== 'Pending') {
        showNotification('Only pending orders can be cancelled', 'error');
        return;
    }
    
    if (state.currentUser.role === 'admin' || state.currentUser.role === 'manager' || 
        (state.currentUser.role === 'staff' && state.currentUser.username === order.createdBy)) {
        if (!confirm(`Are you sure you want to CANCEL purchase order ${order.poNumber}?`)) return;
        
        const orderIndex = orders.findIndex(o => o.id === orderId);
        orders[orderIndex].status = 'Cancelled';
        localStorage.setItem('coffeeShopOrders', JSON.stringify(orders));
        showNotification(`Purchase order ${order.poNumber} has been cancelled successfully.`, 'success');
        loadPurchaseOrders();
        updateDashboardStats();
        loadRecentItems();
        const modal = document.getElementById('order-details-modal');
        if (modal) modal.classList.add('hidden');
    } else {
        showNotification('You do not have permission to cancel this order', 'error');
    }
}

function viewOrderDetails(orderId) {

    fetch(
        `api/purchase_orders/read_single.php?id=${orderId}`
    )

    .then(response => response.json())

    .then(result => {

        if(!result.success){
            showNotification(
                result.message || 'Purchase Order not found',
                'error'
            );
            return;
        }

        const order = result.data;

        console.log('ORDER:', order);
        console.log('ITEMS:', order.items);

        let itemsHtml = '';

        if(order.items && order.items.length > 0){

            order.items.forEach(item => {

                itemsHtml += `
                    <tr>
                        <td>${item.item_name}</td>
                        <td>${item.quantity}</td>
                        <td>₱${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td>
                            ₱${(
                                item.quantity *
                                item.unit_price
                            ).toFixed(2)}
                        </td>
                    </tr>
                `;

            });

        }

        const modal =
            document.createElement('div');

        modal.className =
            'modal-overlay';

        modal.innerHTML = `

        <div class="modal-content po-modal">

            <h2>
                Purchase Order Details
            </h2>

            <hr>

            <p>
                <strong>PO Number:</strong>
                ${order.po_number}-${order.reference_no}
            </p>

            <p>
                <strong>Supplier:</strong>
                ${order.supplier_name}
            </p>

            <p>
                <strong>Status:</strong>

                <span class="
                    order-status-badge
                    status-${order.status.toLowerCase()}
                ">
                    ${order.status}
                </span>

            </p>

            <p>
                <strong>Order Date:</strong>
                ${order.order_date}
            </p>

            <p>
                <strong>Expected Date:</strong>
                ${order.expected_date}
            </p>

            <br>

            <table class="inventory-table">

                <thead>

                    <tr>

                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>

                    </tr>

                </thead>

                <tbody>

                    ${itemsHtml}

                </tbody>

            </table>

            <br>

            <h3>
                Total:
                ₱${parseFloat(
                    order.total_amount
                ).toLocaleString()}
            </h3>

            <br>

            <div
                style="
                    display:flex;
                    gap:10px;
                    flex-wrap:wrap;
                "
            >

                ${
                    order.status === 'Pending'
                    ? `
                    <button
                        class="btn btn-success"
                        onclick="approvePurchaseOrder(${order.id})">
                        Approve
                    </button>

                    <button
                        class="btn btn-danger"
                        onclick="cancelPurchaseOrder(${order.id})">
                        Cancel
                    </button>
                    `
                    : ''
                }

                ${
                    order.status === 'Approved'
                    ? `
                    <button
                        class="btn btn-primary"
                        onclick="shipPurchaseOrder(${order.id})">
                        Ship
                    </button>
                    `
                    : ''
                }

                ${
                    order.status === 'Shipped'
                    ? `
                    <button
                        class="btn btn-success"
                        onclick="deliverPurchaseOrder(${order.id})">
                        Deliver
                    </button>
                    `
                    : ''
                }

                <button
                    class="btn btn-primary"
                    onclick="exportPurchaseOrder(${order.id})">
                    Export Receipt
                </button>

                <button
                    class="btn"
                    id="close-po-modal">

                    Close

                </button>

            </div>

        </div>
        `;

        document.body.appendChild(
            modal
        );

        document
            .getElementById(
                'close-po-modal'
            )
            .addEventListener(
                'click',
                () => modal.remove()
            );

        modal.addEventListener(
            'click',
            function(e){

                if(e.target === modal){

                    modal.remove();

                }

            }
        );

    })

    .catch(error => {

        console.error(error);

        showNotification(
            'Unable to load Purchase Order',
            'error'
        );

    });

}

function approvePurchaseOrder(orderId){

    updatePurchaseOrderStatus(
        orderId,
        'Approved'
    );

}

function shipPurchaseOrder(orderId){

    updatePurchaseOrderStatus(
        orderId,
        'Shipped'
    );

}

function deliverPurchaseOrder(orderId){

    updatePurchaseOrderStatus(
        orderId,
        'Delivered'
    );

}

function cancelPurchaseOrder(orderId){

    updatePurchaseOrderStatus(
        orderId,
        'Cancelled'
    );

}

function updatePurchaseOrderStatus(
    orderId,
    status
){

    console.log("Updating PO:", {
        id: orderId,
        status: status
    });

    fetch(
        'api/purchase_orders/update_status.php',
        {

            method:'POST',

            headers:{
                'Content-Type':
                'application/json'
            },

            body:JSON.stringify({

                id:orderId,
                status:status

            })

        }
    )

    .then(response => response.json())

    .then(data => {

        if(data.success){

            showNotification(
                'Purchase Order Updated',
                'success'
            );

            loadPurchaseOrders();

            document
                .querySelectorAll(
                    '.modal-overlay'
                )
                .forEach(
                    modal => modal.remove()
                );

        }

    });

}

function clearOrderFilters() {
    document.getElementById('order-filter-status').value = 'all';
    document.getElementById('order-filter-supplier').value = 'all';
    document.getElementById('order-filter-date').value = 'all';
    loadPurchaseOrders();
}

function printOrder(orderId) {
    const orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    if (!order) {
        showNotification('Order not found', 'error');
        return;
    }
    
    let itemsHTML = '';
    order.items.forEach((item) => {
        itemsHTML += `<tr><td>${item.itemName}</td><td>${item.quantity}</td><td>₱${item.price.toFixed(2)}</td><td>₱${item.total.toFixed(2)}</td></tr>`;
    });
    
    const printContent = `
        <html>
        <head><title>Purchase Order ${order.poNumber}</title>
        <style>body{font-family:Arial;margin:20px;} h1{color:#333;} .header{display:flex;justify-content:space-between;margin-bottom:30px;} .reference-box{background:#f9f5f0;padding:15px;border:2px solid #d7a35f;border-radius:8px;margin:20px 0;text-align:center;} .reference-number{font-size:24px;font-weight:bold;color:#5d4037;letter-spacing:2px;} .section{margin:20px 0;} table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #ddd;padding:8px;text-align:left;} th{background:#f2f2f2;} .total{text-align:right;font-weight:bold;font-size:18px;} .footer{margin-top:50px;border-top:1px solid #ddd;padding-top:20px;}</style>
        </head>
        <body>
            <div class="header">
                <div><h1>KiAMiX CoffeeBar</h1><p>Purchase Order: ${order.poNumber}</p></div>
                <div><p><strong>Date:</strong> ${order.date}</p><p><strong>Status:</strong> ${order.status}</p></div>
            </div>
            <div class="reference-box">
                <div class="reference-label">REFERENCE NUMBER</div>
                <div class="reference-number">${order.referenceNumber || 'N/A'}</div>
            </div>
            <div class="section">
                <h3>Supplier Information</h3>
                <p><strong>Supplier:</strong> ${order.supplier}</p>
                <p><strong>Expected Delivery:</strong> ${order.expectedDate}</p>
                <p><strong>Shipping Method:</strong> ${getShippingMethodName(order.shippingMethod || 'ground')}</p>
                <p><strong>Shipping Notes:</strong> ${order.shippingNotes || 'None'}</p>
                ${order.deliveredAt ? `<p><strong>Delivered On:</strong> ${new Date(order.deliveredAt).toLocaleString()}</p>` : ''}
            </div>
            <div class="section">
                <h3>Order Items</h3>
                <table><thead><tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Total</th></tr></thead><tbody>${itemsHTML}</tbody>
                <tfoot><tr><td colspan="3" class="total">Total Amount:</td><td>₱${order.totalAmount.toFixed(2)}</td></tr></tfoot></table>
            </div>
            <div class="footer">
                <p><strong>Created by:</strong> ${order.createdBy}</p>
                <p><strong>Created at:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                <p><strong>Reference #:</strong> ${order.referenceNumber || 'N/A'}</p>
            </div>
        </body></html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// ============================================
// USER MANAGEMENT FUNCTIONS
// ============================================
function loadActiveSessions() {
    const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
    const sessionsContainer = document.getElementById('active-sessions');
    if (!sessionsContainer) return;
    
    sessionsContainer.innerHTML = '';
    
    if (activeSessions.length === 0) {
        sessionsContainer.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #8d6e63;">No active sessions</td></tr>';
        return;
    }
    
    activeSessions.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
    
    activeSessions.forEach(session => {
        const row = document.createElement('tr');
        const isCurrentUser = state.currentUser && state.currentUser.username === session.username;
        row.innerHTML = `
            <td>${session.username} ${isCurrentUser ? '<span style="color: #ffb74d; font-size: 12px;">(You)</span>' : ''}</td>
            <td>${session.name}</td>
            <td>${session.role}</td>
            <td>${session.loginTime}</td>
            <td><span style="color: #4caf50; font-weight: 600;">${session.status}</span></td>
        `;
        sessionsContainer.appendChild(row);
    });
}

function loadUsers() {
    const users = JSON.parse(localStorage.getItem('coffeeShopUsers') || '[]');
    const usersContainer = document.getElementById('users-list');
    if (!usersContainer) return;
    
    usersContainer.innerHTML = '';
    
    if (users.length === 0) {
        usersContainer.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: #8d6e63;">No users found</td></tr>';
        return;
    }
    
    users.forEach(user => {
        const isCurrentUser = state.currentUser && state.currentUser.username === user.username;
        const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
        const isActive = activeSessions.some(session => session.username === user.username);
        const accountCreated = new Date();
        accountCreated.setDate(accountCreated.getDate() - Math.floor(Math.random() * 30));
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username} ${isActive ? '<span style="color: #4caf50; font-size: 12px;">(Online)</span>' : ''} ${isCurrentUser ? '<span style="color: #ffb74d; font-size: 12px;">(You)</span>' : ''}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>${accountCreated.toLocaleDateString()}</td>
            <td class="action-btns">
                <button class="action-btn view" data-username="${user.username}">View Profile</button>
                <button class="action-btn edit" data-username="${user.username}">Edit</button>
                ${state.currentUser && state.currentUser.role === 'admin' && user.username !== 'admin' && !isCurrentUser ? `<button class="action-btn delete" data-username="${user.username}">Delete</button>` : ''}
            </td>
        `;
        usersContainer.appendChild(row);
    });
    
    document.querySelectorAll('#users-list .action-btn.view').forEach(btn => {
        btn.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            viewUserProfile(username);
        });
    });
    
    document.querySelectorAll('#users-list .action-btn.edit').forEach(btn => {
        btn.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            editUserAccount(username);
        });
    });
    
    document.querySelectorAll('#users-list .action-btn.delete').forEach(btn => {
        btn.addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            deleteUserAccount(username);
        });
    });
}

function viewUserProfile(username) {
    const users = JSON.parse(localStorage.getItem('coffeeShopUsers') || '[]');
    const user = users.find(u => u.username === username);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
    const isActive = activeSessions.some(session => session.username === username);
    const isCurrentUser = state.currentUser && state.currentUser.username === username;
    
    const profileHTML = `
        <div style="text-align: left; padding: 20px;">
            <h3 style="color: #5d4037; margin-bottom: 20px;">User Profile: ${user.name}</h3>
            <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0d6d0;">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Full Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Status:</strong> <span style="color: ${isActive ? '#4caf50' : '#8d6e63'}">${isActive ? 'Currently Online' : 'Offline'}</span></p>
                <p><strong>Account Created:</strong> ${new Date().toLocaleDateString()}</p>
                ${state.currentUser && state.currentUser.role === 'admin' ? '<p><strong>Password:</strong> ********</p>' : ''}
                ${isCurrentUser ? '<p style="color: #ffb74d; font-size: 14px;"><i class="fas fa-info-circle"></i> This is your account</p>' : ''}
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            ${profileHTML}
            <div class="modal-actions">
                <button id="close-profile-btn" style="padding: 10px 20px; background-color: #8d6e63; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('#close-profile-btn').addEventListener('click', () => document.body.removeChild(modal));
    modal.addEventListener('click', function(e) {
        if (e.target === modal) document.body.removeChild(modal);
    });
}

function editUserAccount(username) {
    const users = JSON.parse(localStorage.getItem('coffeeShopUsers') || '[]');
    const user = users.find(u => u.username === username);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    if (state.currentUser.role !== 'admin' && state.currentUser.username !== username) {
        showNotification('You can only edit your own account. Only administrators can edit other users.', 'error');
        return;
    }
    
    const isCurrentUser = state.currentUser.username === username;
    
    const editHTML = `
        <div style="text-align: left; padding: 20px;">
            <h3 style="color: #5d4037; margin-bottom: 20px;">Edit User: ${user.name}</h3>
            <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0d6d0;">
                <div class="form-group">
                    <label for="edit-name"><strong>Full Name</strong></label>
                    <input type="text" id="edit-name" value="${user.name}" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div class="form-group">
                    <label for="edit-email"><strong>Email Address</strong></label>
                    <input type="email" id="edit-email" value="${user.email}" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                ${state.currentUser.role === 'admin' ? `
                    <div class="form-group">
                        <label for="edit-role"><strong>Role</strong></label>
                        <select id="edit-role" style="width: 100%; padding: 8px; margin-top: 5px;" ${isCurrentUser ? 'disabled' : ''}>
                            <option value="staff" ${user.role === 'staff' ? 'selected' : ''}>Staff Member</option>
                            <option value="manager" ${user.role === 'manager' ? 'selected' : ''}>Store Manager</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrator</option>
                        </select>
                        ${isCurrentUser ? '<p style="color: #8d6e63; font-size: 12px; margin-top: 5px;">You cannot change your own role</p>' : ''}
                    </div>
                ` : ''}
                <div class="form-group">
                    <label for="edit-password"><strong>New Password (leave blank to keep current)</strong></label>
                    <input type="password" id="edit-password" placeholder="Enter new password" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div class="form-group">
                    <label for="edit-confirm-password"><strong>Confirm New Password</strong></label>
                    <input type="password" id="edit-confirm-password" placeholder="Confirm new password" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            ${editHTML}
            <div class="modal-actions">
                <button id="save-edit-btn" style="padding: 10px 20px; background-color: #4caf50; color: white; border: none; border-radius: 5px; cursor: pointer;">Save Changes</button>
                <button id="cancel-edit-btn" style="padding: 10px 20px; background-color: #8d6e63; color: white; border: none; border-radius: 5px; cursor: pointer;">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('#save-edit-btn').addEventListener('click', function() {
        const name = modal.querySelector('#edit-name').value;
        const email = modal.querySelector('#edit-email').value;
        const role = state.currentUser.role === 'admin' ? modal.querySelector('#edit-role').value : user.role;
        const password = modal.querySelector('#edit-password').value;
        const confirmPassword = modal.querySelector('#edit-confirm-password').value;
        
        if (!name || !email) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        if (password && password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        const updatedUsers = users.map(u => {
            if (u.username === username) {
                const updatedUser = { ...u, name, email, role };
                if (password) updatedUser.password = password;
                return updatedUser;
            }
            return u;
        });
        
        localStorage.setItem('coffeeShopUsers', JSON.stringify(updatedUsers));
        
        if (isCurrentUser) {
            state.currentUser = updatedUsers.find(u => u.username === username);
            localStorage.setItem('currentUser', JSON.stringify(state.currentUser));
            loggedInUser.textContent = state.currentUser.name;
        }
        
        const activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
        const updatedSessions = activeSessions.map(session => {
            if (session.username === username) {
                return { ...session, name, role };
            }
            return session;
        });
        localStorage.setItem('activeSessions', JSON.stringify(updatedSessions));
        
        showNotification('User account updated successfully!', 'success');
        document.body.removeChild(modal);
        loadUsers();
        loadActiveSessions();
    });
    
    modal.querySelector('#cancel-edit-btn').addEventListener('click', () => document.body.removeChild(modal));
    modal.addEventListener('click', function(e) {
        if (e.target === modal) document.body.removeChild(modal);
    });
}

function deleteUserAccount(username) {
    if (username === 'admin') {
        showNotification('Cannot delete the admin account!', 'error');
        return;
    }
    
    if (state.currentUser && state.currentUser.username === username) {
        showNotification('You cannot delete your own account while logged in!', 'error');
        return;
    }
    
    if (!confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) return;
    
    let users = JSON.parse(localStorage.getItem('coffeeShopUsers') || '[]');
    users = users.filter(user => user.username !== username);
    localStorage.setItem('coffeeShopUsers', JSON.stringify(users));
    
    let activeSessions = JSON.parse(localStorage.getItem('activeSessions') || '[]');
    activeSessions = activeSessions.filter(session => session.username !== username);
    localStorage.setItem('activeSessions', JSON.stringify(activeSessions));
    
    showNotification(`User "${username}" has been deleted successfully.`, 'success');
    loadUsers();
    loadActiveSessions();
}

// ============================================
// SUPPLIER FUNCTIONS
// ============================================
async function loadSuppliers() {

    const suppliersContainer =
        document.getElementById('suppliers-list');

    if (!suppliersContainer) return;

    suppliersContainer.innerHTML = `
        <tr>
            <td colspan="8">Loading suppliers...</td>
        </tr>
    `;

    try {

        const response =
            await fetch('api/suppliers/read.php');

        const suppliers =
            await response.json();

        suppliersContainer.innerHTML = '';

        if (!suppliers || suppliers.length === 0) {

            suppliersContainer.innerHTML = `
                <tr>
                    <td colspan="8">
                        No suppliers found
                    </td>
                </tr>
            `;

            return;
        }

        suppliers.forEach(supplier => {

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>${supplier.id}</td>
                <td>${supplier.supplier_name}</td>
                <td>${supplier.contact_person}</td>
                <td>${supplier.phone}</td>
                <td>${supplier.email}</td>
                <td>${supplier.address || ''}</td>
                <td>${supplier.supplied_items}</td>

                <td>

                    <button
                        class="action-btn edit"
                        data-id="${supplier.id}"
                        style="
                            background:#f0ad4e;
                            color:white;
                            border:none;
                            padding:5px 10px;
                            border-radius:4px;
                            cursor:pointer;
                            margin-bottom:5px;
                        "
                    >
                        Edit
                    </button>

                    <br>

                    <button
                        class="action-btn delete"
                        data-id="${supplier.id}"
                        data-name="${supplier.supplier_name}"
                        style="
                            background:#dc3545;
                            color:white;
                            border:none;
                            padding:5px 10px;
                            border-radius:4px;
                            cursor:pointer;
                        "
                    >
                        Delete
                    </button>

                </td>
            `;

            suppliersContainer.appendChild(row);

        });

        // =========================
        // EDIT BUTTON EVENTS
        // =========================

        document.querySelectorAll('.action-btn.edit')
        .forEach(btn => {

            btn.addEventListener('click', function () {

                const supplierId =
                    parseInt(
                        this.dataset.id
                    );

                console.log(
                    'Edit clicked:',
                    supplierId
                );

                editSupplier(supplierId);

            });

        });

        // =========================
        // DELETE BUTTON EVENTS
        // =========================

        document.querySelectorAll('.action-btn.delete')
        .forEach(btn => {

            btn.addEventListener('click', function () {

                const supplierId =
                    parseInt(
                        this.dataset.id
                    );

                const supplierName =
                    this.dataset.name;

                console.log(
                    'Delete clicked:',
                    supplierId
                );

                deleteSupplier(
                    supplierId,
                    supplierName
                );

            });

        });

    }
    catch (error) {

        console.error(error);

        suppliersContainer.innerHTML = `
            <tr>
                <td colspan="8">
                    Error loading suppliers
                </td>
            </tr>
        `;

        showNotification(
            'Failed to load suppliers',
            'error'
        );
    }
}

async function deleteSupplier(supplierId, supplierName) {

    if (!state.currentUser) {

        showNotification(
            'You must be logged in to delete suppliers',
            'error'
        );

        return;
    }

    if (
        !confirm(
            `Are you sure you want to delete supplier "${supplierName}"?`
        )
    ) {
        return;
    }

    try {

        const response = await fetch(
            'api/suppliers/delete.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: supplierId
                })
            }
        );

        const result = await response.json();

        if (result.success) {

            showNotification(
                `Supplier "${supplierName}" deleted successfully!`,
                'success'
            );

            loadSuppliers();

            loadSuppliersForDropdowns();

        } else {

            showNotification(
                result.message || 'Delete failed',
                'error'
            );

        }

    } catch (error) {

        console.error(error);

        showNotification(
            'Failed to delete supplier',
            'error'
        );

    }

}

function showAddSupplierModal() {

    const modalHTML = `
        <div style="text-align:left; padding:20px;">

            <h3 style="color:#5d4037; margin-bottom:20px;">
                Add New Supplier
            </h3>

            <div style="
                background:#f9f5f0;
                padding:20px;
                border-radius:8px;
                border:1px solid #e0d6d0;
            ">

                <div class="form-group">
                    <label>
                        <strong>Supplier Name</strong>
                    </label>
                    <input
                        type="text"
                        id="supplier-name"
                        placeholder="Enter supplier name"
                        style="width:100%;padding:8px;margin-top:5px;"
                    >
                </div>

                <div class="form-group">
                    <label>
                        <strong>Contact Person</strong>
                    </label>
                    <input
                        type="text"
                        id="supplier-contact"
                        placeholder="Enter contact person"
                        style="width:100%;padding:8px;margin-top:5px;"
                    >
                </div>

                <div class="form-row">

                    <div class="form-group">
                        <label>
                            <strong>Phone</strong>
                        </label>
                        <input
                            type="text"
                            id="supplier-phone"
                            placeholder="Enter phone number"
                            style="width:100%;padding:8px;margin-top:5px;"
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            <strong>Email</strong>
                        </label>
                        <input
                            type="email"
                            id="supplier-email"
                            placeholder="Enter email address"
                            style="width:100%;padding:8px;margin-top:5px;"
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            <strong>Address</strong>
                        </label>
                        <input
                            type="text"
                            id="supplier-address"
                            placeholder="Enter supplier address"
                            style="width:100%;padding:8px;margin-top:5px;"
                        >
                    </div>

                <div class="form-group">
                    <label>
                        <strong>Items Supplied</strong>
                    </label>
                    <input
                        type="text"
                        id="supplier-items"
                        placeholder="e.g. Coffee Beans, Syrups, Filters"
                        style="width:100%;padding:8px;margin-top:5px;"
                    >
                </div>

            </div>

        </div>
    `;

    const modal = document.createElement('div');

    modal.className = 'modal-overlay';

    modal.innerHTML = `
        <div class="modal-content">

            ${modalHTML}

            <div class="modal-actions">

                <button
                    id="save-supplier-btn"
                    style="
                        padding:10px 20px;
                        background:#4caf50;
                        color:white;
                        border:none;
                        border-radius:5px;
                        cursor:pointer;
                    ">
                    Save Supplier
                </button>

                <button
                    id="cancel-supplier-btn"
                    style="
                        padding:10px 20px;
                        background:#8d6e63;
                        color:white;
                        border:none;
                        border-radius:5px;
                        cursor:pointer;
                    ">
                    Cancel
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#save-supplier-btn')
    .addEventListener('click', async function () {

        const name =
            modal.querySelector('#supplier-name').value.trim();

        const contact =
            modal.querySelector('#supplier-contact').value.trim();

        const phone =
            modal.querySelector('#supplier-phone').value.trim();

        const email =
            modal.querySelector('#supplier-email').value.trim();

        const address =
            modal.querySelector('#supplier-address').value.trim();

        const items =
            modal.querySelector('#supplier-items').value.trim();

        if (
            !name ||
            !contact ||
            !phone ||
            !email ||
            !address ||
            !items
        ) {

            showNotification(
                'Please fill in all fields',
                'error'
            );

            return;
        }

        try {

            const response =
                await fetch(
                    'api/suppliers/create.php',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type':
                                'application/json'
                        },
                        body: JSON.stringify({
                            supplier_name: name,
                            contact_person: contact,
                            phone: phone,
                            email: email,
                            address: address,
                            supplied_items: items
                        })
                    }
                );

            const result =
                await response.json();

            if (result.success) {

                showNotification(
                    'Supplier added successfully!',
                    'success'
                );

                document.body.removeChild(modal);

                loadSuppliers();

                loadSuppliersForDropdowns();

            } else {

                showNotification(
                    result.message ||
                    'Failed to add supplier',
                    'error'
                );
            }

        } catch (error) {

            console.error(error);

            showNotification(
                'Server connection error',
                'error'
            );
        }

    });

    modal.querySelector('#cancel-supplier-btn')
    .addEventListener('click', () => {

        document.body.removeChild(modal);

    });

    modal.addEventListener('click', function (e) {

        if (e.target === modal) {

            document.body.removeChild(modal);

        }

    });

}

async function editSupplier(supplierId) {

    try {

        const response =
            await fetch(
                'api/suppliers/read_single.php?id=' +
                supplierId
            );

        const supplier =
            await response.json();

        if (!supplier.id) {

            showNotification(
                'Supplier not found',
                'error'
            );

            return;
        }

        const modalHTML = `
            <div style="text-align:left;padding:20px;">

                <h3 style="
                    color:#5d4037;
                    margin-bottom:20px;
                ">
                    Edit Supplier
                </h3>

                <div style="
                    background:#f9f5f0;
                    padding:20px;
                    border-radius:8px;
                    border:1px solid #e0d6d0;
                ">

                    <div class="form-group">
                        <label>
                            <strong>Supplier Name</strong>
                        </label>
                        <input
                            type="text"
                            id="edit-supplier-name"
                            value="${supplier.supplier_name || ''}"
                            style="width:100%;padding:8px;"
                        >
                    </div>

                    <div class="form-group">
                        <label>
                            <strong>Contact Person</strong>
                        </label>
                        <input
                            type="text"
                            id="edit-supplier-contact"
                            value="${supplier.contact_person || ''}"
                            style="width:100%;padding:8px;"
                        >
                    </div>

                    <div class="form-row">

                        <div class="form-group">
                            <label>
                                <strong>Phone</strong>
                            </label>
                            <input
                                type="text"
                                id="edit-supplier-phone"
                                value="${supplier.phone || ''}"
                                style="width:100%;padding:8px;"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                <strong>Email</strong>
                            </label>
                            <input
                                type="email"
                                id="edit-supplier-email"
                                value="${supplier.email || ''}"
                                style="width:100%;padding:8px;"
                            >
                        </div>

                        <div class="form-group">
                            <label>
                                <strong>Address</strong>
                            </label>
                            <input
                                type="text"
                                id="edit-supplier-address"
                                value="${supplier.address || ''}"
                                style="width:100%;padding:8px;"
                            >
                        </div>

                    <div class="form-group">
                        <label>
                            <strong>Items Supplied</strong>
                        </label>
                        <input
                            type="text"
                            id="edit-supplier-items"
                            value="${supplier.supplied_items || ''}"
                            style="width:100%;padding:8px;"
                        >
                    </div>

                </div>

            </div>
        `;

        const modal =
            document.createElement('div');

        modal.className =
            'modal-overlay';

        modal.innerHTML = `
            <div class="modal-content">

                ${modalHTML}

                <div class="modal-actions">

                    <button
                        id="update-supplier-btn"
                        style="
                            padding:10px 20px;
                            background:#4caf50;
                            color:white;
                            border:none;
                            border-radius:5px;
                        ">
                        Update
                    </button>

                    <button
                        id="cancel-edit-btn"
                        style="
                            padding:10px 20px;
                            background:#8d6e63;
                            color:white;
                            border:none;
                            border-radius:5px;
                        ">
                        Cancel
                    </button>

                </div>

            </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector('#update-supplier-btn')
        .addEventListener('click', async function () {

            const name =
                modal.querySelector(
                    '#edit-supplier-name'
                ).value;

            const contact =
                modal.querySelector(
                    '#edit-supplier-contact'
                ).value;

            const phone =
                modal.querySelector(
                    '#edit-supplier-phone'
                ).value;

            const email =
                modal.querySelector(
                    '#edit-supplier-email'
                ).value;

            const address =
                modal.querySelector(
                    '#edit-supplier-address'
                ).value;

            const items =
                modal.querySelector(
                    '#edit-supplier-items'
                ).value;

            if (
                !name ||
                !contact ||
                !phone ||
                !email ||
                !address ||
                !items
            ) {

                showNotification(
                    'Please fill in all fields',
                    'error'
                );

                return;
            }

            try {

                const updateResponse =
                    await fetch(
                        'api/suppliers/update.php',
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type':
                                'application/json'
                            },
                            body: JSON.stringify({
                                id: supplierId,
                                supplier_name: name,
                                contact_person: contact,
                                phone: phone,
                                email: email,
                                address: address,
                                supplied_items: items
                            })
                        }
                    );

                const result =
                    await updateResponse.json();

                if (result.success) {

                    showNotification(
                        'Supplier updated successfully!',
                        'success'
                    );

                    document.body.removeChild(
                        modal
                    );

                    loadSuppliers();

                    loadSuppliersForDropdowns();

                } else {

                    showNotification(
                        result.message,
                        'error'
                    );

                }

            } catch (error) {

                console.error(error);

                showNotification(
                    'Update failed',
                    'error'
                );

            }

        });

        modal.querySelector('#cancel-edit-btn')
        .addEventListener('click', () => {

            document.body.removeChild(
                modal
            );

        });

        modal.addEventListener('click', function (e) {

            if (e.target === modal) {

                document.body.removeChild(
                    modal
                );

            }

        });

    } catch (error) {

        console.error(error);

        showNotification(
            'Failed to load supplier',
            'error'
        );

    }

}

function viewSupplier(supplierId) {
    const suppliers = JSON.parse(localStorage.getItem('coffeeShopSuppliers') || '[]');
    const supplier = suppliers.find(s => s.id === supplierId);
    if (!supplier) {
        showNotification('Supplier not found', 'error');
        return;
    }
    
    const items = JSON.parse(localStorage.getItem('coffeeShopInventory') || '[]');
    const supplierItems = items.filter(item => item.supplier === supplier.name);
    
    let itemsList = '';
    if (supplierItems.length > 0) {
        itemsList = '<ul style="margin-left: 20px; margin-top: 10px;">';
        supplierItems.forEach(item => itemsList += `<li>${item.name} - ${item.quantity} ${item.unit} in stock</li>`);
        itemsList += '</ul>';
    } else {
        itemsList = '<p style="color: #8d6e63;">No inventory items from this supplier</p>';
    }
    
    const modalHTML = `
        <div style="text-align: left; padding: 20px;">
            <h3 style="color: #5d4037; margin-bottom: 20px;">Supplier Details: ${supplier.name}</h3>
            <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0d6d0;">
                <p><strong>Supplier ID:</strong> ${supplier.id}</p>
                <p><strong>Contact Person:</strong> ${supplier.contact}</p>
                <p><strong>Phone:</strong> ${supplier.phone}</p>
                <p><strong>Email:</strong> ${supplier.email}</p>
                <p><strong>Items Supplied:</strong> ${supplier.items}</p>
                <p style="margin-top: 15px;"><strong>Inventory Items from this Supplier:</strong></p>
                ${itemsList}
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            ${modalHTML}
            <div class="modal-actions">
                <button id="close-view-btn" style="padding: 10px 20px; background-color: #8d6e63; color: white; border: none; border-radius: 5px; cursor: pointer;">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.querySelector('#close-view-btn').addEventListener('click', () => document.body.removeChild(modal));
    modal.addEventListener('click', function(e) {
        if (e.target === modal) document.body.removeChild(modal);
    });
}

// ============================================
// REPORT FUNCTIONS
// ============================================
function initializeReports() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDateInput = document.getElementById('report-start-date');
    const endDateInput = document.getElementById('report-end-date');
    
    if (startDateInput) startDateInput.value = firstDay.toISOString().split('T')[0];
    if (endDateInput) endDateInput.value = today.toISOString().split('T')[0];
}

function generateReport() {
    const period = document.getElementById('report-period')?.value || 'week';
    const category = document.getElementById('report-category')?.value || 'all';
    
    let startDate, endDate;
    const today = new Date();
    
    switch(period) {
        case 'today':
            startDate = new Date(today);
            endDate = new Date(today);
            break;
        case 'week':
            startDate = new Date(today);
            startDate.setDate(today.getDate() - 7);
            endDate = new Date(today);
            break;
        case 'month':
            startDate = new Date(today.getFullYear(), today.getMonth(), 1);
            endDate = new Date(today);
            break;
        case 'quarter':
            const quarter = Math.floor(today.getMonth() / 3);
            startDate = new Date(today.getFullYear(), quarter * 3, 1);
            endDate = new Date(today);
            break;
        case 'year':
            startDate = new Date(today.getFullYear(), 0, 1);
            endDate = new Date(today);
            break;
        case 'custom':
            startDate = new Date(document.getElementById('report-start-date').value);
            endDate = new Date(document.getElementById('report-end-date').value);
            break;
    }
    
    const items = JSON.parse(localStorage.getItem('coffeeShopInventory') || '[]');
    const orders = JSON.parse(localStorage.getItem('coffeeShopOrders') || '[]');
    
    let filteredItems = items;
    if (category !== 'all') filteredItems = items.filter(item => item.category === category);
    
    updateReportMetrics(filteredItems, orders, startDate, endDate);
    generateCharts(filteredItems, category);
    generateMovementReport(filteredItems, orders, startDate, endDate);
    generateTopItemsByValue(filteredItems);
    generateReorderItems(filteredItems);
    
    showNotification('Report generated successfully', 'success');
}

function updateReportMetrics(items, orders, startDate, endDate) {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalItemsEl = document.getElementById('report-total-items');
    if (totalItemsEl) totalItemsEl.textContent = totalItems.toFixed(2);
    
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const totalValueEl = document.getElementById('report-total-value');
    if (totalValueEl) totalValueEl.textContent = `₱${totalValue.toFixed(2)}`;
    
    const periodOrders = orders.filter(order => {
        const orderDate = new Date(order.date);
        return orderDate >= startDate && orderDate <= endDate;
    });
    
    let itemsMoved = 0;
    periodOrders.forEach(order => order.items.forEach(item => itemsMoved += item.quantity));
    const movementItemsEl = document.getElementById('report-movement-items');
    if (movementItemsEl) movementItemsEl.textContent = itemsMoved;
    
    const lowStockCount = items.filter(item => item.quantity < (item.minQuantity || 5)).length;
    const lowStockEl = document.getElementById('report-low-stock');
    if (lowStockEl) lowStockEl.textContent = lowStockCount;
}

function generateCharts(items, categoryFilter) {
    if (window.categoryChart) window.categoryChart.destroy();
    if (window.trendChart) window.trendChart.destroy();
    
    const categories = {};
    items.forEach(item => {
        if (!categories[item.category]) categories[item.category] = 0;
        categories[item.category] += item.quantity * item.price;
    });
    
    const categoryLabels = Object.keys(categories).map(key => getCategoryName(key));
    const categoryValues = Object.values(categories);
    const categoryColors = generateCategoryColors(Object.keys(categories));
    
    const noChartData = document.getElementById('no-chart-data');
    const categoryChart = document.getElementById('category-chart');
    
    if (categoryLabels.length > 0 && noChartData && categoryChart) {
        noChartData.style.display = 'none';
        categoryChart.style.display = 'block';
        
        const ctx = categoryChart.getContext('2d');
        window.categoryChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: categoryLabels,
                datasets: [{
                    data: categoryValues,
                    backgroundColor: categoryColors,
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'right' },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = categoryValues.reduce((a, b) => a + b, 0);
                                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                return `₱${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    } else if (noChartData && categoryChart) {
        noChartData.style.display = 'block';
        categoryChart.style.display = 'none';
    }
    
    const trendLabels = [];
    const trendData = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthName = date.toLocaleString('default', { month: 'short' });
        trendLabels.push(`${monthName} ${date.getFullYear()}`);
        const baseValue = categoryFilter === 'all' ? 10000 : 2000;
        const variation = Math.random() * 0.2 - 0.1;
        trendData.push(baseValue * (1 + variation));
    }
    
    const noTrendData = document.getElementById('no-trend-data');
    const trendChart = document.getElementById('trend-chart');
    
    if (noTrendData && trendChart) {
        noTrendData.style.display = 'none';
        trendChart.style.display = 'block';
        
        const trendCtx = trendChart.getContext('2d');
        window.trendChart = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: trendLabels,
                datasets: [{
                    label: 'Stock Value Trend',
                    data: trendData,
                    borderColor: '#8d6e63',
                    backgroundColor: 'rgba(141, 110, 99, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'top' } },
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: { callback: value => '₱' + value.toLocaleString() }
                    }
                }
            }
        });
    }
}

function generateCategoryColors(categories) {
    const colorMap = {
        'coffee': '#ffb74d',
        'tea': '#81c784',
        'pastry': '#ffd54f',
        'syrup': '#ba68c8',
        'milk': '#64b5f6',
        'cup': '#a1887f',
        'cleaning': '#e57373',
        'equipment': '#90a4ae'
    };
    return categories.map(cat => colorMap[cat] || '#cccccc');
}

function generateMovementReport(items, orders, startDate, endDate) {
    const movementContainer = document.getElementById('movement-report');
    if (!movementContainer) return;
    
    movementContainer.innerHTML = '';
    
    if (items.length === 0) {
        movementContainer.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 30px; color: #8d6e63;">No items found for the selected filters</td></tr>';
        return;
    }
    
    items.forEach(item => {
        let stockIn = 0;
        orders.forEach(order => {
            if (new Date(order.date) >= startDate && new Date(order.date) <= endDate && order.status === 'Delivered') {
                order.items.forEach(orderItem => {
                    if (parseInt(orderItem.itemId) === item.id) stockIn += orderItem.quantity;
                });
            }
        });
        
        const stockOut = Math.floor(item.quantity * 0.3 * Math.random());
        const startingStock = item.quantity + stockOut - stockIn;
        const movementPercent = startingStock > 0 ? ((stockIn - stockOut) / startingStock * 100) : 0;
        
        let statusText = '', statusClass = '';
        if (item.quantity <= 0) {
            statusText = 'Out of Stock';
            statusClass = 'status-out-of-stock';
        } else if (item.quantity < (item.minQuantity || 5)) {
            statusText = 'Low Stock';
            statusClass = 'status-low-stock';
        } else if (movementPercent > 20) {
            statusText = 'High Movement';
            statusClass = 'status-in-stock';
        } else {
            statusText = 'Normal';
            statusClass = 'status-in-stock';
        }
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td><span class="category-tag category-${item.category}">${getCategoryName(item.category)}</span></td>
            <td>${startingStock.toFixed(2)} ${item.unit}</td>
            <td>${stockIn.toFixed(2)} ${item.unit}</td>
            <td>${stockOut.toFixed(2)} ${item.unit}</td>
            <td>${item.quantity.toFixed(2)} ${item.unit}</td>
            <td>${movementPercent.toFixed(1)}%</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        movementContainer.appendChild(row);
    });
}

function generateTopItemsByValue(items) {
    const container = document.getElementById('top-items-by-value');
    if (!container) return;
    
    container.innerHTML = '';
    const sortedItems = [...items].sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price)).slice(0, 5);
    
    if (sortedItems.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #8d6e63;">No items found</td></tr>';
        return;
    }
    
    sortedItems.forEach(item => {
        const totalValue = item.quantity * item.price;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td><span class="category-tag category-${item.category}">${getCategoryName(item.category)}</span></td>
            <td>${item.quantity.toFixed(2)} ${item.unit}</td>
            <td>₱${item.price.toFixed(2)}</td>
            <td>₱${totalValue.toFixed(2)}</td>
        `;
        container.appendChild(row);
    });
}

function generateReorderItems(items) {
    const container = document.getElementById('reorder-items');
    if (!container) return;
    
    container.innerHTML = '';
    const reorderItems = items.filter(item => item.quantity < (item.minQuantity || 5));
    
    if (reorderItems.length === 0) {
        container.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #8d6e63;">No items need reorder at this time</td></tr>';
        return;
    }
    
    reorderItems.forEach(item => {
        const reorderAmount = Math.max((item.minQuantity || 5) * 2 - item.quantity, 1);
        const statusClass = item.quantity <= 0 ? 'status-out-of-stock' : 'status-low-stock';
        const statusText = item.quantity <= 0 ? 'Out of Stock' : 'Low Stock';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.quantity.toFixed(2)} ${item.unit}</td>
            <td>${item.minQuantity || 5} ${item.unit}</td>
            <td>${reorderAmount.toFixed(2)} ${item.unit}</td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        `;
        container.appendChild(row);
    });
}

function exportReport() {
    const items = JSON.parse(localStorage.getItem('coffeeShopInventory') || '[]');
    const period = document.getElementById('report-period')?.value || 'week';
    const category = document.getElementById('report-category')?.value || 'all';
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "KiAMiX CoffeeBar Inventory Report\r\n";
    const periodSelect = document.getElementById('report-period');
    const periodText = periodSelect ? periodSelect.options[periodSelect.selectedIndex]?.text || period : period;
    csvContent += `Report Period: ${periodText}\r\n`;
    csvContent += `Category Filter: ${category === 'all' ? 'All Categories' : getCategoryName(category)}\r\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\r\n\r\n`;
    
    const totalItemsEl = document.getElementById('report-total-items');
    const totalValueEl = document.getElementById('report-total-value');
    const movementItemsEl = document.getElementById('report-movement-items');
    const lowStockEl = document.getElementById('report-low-stock');
    
    csvContent += "SUMMARY\r\n";
    csvContent += `Total Items in Stock,${totalItemsEl ? totalItemsEl.textContent : '0'}\r\n`;
    csvContent += `Total Stock Value,${totalValueEl ? totalValueEl.textContent : '₱0'}\r\n`;
    csvContent += `Items Moved This Period,${movementItemsEl ? movementItemsEl.textContent : '0'}\r\n`;
    csvContent += `Low Stock Items,${lowStockEl ? lowStockEl.textContent : '0'}\r\n\r\n`;
    
    csvContent += "DETAILED INVENTORY\r\n";
    csvContent += "Item Name,Category,Quantity,Unit,Price,Total Value,Status\r\n";
    
    items.forEach(item => {
        const totalValue = item.quantity * item.price;
        let status = 'In Stock';
        if (item.quantity <= 0) status = 'Out of Stock';
        else if (item.quantity < (item.minQuantity || 5)) status = 'Low Stock';
        
        csvContent += `"${item.name}",${getCategoryName(item.category)},${item.quantity},${item.unit},₱${item.price.toFixed(2)},₱${totalValue.toFixed(2)},${status}\r\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Report exported successfully!', 'success');
}

// ============================================
// GENERAL SETTINGS FUNCTIONS
// ============================================
function loadGeneralSettings() {
    const savedSettings = JSON.parse(localStorage.getItem('coffeeShopSettings') || '{}');
    const settingsPage = document.getElementById('settings-general');
    if (!settingsPage) return;
    
    const inputs = settingsPage.querySelectorAll('input');
    if (inputs.length >= 4) {
        inputs[0].value = savedSettings.shopName || 'KiAMiX CoffeeBar';
        inputs[1].value = savedSettings.shopAddress || '72 A. Mabini St, Rodriguez, Rizal (1860)';
        inputs[2].value = savedSettings.contactEmail || 'founder@kiamixcoffeebar.com';
        inputs[3].value = savedSettings.contactPhone || '0917 145 5202';
    }
}

function saveGeneralSettings() {
    const settingsPage = document.getElementById('settings-general');
    if (!settingsPage) {
        showNotification('Settings page not found', 'error');
        return;
    }
    
    const inputs = settingsPage.querySelectorAll('input');
    if (inputs.length < 4) {
        showNotification('Settings form not properly loaded', 'error');
        return;
    }
    
    const settings = {
        shopName: inputs[0].value.trim(),
        shopAddress: inputs[1].value.trim(),
        contactEmail: inputs[2].value.trim(),
        contactPhone: inputs[3].value.trim(),
        lastUpdated: new Date().toISOString(),
        updatedBy: state.currentUser ? state.currentUser.username : 'system'
    };
    
    if (!settings.shopName) {
        showNotification('Please enter a shop name', 'error');
        return;
    }
    
    if (!settings.shopAddress) {
        showNotification('Please enter a shop address', 'error');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (settings.contactEmail && !emailRegex.test(settings.contactEmail)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    localStorage.setItem('coffeeShopSettings', JSON.stringify(settings));
    
    const shopNameHeader = document.querySelector('.logo h1');
    if (shopNameHeader) shopNameHeader.textContent = `${settings.shopName} - Inventory`;
    
    const currentYear = new Date().getFullYear();
    const footer = document.querySelector('footer p');
    if (footer) footer.innerHTML = `${settings.shopName} Inventory System &copy; ${currentYear}`;
    
    showNotification('Settings saved successfully!', 'success');
    console.log('Settings saved:', settings);
}

function initializeGeneralSettings() {
    const settingsPage = document.getElementById('settings-general');
    if (!settingsPage) return;
    
    loadGeneralSettings();
    
    const saveButton = settingsPage.querySelector('.btn.btn-success');
    if (saveButton) {
        const newSaveButton = saveButton.cloneNode(true);
        saveButton.parentNode.replaceChild(newSaveButton, saveButton);
        newSaveButton.addEventListener('click', function(e) {
            e.preventDefault();
            saveGeneralSettings();
        });
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    initializeData();
    migrateExistingOrders();
    initializePOItemEventListeners();
    initializeGeneralSettings();

    // MYSQL DASHBOARD
    updateDashboardStats();
    loadRecentItems();
    loadInventoryItems();
    
    const settingsGeneralLink = document.querySelector('[data-page="settings-general"]');
    if (settingsGeneralLink) {
        settingsGeneralLink.addEventListener('click', function() {
            setTimeout(loadGeneralSettings, 100);
        });
    }
    
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.target.id === 'settings-general' && mutation.target.classList.contains('active')) {
                loadGeneralSettings();
            }
        });
    });
    
    const settingsPage = document.getElementById('settings-general');
    if (settingsPage) observer.observe(settingsPage, { attributes: true, attributeFilter: ['class'] });
});