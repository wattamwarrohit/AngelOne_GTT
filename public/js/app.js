const { useState, useEffect, useCallback } = React;

// Utility functions
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
    }).format(amount);
};

const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
};

const getPnlColor = (pnl) => {
    if (pnl > 0) return 'text-green-600 dark:text-green-400';
    if (pnl < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
};

// API Service
const apiService = {
    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`/api${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Request failed');
            }
            
            return await response.json();
        } catch (error) {
            console.error(`API Error (${endpoint}):`, error);
            throw error;
        }
    },

    async login(credentials) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    },

    async logout() {
        return this.request('/auth/logout', { method: 'POST' });
    },

    async getSessionStatus() {
        return this.request('/session/status');
    },

    async getHoldings() {
        return this.request('/holdings');
    },

    async getPortfolio() {
        return this.request('/portfolio');
    },

    async getGttOrders() {
        return this.request('/gtt/orders');
    },

    async createGttOrder(orderData) {
        return this.request('/gtt/create', {
            method: 'POST',
            body: JSON.stringify(orderData)
        });
    },

    async searchInstruments(symbol) {
        return this.request(`/search/instruments?symbol=${encodeURIComponent(symbol)}`);
    }
};

// Components
const LoadingSpinner = () => (
    <div className="flex justify-center items-center p-4">
        <div className="loading-spinner"></div>
        <span className="ml-2">Loading...</span>
    </div>
);

const ErrorMessage = ({ message, onRetry }) => (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
        <div className="flex items-center">
            <i className="fas fa-exclamation-triangle text-red-500 mr-2"></i>
            <span className="text-red-700 dark:text-red-400">{message}</span>
        </div>
        {onRetry && (
            <button 
                onClick={onRetry}
                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline"
            >
                Retry
            </button>
        )}
    </div>
);

const SuccessMessage = ({ message }) => (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
        <div className="flex items-center">
            <i className="fas fa-check-circle text-green-500 mr-2"></i>
            <span className="text-green-700 dark:text-green-400">{message}</span>
        </div>
    </div>
);

const StatCard = ({ title, value, subtitle, icon, color = 'blue' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 card-hover`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                {subtitle && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
                )}
            </div>
            <div className={`text-${color}-500 text-3xl`}>
                <i className={`fas fa-${icon}`}></i>
            </div>
        </div>
    </div>
);

