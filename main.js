// Mobile Navigation
const burger = document.querySelector('.burger');
const nav = document.querySelector('.nav-links');

burger.addEventListener('click', () => {
    nav.classList.toggle('active');
    burger.classList.toggle('toggle');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        burger.classList.remove('toggle');
    });
});

// Simulate loading market data
document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    if (document.querySelector('.data-section')) {
        // Simulate API call with timeout
        setTimeout(() => {
            document.getElementById('stock-data').innerHTML = `
                <p><strong>S&P 500:</strong> 4,500.67 (+1.2%)</p>
                <p><strong>NASDAQ:</strong> 15,000.45 (+0.8%)</p>
                <p><strong>DOW:</strong> 34,500.12 (+1.5%)</p>
            `;
            
            document.getElementById('crypto-data').innerHTML = `
                <p><strong>BTC:</strong> $42,500 (+3.2%)</p>
                <p><strong>ETH:</strong> $2,800 (+5.1%)</p>
                <p><strong>SOL:</strong> $150 (+7.8%)</p>
            `;
            
            document.getElementById('forex-data').innerHTML = `
                <p><strong>EUR/USD:</strong> 1.0850 (+0.3%)</p>
                <p><strong>GBP/USD:</strong> 1.2650 (-0.2%)</p>
                <p><strong>USD/JPY:</strong> 150.25 (+0.5%)</p>
            `;
        }, 1500);
    }
    
    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input').value;
            alert(`Thank you for subscribing with ${email}! You'll receive our next newsletter.`);
            this.reset();
        });
    }
    
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            alert(`Thank you, ${name}! Your message has been sent. We'll get back to you soon.`);
            this.reset();
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Animate burger icon
burger.addEventListener('click', function() {
    this.classList.toggle('toggle');
});

// API Keys (in a real project, store these securely)
const ALPHA_VANTAGE_API_KEY = 'YOUR_ALPHA_VANTAGE_KEY'; // Get from https://www.alphavantage.co/
const COIN_GECKO_API_URL = 'https://api.coingecko.com/api/v3';

// Initialize Charts
let stockChart, cryptoChart;

document.addEventListener('DOMContentLoaded', function() {
    // Load Chart.js from CDN dynamically
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
    script.onload = initApp;
    document.head.appendChild(script);
});

function initApp() {
    setupMobileNav();
    setupForms();
    fetchMarketData();
}

function fetchMarketData() {
    fetchStockData();
    fetchCryptoData();
}

// Stock Data with Alpha Vantage
async function fetchStockData() {
    try {
        // Show loading state
        document.getElementById('stock-data').innerHTML = 'Loading real-time data...';
        
        // Fetch daily data for IBM (example)
        const response = await fetch(
            `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=IBM&apikey=${ALPHA_VANTAGE_API_KEY}`
        );
        const data = await response.json();
        
        // Process data
        const timeSeries = data['Time Series (Daily)'];
        const dates = Object.keys(timeSeries).slice(0, 30).reverse();
        const prices = dates.map(date => parseFloat(timeSeries[date]['4. close']));
        
        // Update UI
        document.getElementById('stock-data').innerHTML = `
            <p><strong>IBM:</strong> $${prices[prices.length-1].toFixed(2)}</p>
            <p><strong>Change:</strong> ${((prices[prices.length-1] - prices[0]) / prices[0] * 100).toFixed(2)}%</p>
        `;
        
        // Create chart
        createStockChart(dates, prices);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        document.getElementById('stock-data').innerHTML = 'Failed to load stock data';
    }
}

// Crypto Data with CoinGecko
async function fetchCryptoData() {
    try {
        document.getElementById('crypto-data').innerHTML = 'Loading real-time data...';
        
        // Fetch Bitcoin data
        const response = await fetch(
            `${COIN_GECKO_API_URL}/coins/bitcoin/market_chart?vs_currency=usd&days=30`
        );
        const data = await response.json();
        
        // Process data
        const prices = data.prices.map(item => item[1]);
        const dates = data.prices.map(item => 
            new Date(item[0]).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        );
        
        // Update UI
        document.getElementById('crypto-data').innerHTML = `
            <p><strong>Bitcoin:</strong> $${prices[prices.length-1].toLocaleString()}</p>
            <p><strong>Change:</strong> ${((prices[prices.length-1] - prices[0]) / prices[0] * 100).toFixed(2)}%</p>
        `;
        
        // Create chart
        createCryptoChart(dates, prices);
    } catch (error) {
        console.error('Error fetching crypto data:', error);
        document.getElementById('crypto-data').innerHTML = 'Failed to load crypto data';
    }
}

// Chart Creation Functions
function createStockChart(dates, prices) {
    const ctx = document.getElementById('stockChart').getContext('2d');
    
    if (stockChart) stockChart.destroy();
    
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Stock Price (USD)',
                data: prices,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });
}

function createCryptoChart(dates, prices) {
    const ctx = document.getElementById('cryptoChart').getContext('2d');
    
    if (cryptoChart) cryptoChart.destroy();
    
    cryptoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Bitcoin Price (USD)',
                data: prices,
                borderColor: '#f1c40f',
                backgroundColor: 'rgba(241, 196, 15, 0.1)',
                borderWidth: 2,
                tension: 0.1,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            return '$' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toLocaleString();
                        }
                    }
                }
            }
        }
    });
}

// Keep your existing setupMobileNav() and setupForms() functions