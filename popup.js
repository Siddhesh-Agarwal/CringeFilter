document.addEventListener('DOMContentLoaded', function () {
    const enableBlurCheckbox = document.getElementById('enableBlur');
    const blurAmountSlider = document.getElementById('blurAmount');
    const blurValueDisplay = document.getElementById('blurValue');

    // Load saved settings
    chrome.storage.sync.get(['enabled', 'blurAmount'], function (data) {
        // Set defaults if not found
        const isEnabled = data.enabled !== undefined ? data.enabled : true;
        const blurAmount = data.blurAmount || '8px';

        enableBlurCheckbox.checked = isEnabled;
        blurAmountSlider.value = parseInt(blurAmount);
        blurValueDisplay.textContent = `${blurAmountSlider.value}px`;
    });

    // Toggle blur on/off
    enableBlurCheckbox.addEventListener('change', function () {
        const isEnabled = this.checked;

        chrome.storage.sync.set({ enabled: isEnabled });

        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0].url.includes('linkedin.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'toggleBlur',
                    enabled: isEnabled
                });
            }
        });
    });

    // Update blur amount
    blurAmountSlider.addEventListener('input', function () {
        const blurAmount = `${this.value}px`;
        blurValueDisplay.textContent = blurAmount;

        chrome.storage.sync.set({ blurAmount: blurAmount });

        // Send message to content script
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs[0].url.includes('linkedin.com')) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'updateBlurAmount',
                    blurAmount: blurAmount
                });
            }
        });
    });
});