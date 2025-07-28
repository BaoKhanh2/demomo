// ========================================
// PRODUCT MANAGER - Main Logic (Simplified)
// ========================================

class ProductManager {
  constructor() {
    this.currentProducts = [];
    this.currentCategory = null;
  }

  // Load products by category
  async loadProducts(categoryId = null, categoryName = '') {
    try {
      window.UtilHelpers.showLoadingState();
      window.UtilHelpers.logWithTime(`Loading products for category: ${categoryId || 'all'}`);
      
      const products = await window.apiClient.getProducts(categoryId);
      this.currentProducts = products;
      this.currentCategory = { id: categoryId, name: categoryName };
      
      this.displayProducts(products, categoryName);
      
    } catch (error) {
      window.UtilHelpers.logWithTime(`Error loading products: ${error.message}`, 'error');
      window.UtilHelpers.showErrorMessage('productContainer', 'Không thể tải sản phẩm. Vui lòng thử lại.');
    }
  }

  // Display products in grid
  displayProducts(products, categoryName = '') {
    const container = document.getElementById('productContainer');
    if (!container) {
      console.error('❌ Container not found');
      return;
    }

    // Check if sample data
    const isSampleData = products.some(p => p.id && p.id.startsWith('sample-'));
    
    container.innerHTML = '';

    // Show sample data warning
    if (isSampleData) {
      this.showSampleDataWarning(container);
    }

    // Show empty state
    if (products.length === 0) {
      this.showEmptyState(container);
      return;
    }

    // Create products grid
    const grid = this.createProductsGrid(products);
    container.appendChild(grid);
    
    window.UtilHelpers.logWithTime(`Displayed ${products.length} products`);
  }

  // Show sample data warning
  showSampleDataWarning(container) {
    const warning = document.createElement('div');
    warning.style.cssText = `
      margin: 20px;
      padding: 15px;
      background-color: #fff3cd;
      border: 1px solid #ffecb5;
      border-radius: 8px;
      color: #856404;
    `;
    warning.innerHTML = `
      <i class="fas fa-exclamation-triangle" style="margin-right: 8px;"></i>
      <strong>Thông báo:</strong> Đang hiển thị dữ liệu mẫu do API không khả dụng.
      <button onclick="this.parentElement.remove()" style="
        float: right;
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
      ">×</button>
    `;
    container.appendChild(warning);
  }

  // Show empty state
  showEmptyState(container) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: #666;">
        <div style="font-size: 3rem; margin-bottom: 20px;">📦</div>
        <h3>Không có sản phẩm nào</h3>
        <p>Vui lòng thử danh mục khác hoặc quay lại sau.</p>
        <button onclick="location.reload()" style="
          background: #007bff;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 5px;
          cursor: pointer;
          margin-top: 10px;
        ">
          <i class="fa-solid fa-refresh" style="margin-right: 5px;"></i>
          Tải lại
        </button>
      </div>
    `;
  }

  // Create products grid
  createProductsGrid(products) {
    const grid = document.createElement('div');
    grid.style.cssText = `
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      padding: 20px;
    `;

    products.forEach(product => {
      const productCard = new window.ProductCard(product);
      grid.appendChild(productCard.createElement());
    });

    return grid;
  }

  // Navigate to product detail
  static navigateToDetail(productId) {
    const url = `product-detail.html?productId=${productId}`;
    window.location.href = url;
    window.UtilHelpers.logWithTime(`Navigating to product detail: ${productId}`);
  }

  // Add to cart (placeholder)
  static addToCart(productId) {
    // Implement cart logic here
    window.UtilHelpers.logWithTime(`Adding to cart: ${productId}`);
    // Show toast or update cart UI
  }

  // Check URL params and load products
  async checkUrlAndLoadProducts() {
    const params = window.UtilHelpers.getUrlParams();
    
    if (params.useNewAPI && params.categoryId) {
      if (window.UtilHelpers.isValidCategoryId(params.categoryId)) {
        await this.loadProducts(params.categoryId, params.categoryName || '');
      } else {
        window.UtilHelpers.showErrorMessage(
          'productContainer', 
          'Category ID không hợp lệ'
        );
      }
    } else {
      this.showCategorySelectionGuide();
    }
  }

  // Show category selection guide
  showCategorySelectionGuide() {
    const container = document.getElementById('productContainer');
    if (!container) return;

    container.innerHTML = `
      <div style="
        text-align: center;
        padding: 60px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 16px;
        margin: 20px;
      ">
        <div style="font-size: 4rem; margin-bottom: 24px;">🛍️</div>
        <h2 style="margin-bottom: 16px;">Chào mừng đến với cửa hàng!</h2>
        <p style="font-size: 1.2rem; margin-bottom: 24px;">
          Vui lòng chọn một danh mục từ menu để xem sản phẩm
        </p>
        <div style="margin-top: 20px;">
          <i class="fa-solid fa-arrow-up" style="font-size: 2rem; animation: bounce 2s infinite;"></i>
        </div>
      </div>
    `;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('products.html')) {
    const productManager = new window.ProductManager();
    productManager.checkUrlAndLoadProducts();
  }
});

// Export to global
window.ProductManager = ProductManager;
