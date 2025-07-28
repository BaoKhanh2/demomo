// ========================================
// UTILITY HELPERS
// ========================================

// Format giá tiền VND
function formatPrice(price) {
  if (!price || isNaN(price)) return '0₫';
  return `₫${Number(price).toLocaleString()}`;
}

// Format ngày tháng
function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('vi-VN');
}

// Validate category ID
function isValidCategoryId(categoryId) {
  if (!categoryId) return false;
  
  const invalidPatterns = [
    /^null$/i,
    /^undefined$/i,
    /^$/,
    /^\s*$/
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(categoryId));
}

// Get URL parameters
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    useNewAPI: params.get('useNewAPI') === 'true',
    categoryId: params.get('categoryId'),
    categoryName: params.get('categoryName'),
    productId: params.get('productId')
  };
}

// Show loading state
function showLoadingState(containerId = 'productContainer') {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="
      text-align: center;
      padding: 60px 20px;
      color: #6c757d;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 16px;
      margin: 20px 0;
      width: 100%;
    ">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 3rem; color: #007bff; margin-bottom: 20px;"></i>
      <h3 style="color: #495057; margin-bottom: 16px;">Đang tải...</h3>
      <p style="font-size: 1.1rem;">Vui lòng đợi trong giây lát</p>
    </div>
  `;
}

// Show error message
function showErrorMessage(containerId, message, showRetry = true) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = `
    <div style="
      text-align: center;
      padding: 40px 20px;
      color: #dc3545;
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      margin: 20px 0;
    ">
      <i class="fa-solid fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 16px;"></i>
      <h4>Có lỗi xảy ra</h4>
      <p>${message}</p>
      ${showRetry ? `
        <button onclick="location.reload()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 10px;
        ">
          <i class="fa-solid fa-refresh" style="margin-right: 5px;"></i>
          Thử lại
        </button>
      ` : ''}
    </div>
  `;
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Create delay promise
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Log with timestamp
function logWithTime(message, type = 'log') {
  const timestamp = new Date().toLocaleTimeString();
  console[type](`[${timestamp}] ${message}`);
}

// Export to global
window.UtilHelpers = {
  formatPrice,
  formatDate,
  isValidCategoryId,
  getUrlParams,
  showLoadingState,
  showErrorMessage,
  debounce,
  delay,
  logWithTime
};
