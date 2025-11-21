// API Configuration
const API_CONFIG = {
    // Production API URL
    baseURL: 'http://44.197.205.147:3000',
    
    // Fallback excuses if API fails
    fallbackExcuses: [
        "It works on my machine.",
        "That's weird, I've never seen that before.",
        "It must be a caching issue.",
        "It's a hardware problem.",
        "That's already fixed in the next release.",
        "Did you clear your cache?",
        "It's not a bug, it's an undocumented feature."
    ]
};

/**
 * Fetch all excuses from API
 * @returns {Promise<Array>} Array of excuses
 */
async function fetchExcuses() {
    try {
        const response = await fetch(`${API_CONFIG.baseURL}/api/excuses`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // API returns array directly, not wrapped in {excuses: [...]}
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error('Error fetching excuses:', error);
        // Return fallback excuses if API fails
        return API_CONFIG.fallbackExcuses.map((text, index) => ({
            id: index + 1,
            text: text,
            created_at: new Date().toISOString()
        }));
    }
}

/**
 * Get a random excuse
 * @returns {Promise<string>} Random excuse text
 */
async function getRandomExcuse() {
    try {
        const excuses = await fetchExcuses();
        
        if (excuses.length === 0) {
            return "No excuses available.";
        }
        
        const randomIndex = Math.floor(Math.random() * excuses.length);
        return excuses[randomIndex].text;
    } catch (error) {
        console.error('Error getting random excuse:', error);
        // Return random fallback excuse
        const randomIndex = Math.floor(Math.random() * API_CONFIG.fallbackExcuses.length);
        return API_CONFIG.fallbackExcuses[randomIndex];
    }
}

/**
 * Display excuse in the speech bubble
 * @param {string} excuse - Excuse text to display
 */
function displayExcuse(excuse) {
    const excuseBubble = document.getElementById('excuse-bubble');
    const bubbleContent = excuseBubble.querySelector('.bubble-content');
    
    if (bubbleContent) {
        bubbleContent.innerHTML = excuse;
    }
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { fetchExcuses, getRandomExcuse, displayExcuse };
}


