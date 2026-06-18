const INVENTORY_API =
'api/inventory';

// Application State
const state = {
    currentUser: null,
    isLoggedIn: false,
    currentPage: 'dashboard'
};

let currentUserRole = '';

async function loadCurrentUser() {

    try {

        const response = await fetch(
            'api/auth/current_user.php'
        );

        const result = await response.json();

        if (result.success) {

            currentUserRole =
                result.user.role;

        }

    } catch(error){

        console.error(error);
    }
}

async function getUsers() {

    const response = await fetch(
        'api/users/read.php'
    );

    const result = await response.json();

    return result.data || [];
}

async function createUser(userData) {

    const response = await fetch(
        'api/users/create.php',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        }
    );

    return await response.json();
}

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

function getCurrentRole() {

    return (
        state.currentUser?.role || ''
    ).toLowerCase().trim();

}

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
// INITIALIZATION FUNCTIONS
// ============================================
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

// ============================================
// EVENT LISTENERS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
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
loginBtn.addEventListener('click', async function() {

    const usernameOrEmail =
        document.getElementById('login-username').value.trim();

    const password =
        document.getElementById('login-password').value;

    const role =
        document.getElementById('login-role').value;

    if (!usernameOrEmail || !password) {

        showNotification(
            'Please enter username/email and password',
            'error'
        );

        return;
    }

    try {

        const response = await fetch(
            'api/auth/login.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: usernameOrEmail,
                    password: password,
                    role: role
                })
            }
        );

        const result = await response.json();

        if (result.success) {

            state.currentUser = result.user;

            state.isLoggedIn = true;

            await loadCurrentUser();

            showApp();

            showNotification(
                `Welcome back, ${result.user.fullname}!`,
                'success'
            );

        } else {

            showNotification(
                result.message,
                'error'
            );

        }

    } catch(error) {

        console.error(error);

        showNotification(
            'Login failed',
            'error'
        );

    }
});

