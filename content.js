function filterLinkedInPosts() {
    'use strict';

    // Configuration
    const config = {
        blurAmount: '8px',
        targetSelectors: [
            // Main feed posts
            '.feed-shared-update-v2',
            // Activity section posts
            '.occludable-update',
            // Other potential post containers
            '.feed-shared-card',
            '.update-components-actor',
            '.feed-shared-update'
        ],
        observerConfig: {
            childList: true,
            subtree: true
        },
        hoverDelay: 300 // milliseconds
    };

    // Track mouse state
    let hoverTimer = null;

    // Function to apply blur to LinkedIn posts
    function blurLinkedInPosts() {
        config.targetSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (!element.classList.contains('linkedin-blur-applied')) {
                    element.classList.add('linkedin-blur-applied');

                    // Add hover listener to temporarily remove blur
                    element.addEventListener('mouseenter', function () {
                        hoverTimer = setTimeout(() => {
                            this.classList.add('linkedin-blur-hover');
                        }, config.hoverDelay);
                    });

                    element.addEventListener('mouseleave', function () {
                        clearTimeout(hoverTimer);
                        this.classList.remove('linkedin-blur-hover');
                    });
                }
            });
        });
    }

    // Initial blur application
    function initialize() {
        chrome.storage.sync.get(['enabled', 'blurAmount'], function (data) {
            // Default to enabled if not set
            const isEnabled = data.enabled !== undefined ? data.enabled : true;

            // Set custom blur amount if available
            if (data.blurAmount) {
                config.blurAmount = data.blurAmount;
                document.documentElement.style.setProperty('--linkedin-blur-amount', data.blurAmount);
            } else {
                document.documentElement.style.setProperty('--linkedin-blur-amount', config.blurAmount);
            }

            if (isEnabled) {
                blurLinkedInPosts();
                setupObserver();
            }
        });
    }

    // Setup mutation observer to handle dynamically loaded content
    function setupObserver() {
        const observer = new MutationObserver(function (mutations) {
            blurLinkedInPosts();
        });

        observer.observe(document.body, config.observerConfig);
    }

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.action === 'toggleBlur') {
            if (request.enabled) {
                blurLinkedInPosts();
                setupObserver();
            } else {
                document.querySelectorAll('.linkedin-blur-applied').forEach(el => {
                    el.classList.remove('linkedin-blur-applied');
                    el.classList.remove('linkedin-blur-hover');
                });
            }
        }

        if (request.action === 'updateBlurAmount') {
            config.blurAmount = request.blurAmount;
            document.documentElement.style.setProperty('--linkedin-blur-amount', request.blurAmount);
        }

        sendResponse({ status: 'success' });
    });

    // Initialize after page is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
};

filterLinkedInPosts();