<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KiAMiX CoffeeBar - Inventory System</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Quicksand:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet"
    href="assets/css/style.css">
</head>
<body>
    <div class="container">
        <!-- Login Page -->
        <div id="login-page" class="login-container">
            <div class="login-form">
                <div class="login-logo-container">
                    <img src="assets/images/logo.jpeg" alt="KiAMiX CoffeeBar Logo" class="login-logo-img">
                </div>
                <p style="text-align: center; color: #795548; margin-bottom: 25px;">Inventory Management System</p>
                <div class="form-group">
                    <label for="login-username"><i class="fas fa-user"></i> Username or Email</label>
                    <input type="text" id="login-username" placeholder="Enter your username or email">
                </div>
                <div class="form-group">
                    <label for="login-password"><i class="fas fa-lock"></i> Password</label>
                    <input type="password" id="login-password" placeholder="Enter your password">
                    <button type="button" class="password-toggle" id="login-password-toggle">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <div class="form-group">
                    <label for="login-role"><i class="fas fa-user-tag"></i> Login as</label>
                    <select id="login-role">
                        <option value="admin">Administrator</option>
                        <option value="manager">Store Manager</option>
                        <option value="staff">Staff Member</option>
                    </select>
                </div>
                <button class="btn" id="login-btn">Login <i class="fas fa-sign-in-alt"></i></button>
                <div class="form-footer">
                    <p>Don't have an account? <a href="#" id="show-register">Register here</a></p>
                </div>
            </div>

            <div class="register-form hidden">
                <div class="login-logo-container">
                    <img src="assets/images/logo.jpeg" alt="KiAMiX CoffeeBar Logo" class="login-logo-img">
                </div>
                <h2 style="margin-bottom: 20px;"><i class="fas fa-user-plus"></i> User Registration</h2>
                <div class="form-group">
                    <label for="reg-name"><i class="fas fa-id-card"></i> Full Name</label>
                    <input type="text" id="reg-name" placeholder="Enter your full name">
                </div>
                <div class="form-group">
                    <label for="reg-username"><i class="fas fa-user"></i> Username</label>
                    <input type="text" id="reg-username" placeholder="Choose a username">
                </div>
                <div class="form-group">
                    <label for="reg-password"><i class="fas fa-lock"></i> Password</label>
                    <input type="password" id="reg-password" placeholder="Create a password">
                    <button type="button" class="password-toggle" id="reg-password-toggle">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
                <div class="form-group">
                    <label for="reg-email"><i class="fas fa-envelope"></i> Email Address</label>
                    <input type="email" id="reg-email" placeholder="Enter your email">
                </div>
                <div class="form-group">
                    <label for="reg-role"><i class="fas fa-user-tag"></i> Account Type</label>
                    <select id="reg-role">
                        <option value="staff">Staff Member</option>
                        <option value="manager">Store Manager</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
                <button class="btn btn-success" id="register-btn">Register <i class="fas fa-user-check"></i></button>
                <div class="form-footer">
                    <p>Already have an account? <a href="#" id="show-login">Login here</a></p>
                </div>
            </div>

            <div class="coffee-bean bean-1"></div>
            <div class="coffee-bean bean-2"></div>
            <div class="coffee-bean bean-3"></div>
            <div class="coffee-bean bean-4"></div>
        </div>

        <!-- Main Application (hidden until login) -->
        <div id="app-container" class="hidden">
            <!-- Header -->
            <header>
                <div class="logo">
                    <img src="assets/images/logo.jpeg" alt="KiAMiX CoffeeBar Logo" class="header-logo">
                    <h1>KiAMiX CoffeeBar - Inventory</h1>
                </div>
                <div class="user-info">
                    <span id="logged-in-user">Admin</span>
                    <button class="logout-btn" id="logout-btn"><i class="fas fa-sign-out-alt"></i> Logout</button>
                </div>
            </header>

            <div class="main-content">
                <!-- Sidebar Menu -->
                <nav class="sidebar">
                    <ul class="sidebar-menu">
                        <li>
                            <a href="#" data-page="dashboard" class="active">
                                <i class="fas fa-tachometer-alt"></i>
                                <span class="menu-text">Dashboard</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" data-page="inventory">
                                <i class="fas fa-boxes"></i>
                                <span class="menu-text">Inventory</span>
                                <span class="arrow"><i class="fas fa-chevron-right"></i></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="#" data-page="view-inventory">View Inventory</a></li>
                                <li><a href="#" data-page="add-inventory">Add New Item</a></li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" data-page="orders">
                                <i class="fas fa-clipboard-list"></i>
                                <span class="menu-text">Orders</span>
                                <span class="arrow"><i class="fas fa-chevron-right"></i></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="#" data-page="purchase-order">Create Purchase Order</a></li>
                                <li><a href="#" data-page="view-orders">View Orders</a></li>
                            </ul>
                        </li>
                        <li>
                            <a href="#" data-page="suppliers">
                                <i class="fas fa-truck"></i>
                                <span class="menu-text">Suppliers</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" data-page="reports">
                                <i class="fas fa-chart-bar"></i>
                                <span class="menu-text">Reports</span>
                            </a>
                        </li>
                        <li>
                            <a href="#" data-page="settings">
                                <i class="fas fa-cog"></i>
                                <span class="menu-text">Settings</span>
                                <span class="arrow"><i class="fas fa-chevron-right"></i></span>
                            </a>
                            <ul class="dropdown-menu">
                                <li><a href="#" data-page="settings-general">General Settings</a></li>
                                <li><a href="#" data-page="user-management">User Management</a></li>
                            </ul>
                        </li>
                    </ul>
                </nav>

                <!-- Content Area -->
                <main class="content">
                    <!-- Dashboard Page -->
                    <div id="dashboard" class="page active">
                        <div class="page-header">
                            <h2><i class="fas fa-tachometer-alt"></i> Dashboard</h2>
                            <p>Welcome to your coffee bar inventory management system</p>
                        </div>
                        
                        <div class="welcome-message">
                            <div class="welcome-logo-container">
                                <img src="assets/images/logo.jpeg" alt="KiAMiX CoffeeBar Logo" class="welcome-logo">
                            </div>
                            <h1>Welcome to KiAMiX CoffeeBar Inventory System</h1>
                            <p>Manage your coffee bar inventory, track supplies, create purchase orders, and generate reports all in one place. Keep your coffee bar running smoothly with our comprehensive inventory management solution.</p>
                        </div>
                        
                        <div class="stats-container">
                            <div class="stat-card">
                                <div class="stat-icon inventory">
                                    <i class="fas fa-boxes"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="total-items">0</h3>
                                    <p>Total Inventory Items</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon orders">
                                    <i class="fas fa-clipboard-list"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="total-orders">0</h3>
                                    <p>Purchase Orders</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon sales">
                                    <i class="fas fa-peso-sign"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="total-value">₱0</h3>
                                    <p>Total Inventory Value</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon suppliers">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="low-stock">0</h3>
                                    <p>Low Stock Items</p>
                                </div>
                            </div>
                        </div>

                        <div class="table-container">
                            <h3 style="padding: 20px 20px 0;">Recent Inventory Items</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Item ID</th>
                                        <th>Item Name</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="recent-items">
                                    <!-- Items will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- View Inventory Page -->
                    <div id="view-inventory" class="page">
                        <div class="page-header">
                            <h2><i class="fas fa-boxes"></i> Inventory Items</h2>
                            <p>View and manage your coffee bar inventory items</p>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Item Name</th>
                                        <th>Category</th>
                                        <th>Quantity</th>
                                        <th>Unit</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="inventory-items">
                                    <!-- Items will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Add Inventory Page -->
                    <div id="add-inventory" class="page">
                        <div class="page-header">
                            <h2><i class="fas fa-plus-circle"></i> Add New Inventory Item</h2>
                            <p>Add a new item to your coffee bar inventory</p>
                        </div>
                        <div class="form-container">
                            <div class="form-group">
                                <label for="item-name">Item Name</label>
                                <input type="text" id="item-name" placeholder="e.g., Arabica Coffee Beans">
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="item-category">Category</label>
                                    <select id="item-category">
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
                                    <label for="item-unit">Unit</label>
                                    <select id="item-unit">
                                        <option value="kg">Kilogram (kg)</option>
                                        <option value="g">Gram (g)</option>
                                        <option value="lb">Pound (lb)</option>
                                        <option value="oz">Ounce (oz)</option>
                                        <option value="liter">Liter</option>
                                        <option value="ml">Milliliter (ml)</option>
                                        <option value="unit">Unit</option>
                                        <option value="case">Case</option>
                                        <option value="box">Box</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="item-quantity">Quantity</label>
                                    <input type="number" id="item-quantity" placeholder="Enter quantity" min="0" step="0.01">
                                </div>
                                <div class="form-group">
                                    <label for="item-price">Price per Unit (₱)</label>
                                    <input type="number" step="0.01" id="item-price" placeholder="Enter price">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="item-supplier">Supplier</label>
                                    <select id="item-supplier">
                                        <option value="">Select a supplier</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="item-min-quantity">Minimum Stock Level</label>
                                    <input type="number" id="item-min-quantity" placeholder="Minimum quantity before reorder">
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="item-description">Description</label>
                                <textarea id="item-description" rows="3" placeholder="Enter item description"></textarea>
                            </div>
                            <div class="form-actions">
                                <button class="btn btn-success" id="add-item-btn">Add Item to Inventory</button>
                                <button class="btn btn-secondary" id="clear-form-btn">Clear Form</button>
                            </div>
                        </div>
                    </div>

                    <!-- Purchase Order Page - WITH CORRECT SHIPPING OPTIONS -->
                    <div id="purchase-order" class="page">
                        <div class="page-header">
                            <h2><i class="fas fa-file-invoice-dollar"></i> Create Purchase Order</h2>
                            <p>Create a new purchase order for inventory items</p>
                        </div>
                        <div class="form-container">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="po-number">Purchase Order #</label>
                                    <input type="text" id="po-number" value="PO-001" readonly>
                                </div>
                                <div class="form-group">
                                    <label for="po-date">Order Date</label>
                                    <input type="date" id="po-date">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="po-supplier">Supplier</label>
                                    <select id="po-supplier">
                                        <option value="">Select a supplier</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="po-expected-date">Expected Delivery Date</label>
                                    <input type="date" id="po-expected-date">
                                </div>
                            </div>
                            
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="po-shipping-method">Shipping Method</label>
                                    <select id="po-shipping-method">
                                        <option value="">Select Shipping Method</option>
                                        <option value="Ground">Standard Shipping</option>
                                        <option value="Express">Express Delivery</option>
                                        <option value="Pickup">Supplier Pickup</option>
                                        <option value="Local">Local Delivery</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="po-shipping-notes">Shipping Notes</label>
                                    <input type="text" id="po-shipping-notes" placeholder="Special delivery instructions">
                                </div>
                            </div>
                            
                            <div class="form-group">
                                <label style="margin-bottom: 10px;">
                                    <i class="fas fa-paperclip"></i> Attachments (Add quotes, specifications, documents)
                                </label>
                                <div class="attachments-container">
                                    <div class="attachment-input">
                                        <input type="file" id="po-attachment-1" class="po-attachment" data-id="1" accept=".pdf,.doc,.docx,.jpg,.png,.xls,.xlsx">
                                        <label for="po-attachment-1" class="attachment-label">
                                            <i class="fas fa-plus"></i> Add Attachment
                                        </label>
                                    </div>
                                    <div id="attachment-list" class="attachment-list">
                                    </div>
                                </div>
                                <p style="font-size: 12px; color: #8d6e63; margin-top: 5px;">
                                    Max file size: 5MB. Allowed types: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX
                                </p>
                            </div>
                            
                            <h3 style="margin: 25px 0 15px; color: #5d4037;">Order Items</h3>
                            <div id="po-items-container">
                                <div class="po-item form-row">
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
                                        <button type="button" class="btn btn-danger remove-po-item" style="margin-top: 8px; padding: 5px 10px; font-size: 14px;" disabled>
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <button class="btn btn-secondary" id="add-po-item"><i class="fas fa-plus"></i> Add Another Item</button>
                            
                            <div class="po-total">
                                Total Amount: <span id="po-total">₱0.00</span>
                            </div>
                            
                            <div class="form-actions">
                                <button class="btn btn-success" id="submit-po">Submit Purchase Order</button>
                                <button class="btn btn-secondary" id="save-draft-btn">Save as Draft</button>
                                <button class="btn btn-danger" id="cancel-po-btn">Cancel</button>
                            </div>
                        </div>
                    </div>

                    <!-- Reports Page -->
                    <div id="reports" class="page">
                        <div class="page-header">
                            <h2><i class="fas fa-chart-bar"></i> Reports & Analytics</h2>
                            <p>View inventory and sales reports with key metrics</p>
                        </div>
                        
                        <div class="form-container" style="margin-bottom: 20px;">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="report-period">Report Period</label>
                                    <select id="report-period">
                                        <option value="today">Today</option>
                                        <option value="week" selected>This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="quarter">This Quarter</option>
                                        <option value="year">This Year</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="report-category">Category Filter</label>
                                    <select id="report-category">
                                        <option value="all">All Categories</option>
                                        <option value="coffee">Coffee Beans</option>
                                        <option value="tea">Tea & Herbal</option>
                                        <option value="pastry">Pastries & Food</option>
                                        <option value="syrup">Syrups & Flavorings</option>
                                        <option value="milk">Milk & Dairy</option>
                                        <option value="cup">Cups & Packaging</option>
                                        <option value="cleaning">Cleaning Supplies</option>
                                        <option value="equipment">Equipment</option>
                                    </select>
                                </div>
                            </div>
                            <div class="form-row" id="custom-date-range" style="display: none;">
                                <div class="form-group">
                                    <label for="report-start-date">Start Date</label>
                                    <input type="date" id="report-start-date">
                                </div>
                                <div class="form-group">
                                    <label for="report-end-date">End Date</label>
                                    <input type="date" id="report-end-date">
                                </div>
                            </div>
                            <div class="form-actions" style="justify-content: flex-end;">
                                <button class="btn btn-success" id="generate-report-btn">
                                    <i class="fas fa-chart-line"></i> Generate Report
                                </button>
                                <button class="btn btn-secondary" id="export-report-btn">
                                    <i class="fas fa-file-export"></i> Export Report
                                </button>
                            </div>
                        </div>
                        
                        <div class="stats-container">
                            <div class="stat-card">
                                <div class="stat-icon inventory">
                                    <i class="fas fa-boxes"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="report-total-items">0</h3>
                                    <p>Total Items in Stock</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon sales">
                                    <i class="fas fa-peso-sign"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="report-total-value">₱0</h3>
                                    <p>Total Stock Value</p>
                                </div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon suppliers">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="stat-info">
                                    <h3 id="report-low-stock">0</h3>
                                    <p>Low Stock Items</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-row" style="margin-top: 30px;">
                            <div class="form-container" style="flex: 1;">
                                <h3 style="margin-bottom: 20px; color: #5d4037;">
                                    <i class="fas fa-chart-pie"></i> Stock Distribution by Category
                                </h3>
                                <div class="chart-container">
                                    <p id="no-chart-data" class="chart-placeholder">Chart will appear here when report is generated</p>
                                    <canvas id="category-chart" style="display: none; max-width: 100%;"></canvas>
                                </div>
                            </div>
                            <div class="form-container" style="flex: 1;">
                                <h3 style="margin-bottom: 20px; color: #5d4037;">
                                    <i class="fas fa-chart-line"></i> Stock Value Trend
                                </h3>
                                <div class="chart-container">
                                    <p id="no-trend-data" class="chart-placeholder">Trend chart will appear here when report is generated</p>
                                    <canvas id="trend-chart" style="display: none; max-width: 100%;"></canvas>
                                </div>
                            </div>
                        </div>
                        <div class="form-row" style="margin-top: 30px;">
                            <div class="form-container" style="flex: 1;">
                                <h3 style="margin-bottom: 20px; color: #5d4037;">
                                    <i class="fas fa-arrow-up"></i> Top 5 Items by Stock Value
                                </h3>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Item Name</th>
                                                <th>Category</th>
                                                <th>Quantity</th>
                                                <th>Unit Price</th>
                                                <th>Total Value</th>
                                            </tr>
                                        </thead>
                                        <tbody id="top-items-by-value">
                                            <tr>
                                                <td colspan="5" style="text-align: center; padding: 20px; color: #8d6e63;">
                                                    No data available
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div class="form-container" style="flex: 1;">
                                <h3 style="margin-bottom: 20px; color: #5d4037;">
                                    <i class="fas fa-arrow-down"></i> Items Requiring Reorder
                                </h3>
                                <div class="table-container">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Item Name</th>
                                                <th>Current Stock</th>
                                                <th>Min. Required</th>
                                                <th>Reorder Amount</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody id="reorder-items">
                                            <tr>
                                                <td colspan="5" style="text-align: center; padding: 20px; color: #8d6e63;">
                                                    No items need reorder at this time
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- View Orders Page -->
                    <div id="view-orders" class="page">
                        <div class="page-header">
                            <h2><i class="fas fa-clipboard-list"></i> Purchase Orders</h2>
                            <p>View and manage purchase orders</p>
                        </div>
                        
                        <div class="filter-bar" style="margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e0d6d0;">
                            <div class="form-row" style="margin-bottom: 0;">
                                <div class="form-group">
                                    <label for="order-filter-status">Status</label>
                                    <select id="order-filter-status">
                                        <option value="all">All Status</option>
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="order-filter-supplier">Supplier</label>
                                    <select id="order-filter-supplier">
                                        <option value="all">All Suppliers</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="order-filter-date">Date Range</label>
                                    <select id="order-filter-date">
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">This Week</option>
                                        <option value="month">This Month</option>
                                        <option value="quarter">This Quarter</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>&nbsp;</label>
                                    <button class="btn btn-secondary" id="clear-order-filters" style="margin-top: 8px;">
                                        <i class="fas fa-times"></i> Clear Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>PO # / Reference</th>
                                        <th>Supplier</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Shipping Method</th>
                                        <th>Total Amount</th>
                                        <th>Attachments</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="orders-list">
                                    <!-- Orders will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                        
                        <div id="order-details-modal" class="modal-overlay hidden">
                            <div class="modal-content" style="max-width: 800px;">
                            </div>
                        </div>
                    </div>

                    <!-- Suppliers Page -->
                    <div id="suppliers" class="page">
                        <div class="page-header">
                            <h2><i class="fas fa-truck"></i> Suppliers</h2>
                            <p>Manage coffee bar suppliers</p>
                        </div>
                        <div class="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Supplier Name</th>
                                        <th>Contact Person</th>
                                        <th>Phone</th>
                                        <th>Email</th>
                                        <th>Address</th>
                                        <th>Items Supplied</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="suppliers-list">
                                    <!-- Suppliers will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                        <div style="margin-top: 20px; display: flex; justify-content: center;">
                            <button class="btn btn-success" id="add-supplier-btn">
                                <i class="fas fa-plus"></i> Add New Supplier
                            </button>
                        </div>
                    </div>

                    <!-- Settings General Page -->
                    <div id="settings-general" class="page">
                        <div class="page-header">
                            <h2><i class="fas fa-cog"></i> General Settings</h2>
                            <p>Configure system settings</p>
                        </div>
                        <div class="form-container">
                            <div class="form-group">
                                <label>Shop Name</label>
                                <input type="text" placeholder="Enter shop name" value="KiAMiX CoffeeBar">
                            </div>
                            <div class="form-group">
                                <label>Shop Address</label>
                                <input type="text" placeholder="Enter shop address">
                            </div>
                            <div class="form-group">
                                <label>Contact Email</label>
                                <input type="email" placeholder="Enter contact email">
                            </div>
                            <div class="form-group">
                                <label>Contact Phone</label>
                                <input type="tel" placeholder="Enter contact phone">
                            </div>
                            <button class="btn btn-success">Save Settings</button>
                        </div>
                    </div>

                    <!-- User Management Page -->
                    <div id="user-management" class="page">
                        <div class="page-header">
                            <h2><i class="fas fa-users"></i> User Management</h2>
                            <p>Manage system users and permissions</p>
                        </div>

                        <div class="table-container" style="margin-bottom: 30px;">
                            <h3 style="padding: 20px 20px 0;">Active Sessions</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Role</th>
                                        <th>Login Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody id="active-sessions">
                                    <tr>
                                        <td colspan="5" style="text-align: center; padding: 20px; color: #8d6e63;">
                                            Loading active sessions...
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="table-container">
                            <h3 style="padding: 20px 20px 0;">User Accounts</h3>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Full Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Account Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody id="users-list">
                                    <!-- Users will be populated by JavaScript -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            <footer>
                <p>KiAMiX CoffeeBar Inventory System &copy; 2026</p>
            </footer>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="assets/js/script.js"></script>
</body>
</html>