// Registration Functionality
registerBtn.addEventListener('click', async function() {
    const name = document.getElementById('reg-name').value;
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;
    const email = document.getElementById('reg-email').value;
    const role = document.getElementById('reg-role').value;

    if (!name || !username || !password || !email) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    const users = await getUsers();
    
    if (users.find(u => u.username === username)) {
        showNotification('Username already exists', 'error');
        return;
    }

    if (users.find(u => u.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }

    const result = await createUser({
        fullname: name,
        username: username,
        password: password,
        email: email,
        role: role
    });

    if (!result.success) {

        showNotification(
            result.message,
            'error'
        );

        return;
    }

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
    state.currentUser = null;
    state.isLoggedIn = false;
    showLoginPage();
    showNotification('Logged out successfully', 'info');
});

// ============================================
// PAGE MANAGEMENT FUNCTIONS
// ============================================
function showApp() {
    loginPage.classList.add('hidden');
    appContainer.classList.remove('hidden');
    
    loggedInUser.textContent =
        `${state.currentUser.fullname} (${state.currentUser.role})`;

    const role =
        (state.currentUser?.role || '')
            .trim()
            .toLowerCase();

    console.log("Current User:", state.currentUser);
    console.log("Current Role:", role);

    const settingsMenu =
        document.getElementById('settings-menu');

    if (settingsMenu) {

        settingsMenu.style.display =
            role === 'administrator'
                ? 'block'
                : 'none';

    }

    const inventoryAddMenu =
        document.querySelector('[data-page="add-inventory"]');

    const suppliersMenu =
        document.querySelector('[data-page="suppliers"]');

    const reportsMenu =
        document.querySelector('[data-page="reports"]');

    if (role === 'staff') {

        if (inventoryAddMenu)
            inventoryAddMenu.style.display = 'none';

    }
    
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
        if (this.id === 'settings-toggle') {
            return;
        }
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

const settingsToggle =
    document.getElementById('settings-toggle');

const settingsMenu =
    document.getElementById('settings-menu');

if (settingsToggle && settingsMenu) {

    settingsToggle.addEventListener('click', function(e) {

        e.preventDefault();

        settingsMenu.classList.toggle('active');

    });

}

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

            if (
                getCurrentRole() !==
                'administrator'
            ) {

                showNotification(
                    'Access Denied',
                    'error'
                );

                showPage('dashboard');

                return;
            }

            loadUsers();
            loadActiveSessions();
        }
        } else if (pageId === 'suppliers') {
            loadSuppliers();
        } else if (pageId === 'reports') {
            generateReport();
        } else if (pageId === 'settings-general') {
            loadGeneralSettings();
        } else if (pageId === 'purchase-order') {
            loadNextPONumber();
            loadSuppliersForDropdowns();
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
    else {
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

        console.log('Inventory API:', items);

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

                    ${getCurrentRole() === 'administrator'
                        ? `
                            <button
                                class="action-btn delete"
                                data-id="${item.id}">
                                Delete
                            </button>
                          `
                        : ''
                    }

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
    document.getElementById('po-supplier').value = '';
    
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
    
    if (getCurrentRole() === 'Administrator' || getCurrentRole() === 'Store Manager' || 
        (getCurrentRole() === 'Staff' && state.currentUser.username === order.createdBy)) {
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
                &&
                currentUserRole === 'Administrator'

                ?

                `

                <button
                    class="btn btn-success"
                    onclick="approvePurchaseOrder(${order.id})"
                >
                    Approve
                </button>

                <button
                    class="btn btn-danger"
                    onclick="cancelPurchaseOrder(${order.id})"
                >
                    Cancel
                </button>

                `

                : ''

            }

            ${

                order.status === 'Approved'
                &&
                (
                    currentUserRole === 'Administrator'
                    ||
                    currentUserRole === 'Store Manager'
                )

                ?

                `

                <button
                    class="btn btn-primary"
                    onclick="shipPurchaseOrder(${order.id})"
                >
                    Ship
                </button>

                `

                : ''

            }

            ${

                order.status === 'Shipped'
                &&
                (
                    currentUserRole === 'Administrator'
                    ||
                    currentUserRole === 'Store Manager'
                )

                ?

                `

                <button
                    class="btn btn-success"
                    onclick="deliverPurchaseOrder(${order.id})"
                >
                    Deliver
                </button>

                `

                : ''

            }

            <button
                class="btn btn-primary"
                onclick="exportPurchaseOrder(${order.id})"
            >
                Export Receipt
            </button>

            <button
                class="btn"
                id="close-po-modal"
            >
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
async function loadUsers() {

    try {

        const response =
            await fetch('api/users/read.php');

        const result =
            await response.json();

        console.log(result);

        const usersContainer =
            document.getElementById('users-list');

        if (!usersContainer) return;

        usersContainer.innerHTML = '';

        if (!result.success) {

            usersContainer.innerHTML =
            `<tr>
                <td colspan="6">
                    Failed to load users
                </td>
            </tr>`;

            return;
        }

        result.data.forEach(user => {

            const row =
                document.createElement('tr');

            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.fullname}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.created_at}</td>
                <td>
                    <button
                        class="action-btn view"
                        data-username="${user.username}">
                        View Profile
                    </button>

                    <button
                    class="action-btn edit"
                    data-username="${user.username}">
                    Edit
                    </button>
                </td>
            `;

            usersContainer.appendChild(row);
            row.querySelector('.view')
                ?.addEventListener('click', function () {

                    const username =
                        this.getAttribute('data-username');

                    viewUserProfile(username);
                });

            row.querySelector('.edit')
                ?.addEventListener('click', function () {

                    const username =
                        this.getAttribute('data-username');

                    editUserAccount(username);
                });

        });

    } catch(error) {

        console.error(error);
    }
}

async function loadActiveSessions() {

    const tbody =
        document.getElementById(
            'active-sessions'
        );

    if (!tbody) return;

    try {

        const response =
            await fetch(
                'api/users/active_sessions.php'
            );

        const result =
            await response.json();

        tbody.innerHTML = '';

        if (
            !result.success ||
            result.data.length === 0
        ) {

            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        No active sessions
                    </td>
                </tr>
            `;

            return;
        }

        result.data.forEach(session => {

            tbody.innerHTML += `
                <tr>
                    <td>${session.username}</td>
                    <td>${session.fullname}</td>
                    <td>${session.role}</td>
                    <td>${session.login_time}</td>
                    <td>
                        <span style="color:green">
                            Online
                        </span>
                    </td>
                </tr>
            `;
        });

    } catch(error) {

        console.error(
            'Active Sessions Error:',
            error
        );

    }
}

async function viewUserProfile(username) {
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    const isCurrentUser = state.currentUser && state.currentUser.username === username;

    const isActive =
        isCurrentUser;
    
    const profileHTML = `
        <div style="text-align: left; padding: 20px;">
            <h3 style="color: #5d4037; margin-bottom: 20px;">User Profile: ${user.fullname}</h3>
            <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0d6d0;">
                <p><strong>Username:</strong> ${user.username}</p>
                <p><strong>Full Name:</strong> ${user.fullname}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Role:</strong> ${user.role}</p>
                <p><strong>Status:</strong> <span style="color: ${isActive ? '#4caf50' : '#8d6e63'}">${isActive ? 'Currently Online' : 'Offline'}</span></p>
                <p><strong>Account Created:</strong> ${new Date().toLocaleDateString()}</p>
                ${state.currentUser && getCurrentRole() === 'Administrator' ? '<p><strong>Password:</strong> ********</p>' : ''}
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

async function editUserAccount(username) {
    const users = await getUsers();
    const user = users.find(u => u.username === username);
    if (!user) {
        showNotification('User not found', 'error');
        return;
    }
    
    console.log('Current User:', state.currentUser);
    console.log('Current Role:', state.currentUser.role);
    console.log('Editing User:', username);

    const currentRole = String(
        state.currentUser?.role || ''
    ).trim().toLowerCase();

    const editingOwnAccount =
        state.currentUser.username === user.username;

    const isAdministrator =
        currentRole === 'administrator';

    if (!isAdministrator && !editingOwnAccount) {

        showNotification(
            'You can only edit your own account. Only administrators can edit other users.',
            'error'
        );

        return;
    }
    
    const isCurrentUser = state.currentUser.username === username;
    
    const editHTML = `
        <div style="text-align: left; padding: 20px;">
            <h3 style="color: #5d4037; margin-bottom: 20px;">Edit User: ${user.fullname}</h3>
            <div style="background-color: #f9f5f0; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e0d6d0;">
                <div class="form-group">
                    <label for="edit-name"><strong>Full Name</strong></label>
                    <input type="text" id="edit-name" value="${user.fullname}" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                <div class="form-group">
                    <label for="edit-email"><strong>Email Address</strong></label>
                    <input type="email" id="edit-email" value="${user.email}" style="width: 100%; padding: 8px; margin-top: 5px;">
                </div>
                ${getCurrentRole() === 'administrator' ? `
                    <div class="form-group">
                        <label for="edit-role"><strong>Role</strong></label>
                        <select id="edit-role"
                            style="width:100%; padding:8px; margin-top:5px;"
                            ${isCurrentUser ? 'disabled' : ''}>

                            <option value="Staff"
                                ${user.role === 'Staff' ? 'selected' : ''}>
                                Staff Member
                            </option>

                            <option value="Store Manager"
                                ${user.role === 'Store Manager' ? 'selected' : ''}>
                                Store Manager
                            </option>

                            <option value="Administrator"
                                ${user.role === 'Administrator' ? 'selected' : ''}>
                                Administrator
                            </option>

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
    
    modal.querySelector('#save-edit-btn').addEventListener('click', async function() {
        const name = modal.querySelector('#edit-name').value;
        const email = modal.querySelector('#edit-email').value;
        const role = getCurrentRole() === 'administrator' ? modal.querySelector('#edit-role').value : user.role;
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
        
        try {

            const response = await fetch(
                'api/users/update.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id: user.id,
                        fullname: name,
                        email: email,
                        role: role,
                        password: password
                    })
                }
            );

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.message);
            }

            showNotification(
                'User account updated successfully!',
                'success'
            );

            document.body.removeChild(modal);

            await loadUsers();

        } catch(error) {

            console.error(error);

            showNotification(
                'Failed to update user.',
                'error'
            );
        }
    });
    
    modal.querySelector('#cancel-edit-btn').addEventListener('click', () => document.body.removeChild(modal));
    modal.addEventListener('click', function(e) {
        if (e.target === modal) document.body.removeChild(modal);
    });
}

async function deleteUserAccount(username) {

    const users = await getUsers();

    const user = users.find(
        u => u.username === username
    );

    if (!user) {

        showNotification(
            'User not found',
            'error'
        );

        return;
    }

    if (username === 'admin') {

        showNotification(
            'Cannot delete admin account',
            'error'
        );

        return;
    }

    if (
        state.currentUser &&
        state.currentUser.username === username
    ) {

        showNotification(
            'You cannot delete your own account',
            'error'
        );

        return;
    }

    if (
        !confirm(
            `Delete user "${username}"?`
        )
    ) {
        return;
    }

    try {

        const response = await fetch(
            'api/users/delete.php',
            {
                method: 'POST',
                headers: {
                    'Content-Type':
                        'application/json'
                },
                body: JSON.stringify({
                    id: user.id
                })
            }
        );

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message);
        }

        showNotification(
            'User deleted successfully!',
            'success'
        );

        await loadUsers();

    } catch(error) {

        console.error(error);

        showNotification(
            'Failed to delete user.',
            'error'
        );
    }
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

    console.log('generateReport() called');

    const period =
        document.getElementById('report-period')?.value || 'week';

    const category =
        document.getElementById('report-category')?.value || 'all';

    let startDate = '';
    let endDate = '';

    const today = new Date();

    switch (period) {

        case 'today':
            startDate = today.toISOString().split('T')[0];
            endDate = today.toISOString().split('T')[0];
            break;

        case 'week':
            {
                const start = new Date();
                start.setDate(today.getDate() - 7);

                startDate = start.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
            }
            break;

        case 'month':
            {
                const start = new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    1
                );

                startDate = start.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
            }
            break;

        case 'quarter':
            {
                const quarter =
                    Math.floor(today.getMonth() / 3);

                const start = new Date(
                    today.getFullYear(),
                    quarter * 3,
                    1
                );

                startDate = start.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
            }
            break;

        case 'year':
            {
                const start = new Date(
                    today.getFullYear(),
                    0,
                    1
                );

                startDate = start.toISOString().split('T')[0];
                endDate = today.toISOString().split('T')[0];
            }
            break;

        case 'custom':
            startDate =
                document.getElementById('report-start-date')?.value || '';

            endDate =
                document.getElementById('report-end-date')?.value || '';
            break;
    }

    const params = new URLSearchParams({
        period: period,
        category: category,
        start_date: startDate,
        end_date: endDate
    });

    console.log('Fetching report data...');
    console.log(params.toString());

    fetch(`api/reports/dashboard.php?${params.toString()}`)

        .then(response => {

            if (!response.ok) {
                throw new Error(
                    `HTTP Error: ${response.status}`
                );
            }

            return response.json();
        })

        .then(data => {

            console.log('Report API Response:', data);

            if (data.error) {
                throw new Error(data.error);
            }

            document.getElementById('report-total-items').textContent =
                data.total_items || 0;

            document.getElementById('report-total-value').textContent =
                '₱' + Number(
                    data.total_value || 0
                ).toLocaleString();

            document.getElementById('report-low-stock').textContent =
                data.low_stock || 0;

            loadTopItems(data.top_items || []);

            loadReorderItems(data.reorder_items || []);

            generateCharts(
                data.inventory_items || [],
                category
            );

            showNotification(
                'Report generated successfully',
                'success'
            );
        })

        .catch(error => {

            console.error(error);

            showNotification(
                'Failed to load report data',
                'error'
            );
        });
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
    
    const lowStockCount = items.filter(item => item.quantity < (item.minQuantity || 5)).length;
    const lowStockEl = document.getElementById('report-low-stock');
    if (lowStockEl) lowStockEl.textContent = lowStockCount;
}

function generateCharts(items, categoryFilter) {
    if (window.categoryChart) window.categoryChart.destroy();
    
    const categories = {};
    items.forEach(item => {
        if (!categories[item.category]) categories[item.category] = 0;
        categories[item.category] += item.quantity * item.price;
    });
    
    const categoryLabels = Object.keys(categories);
    const categoryValues = Object.values(categories);

    console.log("Categories Object:", categories);
    console.log("Category Labels:", categoryLabels);
    console.log("Category Values:", categoryValues);

    const categoryColors =
        generateCategoryColors(Object.keys(categories));
    
    const noChartData = document.getElementById('no-chart-data');
    const categoryChart = document.getElementById('category-chart');
    
    if (categoryLabels.length > 0 && noChartData && categoryChart) {
        noChartData.style.display = 'none';
        categoryChart.style.display = 'block';
        
        const ctx = categoryChart.getContext('2d');

        console.log("Creating Pie Chart...");

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
}

function generateCategoryColors(categories) {
    const colorMap = {
        'Coffee Beans': '#8d6e63',
        'Milk & Dairy': '#4caf50',
        'Tea': '#81c784',
        'Pastry': '#ffd54f',
        'Syrup': '#ba68c8',
        'Cups': '#64b5f6',
        'Cleaning Supplies': '#e57373',
        'Equipment': '#90a4ae'
    };

    return categories.map(cat =>
        colorMap[cat] || '#cccccc'
    );
}

function loadTopItems(topItems) {

    const container =
        document.getElementById('top-items-by-value');

    if (!container) return;

    container.innerHTML = '';

    if (!topItems || topItems.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;padding:20px;">
                    No data available
                </td>
            </tr>
        `;

        return;
    }

    topItems.forEach(item => {

        container.innerHTML += `
            <tr>
                <td>${item.item_name}</td>
                <td>${item.category}</td>
                <td>${item.quantity}</td>
                <td>₱${Number(item.unit_price).toFixed(2)}</td>
                <td>₱${Number(item.total_value).toFixed(2)}</td>
            </tr>
        `;
    });

}

function loadReorderItems(reorderItems) {

    const container =
        document.getElementById('reorder-items');

    if (!container) return;

    container.innerHTML = '';

    if (!reorderItems || reorderItems.length === 0) {

        container.innerHTML = `
            <tr>
                <td colspan="5"
                    style="text-align:center;padding:20px;">
                    No items need reorder
                </td>
            </tr>
        `;

        return;
    }

    reorderItems.forEach(item => {

        container.innerHTML += `
            <tr>
                <td>${item.item_name}</td>
                <td>${item.quantity}</td>
                <td>${item.min_stock}</td>
                <td>${item.reorder_amount}</td>
                <td>
                    <span class="status-badge status-low-stock">
                        Reorder
                    </span>
                </td>
            </tr>
        `;
    });

}

function exportReport() {

    const choice = prompt(
        "Enter:\nPDF = PDF Report\nCSV = CSV Report"
    );

    if (!choice) return;

    if (choice.toUpperCase() === "PDF") {

        const category =
            document.getElementById('report-category').value;
        
        const period =
            document.getElementById('report-period').value;

        let startDate;
        let endDate;

        if (period === 'custom') {

            startDate =
                document.getElementById('start-date').value;

            endDate =
                document.getElementById('end-date').value;

        } else {

            const today = new Date();

            switch (period) {

                case 'today':
                    startDate = today;
                    endDate = today;
                    break;

                case 'week':
                    startDate = new Date(today);
                    startDate.setDate(today.getDate() - 7);
                    endDate = today;
                    break;

                case 'month':
                    startDate = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1
                    );
                    endDate = today;
                    break;

                case 'year':
                    startDate = new Date(
                        today.getFullYear(),
                        0,
                        1
                    );
                    endDate = today;
                    break;
            }

            startDate =
                startDate.toISOString().split('T')[0];

            endDate =
                endDate.toISOString().split('T')[0];
        }

        window.open(
            `api/reports/export_inventory_pdf.php?period=${encodeURIComponent(period)}` +
            `&category=${encodeURIComponent(category)}` +
            `&start_date=${encodeURIComponent(startDate)}` +
            `&end_date=${encodeURIComponent(endDate)}`
        );

    } else if (choice.toUpperCase() === "CSV") {

        const category =
            document.getElementById('report-category').value;

        window.location.href =
            `api/reports/export_inventory_csv.php?period=${encodeURIComponent(period)}` +
            `&category=${encodeURIComponent(category)}` +
            `&start_date=${encodeURIComponent(startDate)}` +
            `&end_date=${encodeURIComponent(endDate)}`;

    } else {

        alert("Please enter PDF or CSV");

    }

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
document.addEventListener('DOMContentLoaded', async function() {

    await loadCurrentUser();

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