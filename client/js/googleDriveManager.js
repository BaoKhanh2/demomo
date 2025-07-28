/**
 * Google Drive Image Manager
 * Handles converting Google Drive sharing links to direct image URLs
 */

/**
 * Extract file ID from various Google Drive URL formats
 * @param {string} url - Google Drive URL
 * @returns {string|null} - File ID or null if invalid
 */
export function extractGoogleDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Pattern for: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
  const sharePattern = /\/file\/d\/([a-zA-Z0-9_-]+)/;
  const shareMatch = url.match(sharePattern);
  if (shareMatch) return shareMatch[1];
  
  // Pattern for: https://drive.google.com/open?id=FILE_ID
  const openPattern = /[?&]id=([a-zA-Z0-9_-]+)/;
  const openMatch = url.match(openPattern);
  if (openMatch) return openMatch[1];
  
  // If it's already just a file ID
  const fileIdPattern = /^[a-zA-Z0-9_-]{25,}$/;
  if (fileIdPattern.test(url)) return url;
  
  return null;
}

/**
 * Convert Google Drive file ID to direct image URL
 * @param {string} fileId - Google Drive file ID
 * @returns {string} - Direct image URL
 */
export function getGoogleDriveImageUrl(fileId) {
  if (!fileId) return null;
  return `https://drive.google.com/uc?id=${fileId}&export=view`;
}

/**
 * Convert Google Drive file ID to thumbnail URL
 * @param {string} fileId - Google Drive file ID
 * @param {number} size - Thumbnail size (default: 400)
 * @returns {string} - Thumbnail URL
 */
export function getGoogleDriveThumbnailUrl(fileId, size = 400) {
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`;
}

/**
 * Process any Google Drive URL and return direct image URL
 * @param {string} url - Any Google Drive URL format
 * @returns {string|null} - Direct image URL or null if invalid
 */
export function processGoogleDriveUrl(url) {
  const fileId = extractGoogleDriveFileId(url);
  return fileId ? getGoogleDriveImageUrl(fileId) : null;
}

/**
 * Check if a URL is a Google Drive URL
 * @param {string} url - URL to check
 * @returns {boolean} - True if it's a Google Drive URL
 */
export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com');
}

/**
 * Get the best image URL (Google Drive or local)
 * @param {object} product - Product object
 * @returns {string} - Best available image URL
 */
export function getBestImageUrl(product) {
  // Priority: googleDriveImageId > googleDriveImageUrl > image (local)
  if (product.googleDriveImageId) {
    return getGoogleDriveImageUrl(product.googleDriveImageId);
  }
  
  if (product.googleDriveImageUrl) {
    const processedUrl = processGoogleDriveUrl(product.googleDriveImageUrl);
    if (processedUrl) return processedUrl;
  }
  
  // Fallback to local image
  return product.image || '';
}