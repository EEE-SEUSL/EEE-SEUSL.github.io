// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const repoContainer = document.getElementById('repo-container');

// Language colors for GitHub repositories
const languageColors = {
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Python: "#3572A5",
    Java: "#b07219",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#178600",
    HTML: "#e34c26",
    CSS: "#563d7c",
    PHP: "#4F5D95",
    Ruby: "#701516",
    Go: "#00ADD8",
    Swift: "#ffac45",
    Kotlin: "#A97BFF",
    Rust: "#dea584",
    Dart: "#00B4AB",
    Shell: "#89e051",
    // Add more languages as needed
};

// Theme Toggle
function initTheme() {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-theme');
    }
}

function toggleTheme() {
    if (document.body.classList.contains('dark-theme')) {
        document.body.classList.remove('dark-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.body.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    mobileMenu.classList.toggle('active');
}

// Close mobile menu when a link is clicked
function closeMobileMenu() {
    mobileMenu.classList.remove('active');
}

// Format date to "MMM D, YYYY" format
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}


// Create repository card
async function fetchRepositories() {
    try {
        const response = await fetch('repos.json'); // Fetch data from the local JSON file
        if (!response.ok) {
            throw new Error('Failed to fetch repositories');
        }

        const repos = await response.json();
        repoContainer.innerHTML = ''; // Clear loading skeletons

        // Process and display repository data
        for (const repo of repos) {
            const languages = await fetchRepoLanguages(repo.languages_url);
            const card = createRepoCard(repo, languages);
            repoContainer.appendChild(card);
        }
    } catch (error) {
        console.error('Error fetching repositories:', error);
        repoContainer.innerHTML = `<div class="error-message"><p>Failed to load repositories. Please try again later.</p></div>`;
    }
}

// Fetch languages from GitHub API
async function fetchRepoLanguages(languagesUrl) {
    try {
        const response = await fetch(languagesUrl);
        if (!response.ok) return null;
        const data = await response.json();
        return Object.keys(data); // Returns an array of detected languages
    } catch (error) {
        console.error("Error fetching languages:", error);
        return null;
    }
}

// Create repository card with language fix
function createRepoCard(repo, languages) {
    const card = document.createElement('a');
    card.href = repo.html_url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    card.className = 'repo-card';

    // Choose the first language if multiple exist
    const repoLanguage = languages && languages.length ? languages[0] : "Unknown";
    const languageColor = languageColors[repoLanguage] || '#858585';

    card.innerHTML = `
        <div class="repo-card-header">
            <h3 class="repo-name">${repo.name}</h3>
        </div>
        <div class="repo-card-body">
            <p class="repo-description">${repo.description || 'No description provided'}</p>
        </div>
        <div class="repo-card-footer">
            <div class="repo-language">
                <span class="language-color" style="background-color: ${languageColor}"></span>
                <span>${repoLanguage}</span>
            </div>
            <div class="repo-stats">
                <div class="repo-stat">
                    <i class="far fa-star"></i>
                    <span>${repo.stargazers_count}</span>
                </div>
                <div class="repo-stat">
                    <i class="fas fa-code-branch"></i>
                    <span>${repo.forks_count}</span>
                </div>
                <div class="repo-stat">
                    <i class="fas fa-exclamation-circle"></i>
                    <span>${repo.open_issues_count}</span>
                </div>
                <div class="repo-stat">
                    <span>Updated ${formatDate(repo.updated_at)}</span>
                </div>
            </div>
        </div>
    `;

    return card;
}


// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize theme
    initTheme();
    
    // Theme toggle
    themeToggle.addEventListener('click', toggleTheme);
    
    // Mobile menu toggle
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    
    // Close mobile menu when a link is clicked
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Fetch repositories
    fetchRepositories();
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                document.body.classList.add('dark-theme');
            } else {
                document.body.classList.remove('dark-theme');
            }
        }
    });
});


// Fetch and display discussions
async function fetchDiscussions() {
    try {
        const response = await fetch('discussions.json'); // Fetch data from the local JSON file
        if (!response.ok) {
            throw new Error('Failed to fetch discussions');
        }

        const discussions = await response.json();
        const discussionsContainer = document.getElementById('discussions-container');
        if (discussionsContainer) {
            discussionsContainer.innerHTML = discussions.map(discussion => `
                <div class="discussion-card">
                    <h3 class="discussion-title">
                        <a href="${discussion.html_url}" target="_blank" rel="noopener noreferrer">
                            ${discussion.title}
                        </a>
                    </h3>
                    <div class="discussion-body">
                        ${marked.parse(truncateContent(discussion.body || 'No content provided.'))}
                        ${discussion.body.length > 200 ? `
                            <button class="read-more" onclick="toggleReadMore(this)">Read More</button>
                            <div class="full-content" style="display: none;">
                                ${marked.parse(discussion.body)}
                            </div>
                        ` : ''}
                    </div>
                    <div class="discussion-meta">
                        <span class="discussion-author">
                            <i class="fas fa-user"></i> ${discussion.user.login}
                        </span>
                        <span class="discussion-date">
                            <i class="fas fa-calendar-alt"></i> ${new Date(discussion.created_at).toLocaleDateString()}
                        </span>
                        <span class="discussion-comments">
                            <i class="fas fa-comment"></i> ${discussion.comments} comments
                        </span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error fetching discussions:', error);
        const discussionsContainer = document.getElementById('discussions-container');
        if (discussionsContainer) {
            discussionsContainer.innerHTML = `<div class="error-message"><p>Failed to load discussions. Please try again later.</p></div>`;
        }
    }
}

// Truncate long content
function truncateContent(content, maxLength = 200) {
    if (content.length > maxLength) {
        return content.substring(0, maxLength) + '...';
    }
    return content;
}

// Toggle "Read More" functionality
function toggleReadMore(button) {
    const fullContent = button.nextElementSibling;
    if (fullContent.style.display === 'none') {
        fullContent.style.display = 'block';
        button.textContent = 'Read Less';
    } else {
        fullContent.style.display = 'none';
        button.textContent = 'Read More';
    }
}

// Call the function when the discussions page loads
if (window.location.pathname.includes('discussions.html')) {
    document.addEventListener('DOMContentLoaded', fetchDiscussions);
}


