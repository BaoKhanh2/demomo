// ========================================
// PRODUCT UI HELPERS - Các hàm hỗ trợ UI sản phẩm
// ========================================

class ProductUIHelpers {
  // createHeader: Tạo header cho danh mục
  static createHeader(categoryName, productCount, isParentProduct = false) {
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <h1>
        <i class="fas fa-${isParentProduct ? 'sitemap' : 'cube'}" style="margin-right: 15px;"></i>
        ${categoryName}
      </h1>
      <p>${productCount} sản phẩm có sẵn</p>
      <div style="margin-top: 15px;">
        <span class="category-filter-badge">
          <i class="fas fa-${isParentProduct ? 'baby' : 'filter'}" style="margin-right: 5px;"></i>
          ${isParentProduct ? 'Sản phẩm con' : 'Lọc theo danh mục'}
        </span>
      </div>
    `;
    return header;
  }

  // createBreadcrumb: Tạo breadcrumb navigation
  static createBreadcrumb(parentProductName) {
    const breadcrumb = document.createElement('div');
    breadcrumb.className = 'product-breadcrumb';
    breadcrumb.innerHTML = `
      <a href="#" class="breadcrumb-item" onclick="window.history.back()">
        <i class="fas fa-home"></i> Danh mục
      </a>
      <span class="breadcrumb-separator">></span>
      <span class="breadcrumb-item active">${parentProductName}</span>
    `;
    return breadcrumb;
  }

  // createEmptyState: Tạo trạng thái rỗng
  static createEmptyState(categoryName = '') {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <div class="empty-state-icon">
        <i class="fas fa-search"></i>
      </div>
      <h3 class="empty-state-title">
        ${categoryName ? `Không tìm thấy sản phẩm trong "${categoryName}"` : 'Không có sản phẩm nào'}
      </h3>
      <p class="empty-state-description">
        ${categoryName ? 
          'Danh mục này hiện chưa có sản phẩm. Hãy thử danh mục khác hoặc quay lại sau.' :
          'Vui lòng chọn danh mục từ menu phía trên để xem sản phẩm.'
        }
      </p>
      <div class="empty-state-buttons">
        <button onclick="window.history.back()" class="empty-state-btn back">
          <i class="fas fa-arrow-left"></i> Quay lại
        </button>
        <button onclick="location.reload()" class="empty-state-btn reload">
          <i class="fas fa-refresh"></i> Tải lại
        </button>
      </div>
    `;
    return emptyState;
  }

  // createProductGrid: Tạo grid sản phẩm
  static createProductGrid(products) {
    console.log('🎯 createProductGrid called with', products.length, 'products');
    
    const grid = document.createElement('div');
    grid.className = 'products-grid';
    
    console.log('✅ Grid element created');
    
    products.forEach((product, index) => {
      console.log(`📦 Creating card ${index + 1}:`, product.name || product.id);
      
      if (!window.ProductCard) {
        console.error('❌ ProductCard class not found!');
        return;
      }
      
      const productCard = new window.ProductCard(product);
      const cardElement = productCard.createElement();
      console.log('✅ Card element created for:', product.name);
      grid.appendChild(cardElement);
    });
    
    console.log('✅ All cards added to grid, returning grid');
    return grid;
  }

  // createWelcomeGuide: Tạo màn hình chào mừng
  static createWelcomeGuide() {
    const guide = document.createElement('div');
    guide.className = 'category-selection-guide';
    guide.innerHTML = `
      <div class="guide-icon">🛍️</div>
      <h2 class="guide-title">Chào mừng đến với cửa hàng!</h2>
      <p class="guide-description">
        Vui lòng chọn một danh mục từ menu để xem sản phẩm
      </p>
      <div class="guide-arrow">
        <i class="fa-solid fa-arrow-up"></i>
      </div>
    `;
    return guide;
  }
}

// Export global
window.ProductUIHelpers = ProductUIHelpers;
