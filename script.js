// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    initializeSearch();
    setActiveContent('welcome');
});

/**
 * Initialize event listeners for navigation buttons
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
        });
    });
}

/**
 * Update active button styling and ARIA attributes
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

/**
 * Initialize search functionality
 */
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    
    if (!searchInput) return;
    
    searchBtn.addEventListener('click', performSearch);
    
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
 * Perform search across all content
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
}

/**
 * Live search as user types
 */
function performLiveSearch(query) {
    const results = searchContent(query);
    displaySearchResultsLive(results, query);
}

/**
 * Search content sections
 */
function searchContent(query) {
    const contentSections = document.querySelectorAll('.topic-content');
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    contentSections.forEach(section => {
        const text = section.textContent.toLowerCase();
        const title = section.querySelector('h2')?.textContent || 'No title';
        
        if (text.includes(lowerQuery)) {
            // Calculate relevance score
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
    
    // Sort by relevance
    return results.sort((a, b) => b.relevance - a.relevance);
}

/**
 * Get preview text around search term
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
 * Display search results
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
 * Display live search results dropdown
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

/**
 * Set the active content section and hide others
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

/**
 * Helper function to get election information
 */
function getElectionInfo() {
    return {
        currentYear: 2024,
        electionType: 'Presidential Election',
        electionDate: 'November 5, 2024',
        registrationDeadline: 'Typically 15-30 days before Election Day',
        earlyVotingStart: 'October 22, 2024',
        earlyVotingEnd: 'November 4, 2024'
    };
}

/**
 * Track page view (for analytics)
 */
function trackPageView(topic) {
    console.log('User viewed topic:', topic);
}

// Keyboard navigation support
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

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Skip to main content functionality
const skipLink = document.createElement('a');
skipLink.href = '#welcome';
skipLink.className = 'skip-link';
skipLink.textContent = 'Skip to main content';
skipLink.setAttribute('role', 'navigation');
document.body.insertBefore(skipLink, document.body.firstChild);
