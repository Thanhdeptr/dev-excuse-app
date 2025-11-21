// Scroll Animation with Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
    initializeScrollAnimation();
    initializeExcuseLoading();
});

/**
 * Initialize scroll animation for comic panels
 */
function initializeScrollAnimation() {
    const observerOptions = {
        threshold: 0.2,  // Trigger when 20% of panel is visible
        rootMargin: '0px 0px -50px 0px'  // Trigger slightly before panel enters viewport
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Load excuse when panel 4 (excuse panel) becomes visible
                if (entry.target.dataset.panel === '4') {
                    loadExcuse();
                }
            }
        });
    }, observerOptions);

    // Observe all comic panels
    const panels = document.querySelectorAll('.comic-panel');
    panels.forEach(panel => {
        observer.observe(panel);
    });

    // Show first panel immediately
    if (panels.length > 0) {
        panels[0].classList.add('visible');
    }
}

/**
 * Initialize excuse loading
 */
function initializeExcuseLoading() {
    // Load excuse on page load (will be displayed when panel 4 is visible)
    // This ensures excuse is ready when user scrolls to it
    loadExcuse();
}

/**
 * Load and display random excuse
 */
async function loadExcuse() {
    const excuseOverlay = document.getElementById('excuse-text-overlay');
    const bubbleContent = excuseOverlay ? excuseOverlay.querySelector('.bubble-content') : null;
    
    // Show loading state
    if (bubbleContent) {
        bubbleContent.innerHTML = '<div class="loading-text">Đang tải excuse...</div>';
    }
    
    try {
        // Get random excuse from API
        const excuse = await getRandomExcuse();
        
        // Display excuse with animation
        if (bubbleContent) {
            bubbleContent.innerHTML = excuse;
            
            // Add fade-in animation
            bubbleContent.style.opacity = '0';
            setTimeout(() => {
                bubbleContent.style.transition = 'opacity 0.5s ease-in';
                bubbleContent.style.opacity = '1';
            }, 100);
        }
    } catch (error) {
        console.error('Error loading excuse:', error);
        if (bubbleContent) {
            bubbleContent.innerHTML = 'Oops! Không thể tải excuse. Vui lòng thử lại.';
        }
    }
}

/**
 * Reload excuse (for refresh button or manual reload)
 */
function reloadExcuse() {
    loadExcuse();
}

// Add keyboard shortcut: Press 'R' to reload excuse
document.addEventListener('keydown', (event) => {
    if (event.key === 'r' || event.key === 'R') {
        // Check if we're not in an input field
        if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
            reloadExcuse();
        }
    }
});

// Add click handler to excuse overlay to reload
document.addEventListener('DOMContentLoaded', () => {
    const excuseOverlay = document.getElementById('excuse-text-overlay');
    if (excuseOverlay) {
        excuseOverlay.addEventListener('click', () => {
            reloadExcuse();
        });
        excuseOverlay.style.cursor = 'pointer';
        excuseOverlay.title = 'Click để tải excuse mới (hoặc nhấn R)';
    }
});

