/**
 * Election Education Assistant - Main Application Script
 * 
 * Features:
 * - Interactive topic navigation
 * - Live search functionality with relevance ranking
 * - Keyboard navigation and accessibility
 * - Analytics tracking
 * - Performance monitoring
 * 
 * @author Election Education Team
 * @version 2.0.0
 * @license MIT
 */

'use strict';

// ============= INITIALIZATION =============

/**
 * Initialize the application on DOM ready
 * Sets up event listeners and displays welcome content
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeSearch();
    setActiveContent('welcome');
    trackPageEvent('page_load', { page: 'Election Education Assistant' });
});

// ============= EVENT LISTENERS =============

/**
 * Initialize event listeners for navigation buttons
 * Adds click handlers to all navigation buttons
 */
function initializeEventListeners() {
    const navButtons = document.querySelectorAll('.nav-btn');
    
    navButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const topic = this.getAttribute('data-topic');
            setActiveContent(topic);
            updateActiveButton(this);
            document.querySelector('.content').scrollTop = 0;
            trackPageEvent('topic_navigation', { topic });
        });
    });
}

/**
 * Update active button styling and ARIA attributes
 * Ensures proper accessibility and visual feedback
 * 
 * @param {HTMLElement} button - The button that was clicked
 */
function updateActiveButton(button) {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    button.classList.add('active');
    button.setAttribute('aria-selected', 'true');
}

// ============= SEARCH FUNCTIONALITY =============

/**
 * Initialize search box and event handlers
 * Sets up live search and keyboard shortcuts
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    searchBtn.addEventListener('click', performSearch);
    
    /**
     * Handle search input events
     * Provides real-time search results as user types
     */
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        } else if (this.value.length > 0) {
            performLiveSearch(this.value);
        } else {
            searchResults.innerHTML = '';
        }
    });
    
    searchInput.addEventListener('input', function() {
        if (this.value.length === 0) {
            searchResults.innerHTML = '';
        }
    });
}

/**
 * Execute search when button is clicked or Enter is pressed
 * Displays results in a modal-like format
 */
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim();
    
    if (query.length === 0) {
        alert('Please enter a search term');
        return;
    }
    
    const results = searchContent(query);
    displaySearchResults(results, query);
    trackPageEvent('search', { search_term: query, results_found: results.length });
}

/**
 * Perform live search as user types
 * Shows dropdown with matching topics
 * 
 * @param {string} query - The search term
 */
function performLiveSearch(query) {
    const results = searchContent(query);
    displaySearchResultsLive(results, query);
}

/**
 * Search content sections for matching text
 * Returns results sorted by relevance
 * 
 * @param {string} query - The search term
 * @returns {Array} Array of matching content with relevance scores
 */
function searchContent(query) {
    const contentSections = document.querySelectorAll('.topic-content');
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    contentSections.forEach(section => {
        const text = section.textContent.toLowerCase();
        const title = section.querySelector('h2')?.textContent || 'No title';
        
        if (text.includes(lowerQuery)) {
            // Calculate relevance score (higher = more relevant)
            const titleMatch = title.toLowerCase().includes(lowerQuery);
            const headingMatches = (text.match(new RegExp(lowerQuery, 'g')) || []).length;
            
            results.push({
                id: section.id,
                title: title,
                relevance: (titleMatch ? 10 : 0) + headingMatches,
                preview: getPreview(text, lowerQuery, 100)
            });
        }
    });
    
    // Sort by relevance (descending)
    return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Generate preview text around search term
 * Provides context for search results
 * 
 * @param {string} text - The full text to extract from
 * @param {string} query - The search term
 * @param {number} length - Preview length
 * @returns {string} Preview text with ellipsis
 */
function getPreview(text, query, length) {
    const index = text.indexOf(query);
    if (index === -1) return text.substring(0, length) + '...';
    
    const start = Math.max(0, index - length / 2);
    const end = Math.min(text.length, start + length);
    const preview = text.substring(start, end);
    
    return (start > 0 ? '...' : '') + preview + (end < text.length ? '...' : '');
}

/**
 * Display search results in modal format
 * 
 * @param {Array} results - Array of search results
 * @param {string} query - The search term that was used
 */
function displaySearchResults(results, query) {
    if (results.length === 0) {
        alert(`No results found for "${query}"`);
        return;
    }
    
    const message = `Found ${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`;
    alert(message);
    
    if (results.length > 0) {
        const firstResult = results[0];
        const button = document.querySelector(`[data-topic="${firstResult.id}"]`);
        if (button) {
            button.click();
        }
    }
}

/**
 * Display live search results in dropdown
 * Shows top 5 results with previews
 * 
 * @param {Array} results - Array of search results
 * @param {string} query - The search term
 */
function displaySearchResultsLive(results, query) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">No results found</div>';
        return;
    }
    
    const html = results.slice(0, 5).map(result => `
        <div class="search-result-item" data-topic="${result.id}">
            <strong>${result.title}</strong>
            <div style="font-size: 0.8rem; color: #666; margin-top: 3px;">${result.preview}</div>
        </div>
    `).join('');
    
    searchResults.innerHTML = html;
    
    // Add click handlers to results
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', function() {
            const topic = this.getAttribute('data-topic');
            const button = document.querySelector(`[data-topic="${topic}"]`);
            if (button) {
                button.click();
                document.getElementById('searchInput').value = '';
                searchResults.innerHTML = '';
            }
        });
    });
}

// ============= CONTENT MANAGEMENT =============

/**
 * Set the active content section and hide others
 * Updates aria-hidden attributes for accessibility
 * 
 * @param {string} topicId - The ID of the topic to show
 */
function setActiveContent(topicId) {
    const contentSections = document.querySelectorAll('.topic-content');
    contentSections.forEach(section => {
        section.classList.remove('active');
        section.setAttribute('aria-hidden', 'true');
    });
    
    const selectedSection = document.getElementById(topicId);
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.setAttribute('aria-hidden', 'false');
    }
}

// ============= UTILITY FUNCTIONS =============

/**
 * Get election information
 * Returns key dates and election metadata
 * 
 * @returns {Object} Election information
 */
function getElectionInfo() {
    return {
        currentYear: 2026,
        electionType: 'Presidential Election',
        electionDate: 'November 3, 2026',
        registrationDeadline: 'Typically 15-30 days before Election Day',
        earlyVotingStart: 'October 19, 2026',
        earlyVotingEnd: 'November 2, 2026'
    };
}

/**
 * Track page events for analytics
 * Integrates with Google Analytics
 * 
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Additional event data
 */
function trackPageEvent(eventName, eventData = {}) {
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    console.log('📊 Event tracked:', eventName, eventData);
}

// ============= KEYBOARD NAVIGATION =============

/**
 * Handle keyboard shortcuts
 * Alt+S: Focus search box
 * Escape: Clear search
 */
document.addEventListener('keydown', function(event) {
    // Alt + S to focus search
    if (event.altKey && event.key === 's') {
        event.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
    
    // Escape to clear search
    if (event.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        const searchResults = document.getElementById('searchResults');
        if (searchInput && searchResults) {
            searchInput.value = '';
            searchResults.innerHTML = '';
        }
    }
});

// ============= SMOOTH SCROLLING =============

/**
 * Enable smooth scrolling for anchor links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ============= ACCESSIBILITY =============

/**
 * Create and insert skip-to-main-content link
 * Improves accessibility for keyboard users
 */
const skipLink = document.createElement('a');
skipLink.href = '#welcome';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
skipLink.setAttribute('role', 'navigation');
if (document.body) {
    document.body.insertBefore(skipLink, document.body.firstChild);
}

