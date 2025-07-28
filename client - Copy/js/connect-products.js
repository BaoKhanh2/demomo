// ========================================
// PRODUCT MANAGER - Tối ưu hóa
// ========================================

class ProductManager {
  constructor() {
    this.currentProducts = [];
    this.currentCategory = null;
    this.currentSubcategories = [];
    this.selectedSubcategory = null;
    this.currentParent = null;
  }

  // loadProducts: Tải sản phẩm theo danh mục hoặc parent product
  async loadProducts(categoryId = null, categoryName = '', parentProduct = null) {
    try {
      window.UtilHelpers.showLoadingState();
      
      let products;
      if (parentProduct?.children?.length > 0) {
        products = parentProduct.children;
        categoryName = `${parentProduct.name} - Sản phẩm con`;
      } else {
        products = await window.apiClient.getProducts(categoryId);
        if (categoryId && !parentProduct) {
          this.currentSubcategories = await window.apiClient.getSubcategories(categoryId);
        }
      }
      
      this.currentProducts = products;
      this.currentCategory = { id: categoryId, name: categoryName };
      this.currentParent = parentProduct;
      
      this.displayProducts(products, categoryName, parentProduct);
      
    } catch (error) {
      window.UtilHelpers.showErrorMessage('productContainer', 'Không thể tải sản phẩm.');
    }
  }

