// Home page functionality

function showComingSoon(featureName) {
    alert(`🚧 ${featureName} is coming soon!\n\nThis feature is currently under development and will be available in a future update.\n\nFor now, you can use:\n• Campus Announcements\n• Hostel Complaint Registration`);
}

// Update navigation active state based on current page
function updateNavigationState() {
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'home.html')) {
            link.classList.add('active');
        }
    });
}

// Load statistics from localStorage
function loadSystemStats() {
    try {
        // Load announcements count
        const announcements = JSON.parse(localStorage.getItem('announcements') || '[]');
        const announcementsCount = announcements.length;
        
        // Load complaints count
        const complaints = JSON.parse(localStorage.getItem('hostelComplaints') || '[]');
        const complaintsCount = complaints.length;
        
        // Update status indicators based on available data
        updateSystemStatus('announcements', announcementsCount > 0);
        updateSystemStatus('complaints', true); // Always available
        
        console.log(`Loaded stats: ${announcementsCount} announcements, ${complaintsCount} complaints`);
    } catch (error) {
        console.error('Error loading system stats:', error);
    }
}

function updateSystemStatus(system, isOnline) {
    const statusItems = document.querySelectorAll('.status-item');
    statusItems.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(system)) {
            const indicator = item.querySelector('.status-indicator');
            if (indicator) {
                indicator.className = `status-indicator ${isOnline ? 'online' : 'offline'}`;
            }
        }
    });
}

// Add smooth scrolling for anchor links
function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add fade-in animation to service cards
function animateServiceCards() {
    const cards = document.querySelectorAll('.service-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// Show welcome message for first-time visitors
function showWelcomeMessage() {
    const hasVisited = localStorage.getItem('hasVisitedCampusPortal');
    if (!hasVisited) {
        setTimeout(() => {
            const message = `🎉 Welcome to Campus Portal!\n\nThis is your central hub for campus services:\n\n📢 Campus Announcements - Stay updated with latest news\n🏠 Hostel Complaints - Report and track maintenance issues\n\nMore features coming soon!`;
            alert(message);
            localStorage.setItem('hasVisitedCampusPortal', 'true');
        }, 1000);
    }
}

// Initialize page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Update navigation state
    updateNavigationState();
    
    // Load system statistics
    loadSystemStats();
    
    // Add smooth scrolling
    addSmoothScrolling();
    
    // Animate service cards
    animateServiceCards();
    
    // Show welcome message for new users
    showWelcomeMessage();
    
    // Add click handlers for service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.addEventListener('click', function() {
            const onclick = this.getAttribute('onclick');
            if (onclick) {
                eval(onclick);
            }
        });
    });
    
    console.log('Home page initialized successfully');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        // Refresh stats when page becomes visible
        loadSystemStats();
    }
});

// Export functions for global use
window.showComingSoon = showComingSoon;
window.redirectTo = function(page) {
    window.location.href = page;
};