const LoginForm = ({ onLogin, isLoading }) => {
    const [formData, setFormData] = useState({
        apiKey: '',
        clientCode: '',
        pin: '',
        totpSecret: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(formData);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                        <i className="fas fa-chart-line text-primary-600 dark:text-primary-400 text-xl"></i>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Angel One Trading Dashboard
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Secure login to your trading account
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="apiKey" className="sr-only">API Key</label>
                            <input
                                id="apiKey"
                                name="apiKey"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                placeholder="API Key"
                                value={formData.apiKey}
                                onChange={(e) => setFormData({...formData, apiKey: e.target.value})}
                            />
                        </div>
                        <div>
                            <label htmlFor="clientCode" className="sr-only">Client Code</label>
                            <input
                                id="clientCode"
                                name="clientCode"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                placeholder="Client Code"
                                value={formData.clientCode}
                                onChange={(e) => setFormData({...formData, clientCode: e.target.value})}
                            />
                        </div>
                        <div>
                            <label htmlFor="pin" className="sr-only">PIN</label>
                            <input
                                id="pin"
                                name="pin"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                placeholder="PIN"
                                value={formData.pin}
                                onChange={(e) => setFormData({...formData, pin: e.target.value})}
                            />
                        </div>
                        <div>
                            <label htmlFor="totpSecret" className="sr-only">TOTP Secret</label>
                            <input
                                id="totpSecret"
                                name="totpSecret"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-gray-700"
                                placeholder="TOTP Secret"
                                value={formData.totpSecret}
                                onChange={(e) => setFormData({...formData, totpSecret: e.target.value})}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <div className="loading-spinner mr-2"></div>
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt mr-2"></i>
                                    Login
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const Sidebar = ({ isOpen, onToggle, currentPage, onPageChange, onLogout, onThemeToggle, isDarkMode }) => (
    <>
        {/* Mobile overlay */}
        {isOpen && (
            <div 
                className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                onClick={onToggle}
            ></div>
        )}
        
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:inset-0`}>
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                    <i className="fas fa-chart-line text-primary-600 dark:text-primary-400 text-xl mr-2"></i>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Trading Dashboard</span>
                </div>
                <button
                    onClick={onToggle}
                    className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                    <i className="fas fa-times"></i>
                </button>
            </div>
            
            <nav className="mt-5 px-2">
                <div className="space-y-1">
                    {[
                        { id: 'dashboard', name: 'Dashboard', icon: 'tachometer-alt' },
                        { id: 'gtt', name: 'GTT Manager', icon: 'clock' },
                        { id: 'holdings', name: 'Holdings', icon: 'briefcase' },
                        { id: 'history', name: 'History', icon: 'history' },
                        { id: 'accounts', name: 'Accounts', icon: 'users' },
                        { id: 'settings', name: 'Settings', icon: 'cog' }
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onPageChange(item.id)}
                            className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentPage === item.id
                                    ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                            <i className={`fas fa-${item.icon} mr-3 w-5 text-center`}></i>
                            {item.name}
                        </button>
                    ))}
                </div>
                
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onThemeToggle}
                        className="w-full flex items-center px-2 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md transition-colors"
                    >
                        <i className={`fas fa-${isDarkMode ? 'sun' : 'moon'} mr-3 w-5 text-center`}></i>
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center px-2 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors mt-2"
                    >
                        <i className="fas fa-sign-out-alt mr-3 w-5 text-center"></i>
                        Logout
                    </button>
                </div>
            </nav>
        </div>
    </>
);

const Dashboard = ({ portfolioData, holdingsData, isLoading, error }) => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    const totalInvestment = holdingsData?.data?.net || 0;
    const currentValue = portfolioData?.data?.net || 0;
    const totalPnl = currentValue - totalInvestment;
    const todayPnl = portfolioData?.data?.dayPnl || 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Current Value"
                    value={formatCurrency(currentValue)}
                    icon="wallet"
                    color="blue"
                />
                <StatCard
                    title="Total Investment"
                    value={formatCurrency(totalInvestment)}
                    icon="piggy-bank"
                    color="green"
                />
                <StatCard
                    title="Total P&L"
                    value={formatCurrency(totalPnl)}
                    subtitle={`${((totalPnl / totalInvestment) * 100).toFixed(2)}%`}
                    icon="chart-line"
                    color={totalPnl >= 0 ? "green" : "red"}
                />
                <StatCard
                    title="Today's P&L"
                    value={formatCurrency(todayPnl)}
                    icon="calendar-day"
                    color={todayPnl >= 0 ? "green" : "red"}
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Recent Holdings</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P&L</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {holdingsData?.data?.holdings?.slice(0, 5).map((holding, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {holding.tradingSymbol}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatNumber(holding.quantity)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(holding.averagePrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(holding.currentValue)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPnlColor(holding.pnl)}`}>
                                        {formatCurrency(holding.pnl)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const GttManager = ({ gttOrders, onCreateGtt, isLoading, error }) => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState({
        symbol: '',
        exchange: 'NSE',
        quantity: '',
        triggerPrice: '',
        limitPrice: '',
        orderType: 'BUY'
    });

    const handleCreateGtt = async (e) => {
        e.preventDefault();
        try {
            await onCreateGtt(createForm);
            setShowCreateModal(false);
            setCreateForm({
                symbol: '',
                exchange: 'NSE',
                quantity: '',
                triggerPrice: '',
                limitPrice: '',
                orderType: 'BUY'
            });
        } catch (error) {
            console.error('Failed to create GTT:', error);
        }
    };

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">GTT Orders</h2>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
                >
                    <i className="fas fa-plus mr-2"></i>
                    Create New GTT
                </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Trigger Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Limit Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {gttOrders?.data?.gttOrders?.map((order, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {order.symbol}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            order.orderType === 'BUY' 
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                        }`}>
                                            {order.orderType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatNumber(order.quantity)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(order.triggerPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(order.limitPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create GTT Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Create New GTT Order</h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateGtt} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Symbol
                                </label>
                                <input
                                    type="text"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={createForm.symbol}
                                    onChange={(e) => setCreateForm({...createForm, symbol: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Exchange
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={createForm.exchange}
                                    onChange={(e) => setCreateForm({...createForm, exchange: e.target.value})}
                                >
                                    <option value="NSE">NSE</option>
                                    <option value="BSE">BSE</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Order Type
                                </label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={createForm.orderType}
                                    onChange={(e) => setCreateForm({...createForm, orderType: e.target.value})}
                                >
                                    <option value="BUY">BUY</option>
                                    <option value="SELL">SELL</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Quantity
                                </label>
                                <input
                                    type="number"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={createForm.quantity}
                                    onChange={(e) => setCreateForm({...createForm, quantity: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Trigger Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={createForm.triggerPrice}
                                    onChange={(e) => setCreateForm({...createForm, triggerPrice: e.target.value})}
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Limit Price
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                                    value={createForm.limitPrice}
                                    onChange={(e) => setCreateForm({...createForm, limitPrice: e.target.value})}
                                />
                            </div>
                            
                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
                                >
                                    Create GTT
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const Holdings = ({ holdingsData, isLoading, error }) => {
    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Holdings</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Symbol</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Avg Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Price</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Current Value</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P&L</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">P&L %</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {holdingsData?.data?.holdings?.map((holding, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {holding.tradingSymbol}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatNumber(holding.quantity)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(holding.averagePrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(holding.currentPrice)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(holding.currentValue)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPnlColor(holding.pnl)}`}>
                                        {formatCurrency(holding.pnl)}
                                    </td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getPnlColor(holding.pnlPercentage)}`}>
                                        {holding.pnlPercentage?.toFixed(2)}%
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const History = () => {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Trading History</h2>
                <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Date:
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                    />
                </div>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <i className="fas fa-history text-4xl mb-4"></i>
                    <p>Historical data for {selectedDate}</p>
                    <p className="text-sm mt-2">This feature will show GTT activity and portfolio snapshots for the selected date.</p>
                </div>
            </div>
        </div>
    );
};

const Accounts = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Management</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <i className="fas fa-users text-4xl mb-4"></i>
                    <p>Multi-user and multi-account management</p>
                    <p className="text-sm mt-2">This feature will allow you to manage multiple user profiles and Angel One account configurations.</p>
                </div>
            </div>
        </div>
    );
};

const Settings = () => {
    const [watchlist, setWatchlist] = useState([]);
    const [newSymbol, setNewSymbol] = useState('');
    const [newExchange, setNewExchange] = useState('NSE');

    const defaultWatchlist = [
        { symbol: 'RELIANCE', exchange: 'NSE' },
        { symbol: 'TCS', exchange: 'NSE' },
        { symbol: 'HDFCBANK', exchange: 'NSE' },
        { symbol: 'INFY', exchange: 'NSE' },
        { symbol: 'ICICIBANK', exchange: 'NSE' },
        { symbol: 'HINDUNILVR', exchange: 'NSE' },
        { symbol: 'ITC', exchange: 'NSE' },
        { symbol: 'SBIN', exchange: 'NSE' },
        { symbol: 'BHARTIARTL', exchange: 'NSE' },
        { symbol: 'AXISBANK', exchange: 'NSE' },
        { symbol: 'ASIANPAINT', exchange: 'NSE' },
        { symbol: 'MARUTI', exchange: 'NSE' }
    ];

    const addToWatchlist = () => {
        if (newSymbol.trim()) {
            setWatchlist([...watchlist, { symbol: newSymbol.trim().toUpperCase(), exchange: newExchange }]);
            setNewSymbol('');
        }
    };

    const removeFromWatchlist = (index) => {
        setWatchlist(watchlist.filter((_, i) => i !== index));
    };

    const loadDefaultWatchlist = () => {
        setWatchlist(defaultWatchlist);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personalized Watchlist</h3>
                
                <div className="space-y-4">
                    <div className="flex space-x-4">
                        <input
                            type="text"
                            placeholder="Enter stock symbol"
                            value={newSymbol}
                            onChange={(e) => setNewSymbol(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        />
                        <select
                            value={newExchange}
                            onChange={(e) => setNewExchange(e.target.value)}
                            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:text-white"
                        >
                            <option value="NSE">NSE</option>
                            <option value="BSE">BSE</option>
                        </select>
                        <button
                            onClick={addToWatchlist}
                            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                            Add
                        </button>
                    </div>
                    
                    <button
                        onClick={loadDefaultWatchlist}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                    >
                        Load Default Watchlist
                    </button>
                    
                    <div className="space-y-2">
                        {watchlist.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                                <span className="text-gray-900 dark:text-white">
                                    {item.symbol} ({item.exchange})
                                </span>
                                <button
                                    onClick={() => removeFromWatchlist(index)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main App Component
const App = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    
    // Data states
    const [portfolioData, setPortfolioData] = useState(null);
    const [holdingsData, setHoldingsData] = useState(null);
    const [gttOrders, setGttOrders] = useState(null);

    // Check session status on mount
    useEffect(() => {
        checkSessionStatus();
    }, []);

    // Apply dark mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const checkSessionStatus = async () => {
        try {
            const status = await apiService.getSessionStatus();
            setIsLoggedIn(status.isActive);
        } catch (error) {
            console.error('Session check failed:', error);
        }
    };

    const handleLogin = async (credentials) => {
        setIsLoading(true);
        setError(null);
        
        try {
            await apiService.login(credentials);
            setIsLoggedIn(true);
            setSuccess('Login successful!');
            setTimeout(() => setSuccess(null), 3000);
        } catch (error) {
            setError(error.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await apiService.logout();
            setIsLoggedIn(false);
            setCurrentPage('dashboard');
            setPortfolioData(null);
            setHoldingsData(null);
            setGttOrders(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const loadDashboardData = useCallback(async () => {
        if (!isLoggedIn) return;
        
        setIsLoading(true);
        setError(null);
        
        try {
            const [portfolio, holdings, gtt] = await Promise.all([
                apiService.getPortfolio(),
                apiService.getHoldings(),
                apiService.getGttOrders()
            ]);
            
            setPortfolioData(portfolio);
            setHoldingsData(holdings);
            setGttOrders(gtt);
        } catch (error) {
            setError(error.message || 'Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn && currentPage === 'dashboard') {
            loadDashboardData();
        }
    }, [isLoggedIn, currentPage, loadDashboardData]);

    const handleCreateGtt = async (orderData) => {
        try {
            await apiService.createGttOrder(orderData);
            setSuccess('GTT order created successfully!');
            setTimeout(() => setSuccess(null), 3000);
            // Reload GTT orders
            const updatedGtt = await apiService.getGttOrders();
            setGttOrders(updatedGtt);
        } catch (error) {
            setError(error.message || 'Failed to create GTT order');
        }
    };

    const handleThemeToggle = () => {
        setIsDarkMode(!isDarkMode);
    };

    if (!isLoggedIn) {
        return <LoginForm onLogin={handleLogin} isLoading={isLoading} />;
    }

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
            <Sidebar
                isOpen={sidebarOpen}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
                onLogout={handleLogout}
                onThemeToggle={handleThemeToggle}
                isDarkMode={isDarkMode}
            />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile header */}
                <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <i className="fas fa-bars"></i>
                        </button>
                        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Trading Dashboard</h1>
                        <div className="w-8"></div>
                    </div>
                </div>
                
                {/* Main content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
                    {success && <SuccessMessage message={success} />}
                    
                    {currentPage === 'dashboard' && (
                        <Dashboard
                            portfolioData={portfolioData}
                            holdingsData={holdingsData}
                            isLoading={isLoading}
                            error={error}
                        />
                    )}
                    
                    {currentPage === 'gtt' && (
                        <GttManager
                            gttOrders={gttOrders}
                            onCreateGtt={handleCreateGtt}
                            isLoading={isLoading}
                            error={error}
                        />
                    )}
                    
                    {currentPage === 'holdings' && (
                        <Holdings
                            holdingsData={holdingsData}
                            isLoading={isLoading}
                            error={error}
                        />
                    )}
                    
                    {currentPage === 'history' && <History />}
                    {currentPage === 'accounts' && <Accounts />}
                    {currentPage === 'settings' && <Settings />}
                </main>
            </div>
        </div>
    );
};

// Render the app
ReactDOM.render(<App />, document.getElementById('root'));