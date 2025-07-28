// ========================================
// PRODUCT DETAIL PAGE - Tinh giản và tối ưu
// ========================================

// ProductDetailManager: Quản lý trang chi tiết sản phẩm
class ProductDetailManager {
  constructor() {
    this.currentProduct = null;
    this.selectedVariantData = {};
    this.selectedVariant = null;
  }

  // loadProductDetail: Tải chi tiết sản phẩm từ API
  async loadProductDetail(productId) {
    if (!productId) {
      this.showError('Không có ID sản phẩm để hiển thị');
      return;
    }

    try {
      console.log(`🔍 Loading product detail for ID: ${productId}`);
      this.showLoading();
      
      const product = await window.apiClient.getProductDetail(productId);
      ProductDetailHelpers.validateProductData(product);
      
      console.log('🔍 Complete product object:', product);
      console.log('🔍 Product keys:', Object.keys(product));
      
      this.currentProduct = product;
      this.displayProductDetail(product);
      
    } catch (error) {
      console.error(`❌ Failed to load product detail:`, error);
      this.showError(`Không thể tải chi tiết sản phẩm: ${error.message}`);
    }
  }

  // displayProductDetail: Hiển thị chi tiết sản phẩm
  displayProductDetail(product) {
    const container = document.getElementById('productDetailContainer');
    if (!container) {
      console.error("❌ Không tìm thấy container");
      return;
    }

    // Debug variants
    console.log('🔍 Product variants debug:', {
      variant: product.variant,
      variants: product.variants,
      hasVariant: !!(product.variant && product.variant.length > 0),
      hasVariants: !!(product.variants && product.variants.length > 0)
    });

    // Cập nhật title và heading
    ProductDetailHelpers.updatePageTitle(product.name);
    ProductDetailHelpers.updatePageHeading(product.name);

    // Tạo HTML với templates
    container.innerHTML = `
      <div class="product-detail-wrapper">
        <div class="product-detail-grid">
          ${ProductDetailTemplates.createProductImage(product, ProductDetailHelpers.getProductImage)}
          
          <div class="product-info">
            ${ProductDetailTemplates.createProductHeader(product, ProductDetailHelpers.formatPrice)}
            ${ProductDetailTemplates.createProductDescription(product)}
            ${ProductDetailTemplates.createProductSpecifications(product)}
            ${ProductDetailTemplates.createVariantSelector(product)}
            ${ProductDetailTemplates.createActionButtons()}
          </div>
        </div>
        
        ${ProductDetailTemplates.createVariantsSection(product, ProductDetailHelpers.formatPrice)}
      </div>
    `;

    this.initializeEventListeners();
  }

  // selectVariantOption: Xử lý khi chọn variant option
  selectVariantOption(selectedButton) {
    const attribute = selectedButton.dataset.attribute;
    const value = selectedButton.dataset.value;
    const variantIndex = parseInt(selectedButton.dataset.variantIndex);
    const variantId = selectedButton.dataset.variantId;
    const price = parseFloat(selectedButton.dataset.price);
    const quantity = parseInt(selectedButton.dataset.quantity);

    // Cập nhật UI
    ProductDetailHelpers.updateVariantButtons(attribute, selectedButton);

    // Lưu lựa chọn
    this.selectedVariantData[attribute] = {
      value, variantIndex, variantId, price, quantity
    };

    // Cập nhật thông tin hiển thị
    this.updateSelectedVariantInfo();
    console.log('🎯 Selected variant data:', this.selectedVariantData);
  }

  // updateSelectedVariantInfo: Cập nhật thông tin variant đã chọn
  updateSelectedVariantInfo() {
    const infoContainer = document.getElementById('selectedVariantDetails');
    if (!infoContainer) return;

    const selectedOptions = Object.entries(this.selectedVariantData);
    
    if (selectedOptions.length === 0) {
      infoContainer.innerHTML = '<span style="color: #666;">Vui lòng chọn các tùy chọn above</span>';
      return;
    }

    // Tìm variant phù hợp nhất
    const variants = this.currentProduct.variant || [];
    const bestMatch = ProductDetailHelpers.findBestMatchVariant(variants, this.selectedVariantData);

    if (bestMatch) {
      infoContainer.innerHTML = ProductDetailTemplates.createSelectedVariantInfo(
        bestMatch, 
        selectedOptions, 
        ProductDetailHelpers.formatPrice
      );
      this.selectedVariant = bestMatch;
    }
  }

  // changeMainImage: Thay đổi ảnh chính
  changeMainImage(imageSrc, thumbnail) {
    const mainImg = document.getElementById('mainProductImage');
    if (mainImg) {
      mainImg.src = imageSrc;
    }
    ProductDetailHelpers.updateThumbnails(thumbnail);
  }

  // addToCart: Thêm sản phẩm vào giỏ hàng
  addToCart() {
    if (!this.currentProduct) return;

    if (this.selectedVariant) {
      const cartData = {
        productId: this.currentProduct.id,
        productName: this.currentProduct.name,
        variantId: this.selectedVariant.id,
        variantSku: this.selectedVariant.skuCode,
        price: this.selectedVariant.price,
        quantity: 1,
        selectedOptions: this.selectedVariantData
      };
      
      ProductDetailHelpers.logCartAction(cartData);
      ProductDetailHelpers.createToast(`Đã thêm "${this.currentProduct.name}" vào giỏ hàng!`, 'success');
    } else {
      ProductDetailHelpers.createToast('Vui lòng chọn phiên bản sản phẩm trước khi thêm vào giỏ hàng!', 'error');
      
      const variantSelector = document.querySelector('.variant-selector');
      ProductDetailHelpers.scrollToElement(variantSelector);
      ProductDetailHelpers.highlightElement(variantSelector);
    }
  }

  // goBack: Quay lại trang trước
  goBack() {
    const params = ProductDetailHelpers.getUrlParams();
    const productUrl = ProductDetailHelpers.buildProductUrl(params.categoryId, params.categoryName);
    
    if (productUrl) {
      window.location.href = productUrl;
    } else {
      history.back();
    }
  }

  // retryLoad: Thử lại load sản phẩm
  retryLoad() {
    const params = ProductDetailHelpers.getUrlParams();
    if (params.id) {
      this.loadProductDetail(params.id);
    }
  }

  // showLoading: Hiển thị trạng thái loading
  showLoading() {
    const container = document.getElementById('productDetailContainer');
    if (container) {
      container.innerHTML = ProductDetailTemplates.createLoadingState();
    }
  }

  // showError: Hiển thị lỗi
  showError(message) {
    const container = document.getElementById('productDetailContainer');
    if (container) {
      container.innerHTML = ProductDetailTemplates.createErrorState(message);
    }
  }

  // initializeEventListeners: Khởi tạo event listeners
  initializeEventListeners() {
    const addToCartBtn = document.getElementById('addToCartBtn');
    const backBtn = document.getElementById('backBtn');
    
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => this.addToCart());
    }
    
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goBack());
    }
  }

  // init: Khởi tạo trang chi tiết sản phẩm
  async init() {
    const params = ProductDetailHelpers.getUrlParams();
    
    if (params.id) {
      await this.loadProductDetail(params.id);
    } else {
      this.showError('Không tìm thấy ID sản phẩm trong URL');
    }
  }
}

// Khởi tạo khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('product-detail.html')) {
    window.productDetailManager = new ProductDetailManager();
    window.productDetailManager.init();
  }
});

window.ProductDetailManager = ProductDetailManager;

window.ProductDetailManager = ProductDetailManager;
