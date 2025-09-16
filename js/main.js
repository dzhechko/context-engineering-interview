// Main JavaScript functionality for Context Engineering transcript website
(function() {
    'use strict';

    // State management
    let currentSearchTerm = '';
    let searchResults = [];
    let currentHighlights = [];

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        initializeScrollProgress();
        initializeNavigation();
        initializeSearch();
        initializeAnchorLinks();
        initializeCategoryCards();
        initializeMobileOptimizations();
    });

    // Scroll Progress Bar
    function initializeScrollProgress() {
        const scrollProgressBar = document.getElementById('scrollProgress');
        
        function updateScrollProgress() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrollProgress = (scrollTop / scrollHeight) * 100;
            
            scrollProgressBar.style.width = scrollProgress + '%';
        }

        window.addEventListener('scroll', updateScrollProgress);
        updateScrollProgress(); // Initial call
    }

    // Navigation functionality
    function initializeNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const sections = document.querySelectorAll('section[id]');
        
        // Smooth scrolling for navigation links
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Calculate offset to account for fixed header
                    const headerHeight = 120; // Approximate header height
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active state
                    updateActiveNavItem(this);
                }
            });
        });

        // Update active navigation item on scroll
        function updateActiveNavigation() {
            const scrollPosition = window.scrollY + 150; // Offset for header
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                const sectionId = section.getAttribute('id');
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    const correspondingNavItem = document.querySelector(`a[href="#${sectionId}"]`);
                    if (correspondingNavItem) {
                        updateActiveNavItem(correspondingNavItem);
                    }
                }
            });
        }

        function updateActiveNavItem(activeItem) {
            // Remove active class from all items
            navItems.forEach(item => item.classList.remove('active'));
            // Add active class to current item
            activeItem.classList.add('active');
        }

        // Throttled scroll listener for performance
        let scrollTimeout;
        window.addEventListener('scroll', function() {
            if (scrollTimeout) {
                clearTimeout(scrollTimeout);
            }
            scrollTimeout = setTimeout(updateActiveNavigation, 100);
        });

        // Initial call
        updateActiveNavigation();
    }

    // Search functionality
    function initializeSearch() {
        const searchInput = document.getElementById('searchInput');
        const clearSearchButton = document.getElementById('clearSearch');
        const transcriptContent = document.getElementById('transcriptContent');
        
        // Search input handler with debounce
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            searchTimeout = setTimeout(() => {
                handleSearch(searchTerm);
            }, 300);
        });

        // Clear search handler
        clearSearchButton.addEventListener('click', function() {
            clearSearch();
        });

        // Handle search functionality
        function handleSearch(searchTerm) {
            if (searchTerm === '') {
                clearSearch();
                return;
            }

            currentSearchTerm = searchTerm;
            performSearch(searchTerm);
        }

        // Perform the actual search
        function performSearch(searchTerm) {
            clearHighlights();
            
            if (searchTerm.length < 2) {
                return;
            }

            const regex = new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi');
            const walker = document.createTreeWalker(
                transcriptContent,
                NodeFilter.SHOW_TEXT,
                {
                    acceptNode: function(node) {
                        return node.parentNode.tagName !== 'SCRIPT' && 
                               node.parentNode.tagName !== 'STYLE' &&
                               !node.parentNode.classList.contains('search-highlight') ? 
                               NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
                    }
                }
            );

            const textNodes = [];
            let node;
            while (node = walker.nextNode()) {
                if (regex.test(node.textContent)) {
                    textNodes.push(node);
                }
            }

            // Highlight found text
            textNodes.forEach(textNode => {
                const parent = textNode.parentNode;
                const highlightedHTML = textNode.textContent.replace(regex, '<span class="search-highlight">$1</span>');
                
                const wrapper = document.createElement('div');
                wrapper.innerHTML = highlightedHTML;
                
                while (wrapper.firstChild) {
                    parent.insertBefore(wrapper.firstChild, textNode);
                }
                parent.removeChild(textNode);
            });

            // Update UI
            const highlightedElements = document.querySelectorAll('.search-highlight');
            currentHighlights = Array.from(highlightedElements);
            
            if (currentHighlights.length > 0) {
                clearSearchButton.classList.remove('hidden');
                // Scroll to first result
                currentHighlights[0].scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            } else {
                clearSearchButton.classList.add('hidden');
            }
        }

        // Clear all search highlights
        function clearSearch() {
            searchInput.value = '';
            currentSearchTerm = '';
            clearHighlights();
            clearSearchButton.classList.add('hidden');
        }

        // Clear search highlights
        function clearHighlights() {
            currentHighlights.forEach(highlight => {
                const parent = highlight.parentNode;
                parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
                parent.normalize(); // Merge adjacent text nodes
            });
            currentHighlights = [];
        }

        // Escape special regex characters
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Ctrl+F or Cmd+F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                searchInput.focus();
                searchInput.select();
            }
            
            // Escape to clear search
            if (e.key === 'Escape' && searchInput === document.activeElement) {
                clearSearch();
                searchInput.blur();
            }
        });
    }

    // Category cards functionality
    function initializeCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            card.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    // Calculate offset to account for fixed header
                    const headerHeight = 120;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Update active navigation item
                    const correspondingNavItem = document.querySelector(`a[href="#${targetId}"]`);
                    if (correspondingNavItem) {
                        // Remove active class from all nav items
                        const navItems = document.querySelectorAll('.nav-item');
                        navItems.forEach(item => item.classList.remove('active'));
                        // Add active class to corresponding nav item
                        correspondingNavItem.classList.add('active');
                    }
                    
                    // Add visual feedback
                    this.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                }
            });
            
            // Add keyboard support
            card.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.click();
                }
            });
            
            // Ensure cards are focusable
            if (!card.hasAttribute('tabindex')) {
                card.setAttribute('tabindex', '0');
            }
        });
    }

    // Anchor links functionality
    function initializeAnchorLinks() {
        // Add anchor links to sections
        const headings = document.querySelectorAll('h2[id], h3[id]');
        
        headings.forEach(heading => {
            heading.addEventListener('mouseenter', showAnchorLink);
            heading.addEventListener('mouseleave', hideAnchorLink);
        });

        function showAnchorLink() {
            const existingLink = this.querySelector('.anchor-link');
            if (existingLink) return;

            const anchorLink = document.createElement('a');
            anchorLink.href = `#${this.id}`;
            anchorLink.className = 'anchor-link text-gray-400 hover:text-gray-600 ml-2 opacity-0 transition-opacity duration-200';
            anchorLink.innerHTML = '<i class="fas fa-link text-sm"></i>';
            anchorLink.setAttribute('aria-label', 'Ссылка на этот раздел');
            
            // Handle anchor link clicks
            anchorLink.addEventListener('click', function(e) {
                e.preventDefault();
                const url = window.location.protocol + '//' + window.location.host + window.location.pathname + this.getAttribute('href');
                navigator.clipboard.writeText(url).then(() => {
                    showCopyNotification();
                });
                
                // Smooth scroll to section
                const targetElement = document.getElementById(this.getAttribute('href').substring(1));
                if (targetElement) {
                    const headerHeight = 120;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });

            this.appendChild(anchorLink);
            
            // Fade in
            setTimeout(() => {
                anchorLink.classList.remove('opacity-0');
                anchorLink.classList.add('opacity-100');
            }, 10);
        }

        function hideAnchorLink() {
            const anchorLink = this.querySelector('.anchor-link');
            if (anchorLink) {
                anchorLink.classList.remove('opacity-100');
                anchorLink.classList.add('opacity-0');
                setTimeout(() => {
                    if (anchorLink.parentNode) {
                        anchorLink.parentNode.removeChild(anchorLink);
                    }
                }, 200);
            }
        }

        function showCopyNotification() {
            // Remove existing notification
            const existing = document.querySelector('.copy-notification');
            if (existing) {
                existing.remove();
            }

            // Create notification
            const notification = document.createElement('div');
            notification.className = 'copy-notification fixed top-20 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
            notification.innerHTML = '<i class="fas fa-check mr-2"></i>Ссылка скопирована!';
            
            document.body.appendChild(notification);
            
            // Animate in
            setTimeout(() => {
                notification.classList.remove('translate-x-full');
            }, 10);
            
            // Animate out and remove
            setTimeout(() => {
                notification.classList.add('translate-x-full');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 2000);
        }
    }

    // Mobile optimizations
    function initializeMobileOptimizations() {
        // Handle mobile navigation toggle
        const nav = document.querySelector('.section-navigation');
        let isNavExpanded = false;

        // Create mobile toggle button for navigation (only on mobile)
        function createMobileNavToggle() {
            if (window.innerWidth <= 1024) {
                if (!document.querySelector('.mobile-nav-toggle')) {
                    const toggleButton = document.createElement('button');
                    toggleButton.className = 'mobile-nav-toggle lg:hidden w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center justify-between';
                    toggleButton.innerHTML = `
                        <span>Содержание</span>
                        <i class="fas fa-chevron-down transition-transform duration-200"></i>
                    `;
                    
                    const navContent = nav.querySelector('nav');
                    navContent.classList.add('hidden', 'lg:block');
                    
                    toggleButton.addEventListener('click', function() {
                        isNavExpanded = !isNavExpanded;
                        const icon = this.querySelector('i');
                        
                        if (isNavExpanded) {
                            navContent.classList.remove('hidden');
                            icon.classList.add('rotate-180');
                        } else {
                            navContent.classList.add('hidden');
                            icon.classList.remove('rotate-180');
                        }
                    });
                    
                    nav.insertBefore(toggleButton, navContent);
                }
            } else {
                // Remove mobile toggle on desktop
                const toggleButton = document.querySelector('.mobile-nav-toggle');
                if (toggleButton) {
                    toggleButton.remove();
                }
                const navContent = nav.querySelector('nav');
                navContent.classList.remove('hidden');
            }
        }

        // Handle responsive search
        function handleResponsiveSearch() {
            const searchInput = document.getElementById('searchInput');
            const searchContainer = searchInput.parentNode.parentNode;
            
            if (window.innerWidth <= 640) {
                searchInput.placeholder = 'Поиск...';
                searchInput.classList.remove('w-64');
                searchInput.classList.add('w-full');
            } else {
                searchInput.placeholder = 'Поиск по тексту...';
                searchInput.classList.remove('w-full');
                searchInput.classList.add('w-64');
            }
        }

        // Initialize and handle resize
        createMobileNavToggle();
        handleResponsiveSearch();
        
        window.addEventListener('resize', function() {
            createMobileNavToggle();
            handleResponsiveSearch();
        });

        // Handle touch interactions for better mobile UX
        let touchStartY = 0;
        let touchEndY = 0;
        
        document.addEventListener('touchstart', function(e) {
            touchStartY = e.changedTouches[0].screenY;
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            touchEndY = e.changedTouches[0].screenY;
            handleSwipeGesture();
        }, { passive: true });
        
        function handleSwipeGesture() {
            const swipeThreshold = 50;
            const swipeDistance = touchStartY - touchEndY;
            
            // Optional: Add swipe gestures for navigation
            // Currently not implemented to avoid interference with normal scrolling
        }
    }

    // Utility functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func.apply(this, args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Handle URL hash navigation
    function handleHashNavigation() {
        const hash = window.location.hash;
        if (hash) {
            const targetElement = document.querySelector(hash);
            if (targetElement) {
                setTimeout(() => {
                    const headerHeight = 120;
                    const targetPosition = targetElement.offsetTop - headerHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }, 100);
            }
        }
    }

    // Initialize hash navigation
    window.addEventListener('load', handleHashNavigation);
    window.addEventListener('hashchange', handleHashNavigation);

    // Performance monitoring (optional)
    function logPerformanceMetrics() {
        if ('performance' in window) {
            window.addEventListener('load', function() {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    console.log('Page Load Performance:');
                    console.log(`DOM Content Loaded: ${perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart}ms`);
                    console.log(`Load Complete: ${perfData.loadEventEnd - perfData.loadEventStart}ms`);
                }, 0);
            });
        }
    }

    // Enable performance logging in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        logPerformanceMetrics();
    }

    // Expose some functions globally for debugging
    window.transcriptApp = {
        clearSearch: function() {
            document.getElementById('searchInput').value = '';
            document.getElementById('clearSearch').click();
        },
        scrollToSection: function(sectionId) {
            const element = document.getElementById(sectionId);
            if (element) {
                const headerHeight = 120;
                const targetPosition = element.offsetTop - headerHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        }
    };

})();