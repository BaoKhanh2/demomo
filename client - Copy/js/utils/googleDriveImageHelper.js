// ========================================
// GOOGLE DRIVE IMAGE HELPER - Xử lý ảnh từ Google Drive
// ========================================

class GoogleDriveImageHelper {
  
  /**
   * processGoogleDriveImage: Chuyển đổi Google Drive ID/URL thành URL hiển thị được
   * @param {string} imageSource - Google Drive ID, sharing URL, hoặc URL khác
   * @param {Object} options - Tùy chọn xử lý
   * @returns {string} - URL ảnh đã được xử lý
   */
  static processGoogleDriveImage(imageSource, options = {}) {
    console.log('📸 Processing Google Drive image:', imageSource);
    
    if (!imageSource) {
      console.warn('⚠️ No image source provided');
      return options.fallback || './public/images/cart_logo.png';
    }

    // Đã là optimized URL - không xử lý thêm
    if (imageSource.includes('drive.google.com/uc?id=') && imageSource.includes('export=view')) {
      console.log('✅ Already optimized Google Drive URL:', imageSource);
      return imageSource;
    }

    // Case 1: Google Drive sharing URL
    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    if (imageSource.includes('drive.google.com/file/d/')) {
      const fileIdMatch = imageSource.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        const directUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;
        console.log('✅ Converted sharing URL to direct URL:', {
          original: imageSource,
          converted: directUrl,
          fileId: fileId
        });
        return directUrl;
      }
    }

    // Case 2: Google Drive ID only (kiểm tra chặt chẽ hơn)
    // Phải là chuỗi không có protocol và có định dạng Google Drive ID
    if (this.isGoogleDriveId(imageSource)) {
      const directUrl = `https://drive.google.com/uc?id=${imageSource}&export=view`;
      console.log('✅ Converted Drive ID to direct URL:', {
        original: imageSource,
        converted: directUrl
      });
      return directUrl;
    }

    // Case 3: Google Drive UC URL chưa có export=view
    if (imageSource.includes('drive.google.com/uc?id=') && !imageSource.includes('export=view')) {
      const enhancedUrl = imageSource + '&export=view';
      console.log('✅ Enhanced Drive URL with export=view:', enhancedUrl);
      return enhancedUrl;
    }

    // Case 4: Local image paths - giữ nguyên
    if (this.isLocalPath(imageSource)) {
      console.log('ℹ️ Using local image path:', imageSource);
      return imageSource;
    }

    // Case 5: External HTTP/HTTPS URLs - giữ nguyên
    if (imageSource.startsWith('http')) {
      console.log('ℹ️ Using external URL:', imageSource);
      return imageSource;
    }

    // Case 6: Không xác định được - dùng fallback
    console.warn('⚠️ Unknown image source format:', imageSource);
    return options.fallback || './public/images/cart_logo.png';
  }

  /**
   * isGoogleDriveId: Kiểm tra xem có phải Google Drive ID không
   * @param {string} str - Chuỗi cần kiểm tra
   * @returns {boolean}
   */
  static isGoogleDriveId(str) {
    // Google Drive ID thường có độ dài 25-50 ký tự và chỉ chứa a-z, A-Z, 0-9, -, _
    return (
      typeof str === 'string' &&
      str.length >= 20 &&
      str.length <= 50 &&
      /^[a-zA-Z0-9-_]+$/.test(str) &&
      !str.startsWith('http') &&
      !this.isLocalPath(str)
    );
  }

  /**
   * isLocalPath: Kiểm tra có phải đường dẫn local không
   * @param {string} str - Chuỗi cần kiểm tra
   * @returns {boolean}
   */
  static isLocalPath(str) {
    return (
      str.startsWith('./') ||
      str.startsWith('../') ||
      str.startsWith('/') ||
      str.startsWith('public/') ||
      str.startsWith('assets/')
    );
  }

  /**
   * extractGoogleDriveId: Trích xuất Google Drive ID từ URL
   * @param {string} url - URL Google Drive
   * @returns {string|null} - Google Drive ID hoặc null
   */
  static extractGoogleDriveId(url) {
    if (!url) return null;

    // From sharing URL
    const sharingMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
    if (sharingMatch) {
      return sharingMatch[1];
    }

    // From UC URL
    const ucMatch = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
    if (ucMatch) {
      return ucMatch[1];
    }

    // If it's already an ID
    if (this.isGoogleDriveId(url)) {
      return url;
    }

    return null;
  }

  /**
   * createThumbnailUrl: Tạo URL thumbnail từ Google Drive ID
   * @param {string} fileId - Google Drive file ID
   * @param {number} size - Kích thước thumbnail (default: 200)
   * @returns {string}
   */
  static createThumbnailUrl(fileId, size = 200) {
    if (!fileId) return './public/images/cart_logo.png';
    
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=s${size}`;
  }

  /**
   * batchProcessImages: Xử lý nhiều ảnh cùng lúc
   * @param {Array} images - Mảng các image source
   * @param {Object} options - Tùy chọn xử lý
   * @returns {Array} - Mảng URLs đã xử lý
   */
  static batchProcessImages(images, options = {}) {
    if (!Array.isArray(images)) {
      console.warn('⚠️ Images must be an array');
      return [];
    }

    return images.map((img, index) => {
      console.log(`📸 Processing image ${index + 1}/${images.length}:`, img);
      return this.processGoogleDriveImage(img, options);
    });
  }

  /**
   * validateImageUrl: Kiểm tra URL ảnh có hợp lệ không
   * @param {string} url - URL cần kiểm tra
   * @returns {Promise<boolean>}
   */
  static async validateImageUrl(url) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const isValid = response.ok && response.headers.get('content-type')?.startsWith('image/');
      console.log(`🔍 Image validation for ${url}:`, isValid ? '✅ Valid' : '❌ Invalid');
      return isValid;
    } catch (error) {
      console.warn(`⚠️ Cannot validate image ${url}:`, error.message);
      return false;
    }
  }

  /**
   * preloadImage: Preload ảnh để cải thiện performance
   * @param {string} url - URL ảnh
   * @returns {Promise<HTMLImageElement>}
   */
  static preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('✅ Image preloaded successfully:', url);
        resolve(img);
      };
      img.onerror = () => {
        console.error('❌ Failed to preload image:', url);
        reject(new Error(`Failed to load image: ${url}`));
      };
      img.src = url;
    });
  }
}

// Export để sử dụng globally
window.GoogleDriveImageHelper = GoogleDriveImageHelper;

// Export cho module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GoogleDriveImageHelper;
}
