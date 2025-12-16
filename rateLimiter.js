const vscode = require('vscode');

const RATE_LIMIT_MAX = 17; // tweets per 24 hours
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Check if user can post a tweet based on rate limits
 * @param {vscode.ExtensionContext} context
 * @returns {Promise<{canPost: boolean, remaining: number, resetTime: Date}>}
 */
async function canPostTweet(context) {
    await resetIfNeeded(context);

    const count = context.globalState.get('tweetCount', 0);
    const lastReset = context.globalState.get('lastResetTimestamp', Date.now());

    const remaining = Math.max(0, RATE_LIMIT_MAX - count);
    const resetTime = new Date(lastReset + RESET_INTERVAL);

    return {
        canPost: count < RATE_LIMIT_MAX,
        remaining,
        resetTime
    };
}

/**
 * Increment the tweet counter
 * @param {vscode.ExtensionContext} context
 */
async function incrementTweetCount(context) {
    const count = context.globalState.get('tweetCount', 0);
    await context.globalState.update('tweetCount', count + 1);
}

/**
 * Get remaining tweets for today
 * @param {vscode.ExtensionContext} context
 * @returns {number}
 */
function getRemainingTweets(context) {
    const count = context.globalState.get('tweetCount', 0);
    return Math.max(0, RATE_LIMIT_MAX - count);
}

/**
 * Get time until reset
 * @param {vscode.ExtensionContext} context
 * @returns {Date}
 */
function getResetTime(context) {
    const lastReset = context.globalState.get('lastResetTimestamp', Date.now());
    return new Date(lastReset + RESET_INTERVAL);
}

/**
 * Reset counter if 24 hours have passed
 * @param {vscode.ExtensionContext} context
 */
async function resetIfNeeded(context) {
    let lastReset = context.globalState.get('lastResetTimestamp');
    const now = Date.now();

    // If never set, initialize it
    if (!lastReset) {
        await context.globalState.update('lastResetTimestamp', now);
        return;
    }

    if (now - lastReset >= RESET_INTERVAL) {
        await context.globalState.update('tweetCount', 0);
        await context.globalState.update('lastResetTimestamp', now);
    }
}

/**
 * Format remaining time until reset
 * @param {Date} resetTime
 * @returns {string}
 */
function formatTimeUntilReset(resetTime) {
    const now = new Date();
    const diff = resetTime - now;

    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
}

module.exports = {
    canPostTweet,
    incrementTweetCount,
    getRemainingTweets,
    getResetTime,
    resetIfNeeded,
    formatTimeUntilReset
};
