/**
 * Google Analytics 4 Integration
 * This file handles all analytics tracking for PictriKit
 */

// Configuration
const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX'; // Replace with your actual GA4 Measurement ID

/**
 * Initialize Google Analytics 4
 */
function initializeAnalytics() {
    // Check if user has consented to analytics (respect privacy)
    const analyticsConsent = localStorage.getItem('analytics_consent');
    
    if (analyticsConsent === 'false') {
        console.log('Analytics disabled by user preference');
        return;
    }
    
    // Load gtag.js script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    document.head.appendChild(script);
    
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag() {
        dataLayer.push(arguments);
    }
    window.gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        'anonymize_ip': true, // Anonymize IP addresses for privacy
        'cookie_flags': 'SameSite=None;Secure'
    });
    
    console.log('Google Analytics initialized');
}

/**
 * Track page view
 * @param {string} pagePath - The page path to track
 * @param {string} pageTitle - The page title
 */
function trackPageView(pagePath, pageTitle) {
    if (typeof gtag === 'function') {
        gtag('event', 'page_view', {
            page_path: pagePath,
            page_title: pageTitle
        });
    }
}

/**
 * Track custom events
 * @param {string} eventName - Name of the event
 * @param {object} eventParams - Event parameters
 */
function trackEvent(eventName, eventParams = {}) {
    if (typeof gtag === 'function') {
        gtag('event', eventName, eventParams);
    }
}

/**
 * Track screenshot upload
 * @param {number} count - Number of screenshots uploaded
 */
function trackScreenshotUpload(count) {
    trackEvent('screenshot_upload', {
        screenshot_count: count,
        event_category: 'engagement',
        event_label: 'Upload Screenshots'
    });
}

/**
 * Track screenshot download
 * @param {string} format - Download format (png, jpg, etc.)
 */
function trackScreenshotDownload(format) {
    trackEvent('screenshot_download', {
        file_format: format,
        event_category: 'conversion',
        event_label: 'Download Combined Screenshot'
    });
}

/**
 * Track screenshot share
 * @param {string} method - Share method (clipboard, etc.)
 */
function trackScreenshotShare(method) {
    trackEvent('screenshot_share', {
        share_method: method,
        event_category: 'engagement',
        event_label: 'Share Screenshot'
    });
}

/**
 * Track tool usage
 * @param {string} toolName - Name of the tool used (draw, text, etc.)
 */
function trackToolUsage(toolName) {
    trackEvent('tool_usage', {
        tool_name: toolName,
        event_category: 'engagement',
        event_label: `Use ${toolName} Tool`
    });
}

/**
 * Track language change
 * @param {string} language - Selected language code
 */
function trackLanguageChange(language) {
    trackEvent('language_change', {
        language: language,
        event_category: 'engagement',
        event_label: 'Change Language'
    });
}

/**
 * Track theme change
 * @param {string} theme - Selected theme (light/dark)
 */
function trackThemeChange(theme) {
    trackEvent('theme_change', {
        theme: theme,
        event_category: 'engagement',
        event_label: 'Change Theme'
    });
}

/**
 * Track form submission
 * @param {string} formName - Name of the form
 */
function trackFormSubmission(formName) {
    trackEvent('form_submission', {
        form_name: formName,
        event_category: 'engagement',
        event_label: `Submit ${formName} Form`
    });
}

/**
 * Track outbound link clicks
 * @param {string} url - The URL being clicked
 * @param {string} linkText - The link text
 */
function trackOutboundLink(url, linkText) {
    trackEvent('outbound_link', {
        link_url: url,
        link_text: linkText,
        event_category: 'engagement',
        event_label: 'Click Outbound Link'
    });
}

/**
 * Track errors
 * @param {string} errorMessage - Error message
 * @param {string} errorLocation - Where the error occurred
 */
function trackError(errorMessage, errorLocation) {
    trackEvent('error', {
        error_message: errorMessage,
        error_location: errorLocation,
        event_category: 'error',
        event_label: 'Application Error'
    });
}

/**
 * Track user timing (performance metrics)
 * @param {string} name - Timing name
 * @param {number} value - Timing value in milliseconds
 * @param {string} category - Timing category
 */
function trackTiming(name, value, category = 'performance') {
    if (typeof gtag === 'function') {
        gtag('event', 'timing_complete', {
            name: name,
            value: value,
            event_category: category
        });
    }
}

/**
 * Set user properties
 * @param {object} properties - User properties to set
 */
function setUserProperties(properties) {
    if (typeof gtag === 'function') {
        gtag('set', 'user_properties', properties);
    }
}

/**
 * Enable or disable analytics based on user consent
 * @param {boolean} consent - Whether user consents to analytics
 */
function setAnalyticsConsent(consent) {
    localStorage.setItem('analytics_consent', consent.toString());
    
    if (consent) {
        initializeAnalytics();
    } else {
        // Disable analytics
        window['ga-disable-' + GA_MEASUREMENT_ID] = true;
        console.log('Analytics disabled');
    }
}

// Auto-initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnalytics);
} else {
    initializeAnalytics();
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeAnalytics,
        trackPageView,
        trackEvent,
        trackScreenshotUpload,
        trackScreenshotDownload,
        trackScreenshotShare,
        trackToolUsage,
        trackLanguageChange,
        trackThemeChange,
        trackFormSubmission,
        trackOutboundLink,
        trackError,
        trackTiming,
        setUserProperties,
        setAnalyticsConsent
    };
}