  // displayProducts: Hiển thị sản phẩm với UI helper
  displayProducts(products, categoryName = '', parentProduct = null) {
    const container = document.getElementById('productContainer');
    if (!container) return;

    container.innerHTML = '';

    // Header danh mục
    if (categoryName) {
      const header = document.createElement('div');
      header.style.cssText = `
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 20px;
        text-align: center;
      `;
      header.innerHTML = `
        <h1 style="margin: 0; color: #333;">${categoryName}</h1>
        <p style="margin: 10px 0 0 0; color: #666;">${products.length} sản phẩm có sẵn</p>
      `;
      container.appendChild(header);
    }

    // Hierarchy cho sản phẩm cha
    if (!parentProduct && products.length > 0) {
      this.showProductHierarchy(container, products);
    }

    // Subcategories
    if (this.currentSubcategories?.length > 0 && !parentProduct) {
      container.appendChild(this.createSubcategorySection());
    }

    // Hiển thị sản phẩm hoặc empty state
    if (products.length === 0) {
      if (categoryName) {
        const emptyState = document.createElement('div');
        emptyState.style.cssText = `
          text-align: center;
          padding: 60px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          color: #666;
        `;
        emptyState.innerHTML = `
          <div style="font-size: 3rem; margin-bottom: 20px;">📭</div>
          <h3>Không tìm thấy sản phẩm trong "${categoryName}"</h3>
          <p>Danh mục này hiện chưa có sản phẩm. Hãy thử danh mục khác.</p>
        `;
        container.appendChild(emptyState);
      }
    } else {
      // Tạo product grid đơn giản
      const grid = document.createElement('div');
      grid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
        padding: 20px;
      `;
      
      products.forEach(product => {
        // Sử dụng ProductCard class với hỗ trợ Google Drive images
        const productCard = new window.ProductCard(product);
        const cardElement = productCard.createElement();
        
        // Add click handler để navigate tới chi tiết sản phẩm
        cardElement.onclick = () => {
          const categoryId = this.currentCategory?.id || '';
          const categoryName = this.currentCategory?.name || '';
          const url = `product-detail.html?id=${product.id}&categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`;
          window.location.href = url;
        };
        
        grid.appendChild(cardElement);
      });
      
      container.appendChild(grid);
    }
  }

  // showProductHierarchy: Hiển thị sản phẩm có children
  showProductHierarchy(container, products) {
    const productsWithChildren = products.filter(p => p.children?.length > 0);
    if (productsWithChildren.length === 0) return;

    const section = document.createElement('div');
    section.className = 'product-hierarchy';
    section.innerHTML = `<div class="hierarchy-title"><i class="fas fa-sitemap"></i> Cấu trúc sản phẩm</div>`;

    productsWithChildren.forEach(product => {
      const item = document.createElement('div');
      item.className = 'hierarchy-item has-children';
      item.innerHTML = `
        <span class="hierarchy-item-name">${product.name}</span>
        <span class="hierarchy-item-count">${product.children.length} sản phẩm con</span>
      `;
      item.onclick = () => this.loadProducts(null, `${product.name} - Sản phẩm con`, product);
      section.appendChild(item);
    });

    container.appendChild(section);
  }

  // createSubcategorySection: Tạo section subcategories
  createSubcategorySection() {
    const container = document.createElement('div');
    container.className = 'subcategory-container';
    
    const header = document.createElement('div');
    header.className = 'subcategory-header';
    header.innerHTML = `
      <h3 class="subcategory-title">
        <i class="fas fa-layer-group" style="margin-right: 10px;"></i>
        Danh mục con
      </h3>
      <span class="subcategory-count">${this.currentSubcategories.length} danh mục</span>
    `;
    
    const list = document.createElement('div');
    list.className = 'subcategory-list';
    
    // Tất cả sản phẩm option
    const allOption = this.createSubcategoryItem('Tất cả sản phẩm', null, 'th');
    list.appendChild(allOption);
    
    // Subcategory items
    this.currentSubcategories.forEach(sub => {
      const item = this.createSubcategoryItem(sub.name, sub.id, 'tag');
      list.appendChild(item);
    });
    
    container.appendChild(header);
    container.appendChild(list);
    return container;
  }

  // createSubcategoryItem: Tạo item subcategory
  createSubcategoryItem(name, id, icon) {
    const item = document.createElement('div');
    item.className = `subcategory-item${this.selectedSubcategory === id ? ' active' : ''}`;
    item.innerHTML = `<i class="fas fa-${icon}" style="margin-right: 8px;"></i>${name}`;
    item.onclick = () => this.selectSubcategory(id, name);
    return item;
  }

  // selectSubcategory: Chọn subcategory
  async selectSubcategory(subcategoryId = null, subcategoryName = '') {
    this.selectedSubcategory = subcategoryId;
    const categoryToLoad = subcategoryId || this.currentCategory?.id;
    const nameToDisplay = subcategoryName || this.currentCategory?.name;
    await this.loadProducts(categoryToLoad, nameToDisplay);
  }

  // checkUrlAndLoadProducts: Kiểm tra URL và load sản phẩm
  async checkUrlAndLoadProducts() {
    const params = window.UtilHelpers.getUrlParams();
    
    if (params.categoryId) {
      await this.loadProducts(params.categoryId, params.categoryName || '');
    } else {
      this.showWelcomeGuide();
    }
  }

  // showWelcomeGuide: Hiển thị màn hình chào mừng
  showWelcomeGuide() {
    const container = document.getElementById('productContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    const guide = document.createElement('div');
    guide.style.cssText = `
      text-align: center;
      padding: 80px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 15px;
      color: white;
      margin: 20px;
    `;
    guide.innerHTML = `
      <div style="font-size: 4rem; margin-bottom: 20px;">🛍️</div>
      <h2 style="margin: 0 0 20px 0; font-size: 2rem;">Chào mừng đến với cửa hàng!</h2>
      <p style="margin: 0; font-size: 1.1rem; opacity: 0.9;">
        Vui lòng chọn một danh mục từ menu để xem sản phẩm
      </p>
      <div style="margin-top: 30px; font-size: 2rem;">↑</div>
    `;
    container.appendChild(guide);
  }

  // Static methods
  static navigateToDetail(productId) {
    // Sử dụng parameter 'id' thay vì 'productId' để match với product-detail.js
    window.location.href = `product-detail.html?id=${productId}`;
    window.UtilHelpers.logWithTime(`Navigate to product detail: ${productId}`);
  }

  static addToCart(productId) {
    window.UtilHelpers.logWithTime(`Add to cart: ${productId}`);
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('products.html')) {
    const productManager = new window.ProductManager();
    // Lưu instance global để ProductCard có thể truy cập
    window.productManagerInstance = productManager;
    productManager.checkUrlAndLoadProducts();
  }
});

window.ProductManager = ProductManager;
