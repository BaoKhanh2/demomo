// ========================================
// PRODUCT DETAIL TEMPLATES - HTML Templates
// ========================================

class ProductDetailTemplates {
  
  // createProductImage: Tạo phần hình ảnh sản phẩm
  static createProductImage(product, getProductImageFn) {
    const mainImage = getProductImageFn(product);
    let images = product.images || [mainImage];
    
    // Xử lý tất cả images qua helper function
    images = images.map(img => {
      if (typeof img === 'string' && img !== mainImage) {
        return getProductImageFn({ imageUrl: img });
      }
      return img;
    });
    
    console.log('🖼️ Processed images:', { mainImage, images });
    
    return `
      <div class="product-images">
        <div class="main-image-container">
          <img id="mainProductImage" 
               src="${mainImage}" 
               alt="${product.name || 'Sản phẩm'}"
               class="main-product-image"
               onerror="console.log('❌ Main image failed:', this.src); this.src='./public/images/cart_logo.png'"
               onload="console.log('✅ Main image loaded:', this.src)"
          />
        </div>
        <div class="image-thumbnails">
          ${images.slice(0, 4).map((img, index) => `
            <div class="thumbnail ${index === 0 ? 'active' : ''}" 
                 onclick="window.productDetailManager.changeMainImage('${img}', this)">
              <img src="${img}" 
                   alt="Thumbnail ${index + 1}"
                   onerror="console.log('❌ Thumbnail failed:', this.src); this.src='./public/images/cart_logo.png'"
                   onload="console.log('✅ Thumbnail loaded:', this.src)" />
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // createProductHeader: Tạo header sản phẩm
  static createProductHeader(product, formatPriceFn) {
    return `
      <div class="product-header">
        <h1 class="product-title">${product.name || 'Tên sản phẩm không có'}</h1>
        
        <div class="product-meta">
          <span class="meta-badge id">ID: ${product.id || 'N/A'}</span>
          
          ${product.price ? `
            <span class="meta-badge price">Giá: ${formatPriceFn(product.price)}</span>
          ` : ''}
          
          ${product.brand ? `
            <span class="meta-badge brand">Thương hiệu: ${product.brand}</span>
          ` : ''}
          
          ${product.categoryId ? `
            <span class="meta-badge category">Danh mục: ${product.categoryId}</span>
          ` : ''}

          ${product.status ? `
            <span class="meta-badge status">${product.status}</span>
          ` : ''}
        </div>
      </div>
    `;
  }

  // createProductDescription: Tạo mô tả sản phẩm
  static createProductDescription(product) {
    return `
      <div class="product-description">
        <h3 class="section-title">Mô tả sản phẩm</h3>
        <p class="description-text">${product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
      </div>
    `;
  }

  // createProductSpecifications: Tạo bảng thông số
  static createProductSpecifications(product) {
    const specs = [
      { label: 'Mã sản phẩm', value: product.id },
      { label: 'Tên sản phẩm', value: product.name },
      { label: 'Thương hiệu', value: product.brand },
      { label: 'Danh mục ID', value: product.categoryId },
      { label: 'Hình ảnh chính', value: product.imageUrl },
      { label: 'Số lượng variant', value: product.variant ? `${product.variant.length} phiên bản` : '0' },
      { label: 'Trạng thái', value: product.status || 'Có sẵn' }
    ].filter(spec => spec.value && spec.value !== 'N/A');

    if (specs.length === 0) return '';

    return `
      <div class="product-specifications">
        <h3 class="section-title">Thông số kỹ thuật</h3>
        <div class="specs-table">
          ${specs.map((spec, index) => `
            <div class="spec-row">
              <div class="spec-label">${spec.label}</div>
              <div class="spec-value">${spec.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // createVariantSelector: Tạo selector variant
  static createVariantSelector(product) {
    const variants = product.variant || product.variants || [];
    console.log('🎯 createVariantSelector debug:', {
      productVariant: product.variant,
      productVariants: product.variants,
      variants: variants,
      variantsLength: variants.length
    });
    
    if (!variants || variants.length === 0) {
      console.log('⚠️ No variants found, showing fallback message');
      return `
        <div class="variant-selector">
          <h3 class="section-title">Phiên bản sản phẩm</h3>
          <div class="no-variants-message" style="
            padding: 16px;
            background: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #ffc107;
            color: #856404;
          ">
            <i class="fas fa-info-circle" style="margin-right: 8px;"></i>
            Sản phẩm này chỉ có một phiên bản duy nhất.
          </div>
        </div>
      `;
    }

    // Tạo danh sách unique attributes
    const attributeGroups = {};
    variants.forEach((variant, variantIndex) => {
      if (variant.attributes) {
        variant.attributes.forEach(attr => {
          if (!attributeGroups[attr.attribute]) {
            attributeGroups[attr.attribute] = new Set();
          }
          attributeGroups[attr.attribute].add(JSON.stringify({
            value: attr.value,
            variantIndex: variantIndex,
            price: variant.price,
            quantity: variant.quantity,
            variantId: variant.id
          }));
        });
      }
    });

    console.log('🔍 Attribute groups created:', attributeGroups);
    console.log('🔍 Attribute groups keys:', Object.keys(attributeGroups));

    if (Object.keys(attributeGroups).length === 0) {
      console.log('⚠️ No attribute groups found, returning empty string');
      return '';
    }

    return `
      <div class="variant-selector">
        <h3 class="section-title">Chọn phiên bản</h3>
        
        ${Object.entries(attributeGroups).map(([attributeName, values]) => {
          const valueArray = Array.from(values).map(v => JSON.parse(v));
          
          return `
            <div class="attribute-group">
              <label class="attribute-label">${attributeName}:</label>
              
              <div class="attribute-options">
                ${valueArray.map((option, index) => `
                  <button 
                    class="variant-option ${index === 0 ? 'selected' : ''}" 
                    data-attribute="${attributeName}"
                    data-value="${option.value}"
                    data-variant-index="${option.variantIndex}"
                    data-variant-id="${option.variantId}"
                    data-price="${option.price}"
                    data-quantity="${option.quantity}"
                    onclick="window.productDetailManager.selectVariantOption(this)"
                  >
                    ${option.value}
                    ${option.quantity <= 0 ? '<span class="out-of-stock">Hết hàng</span>' : ''}
                  </button>
                `).join('')}
              </div>
            </div>
          `;
        }).join('')}
        
        <div id="selectedVariantInfo" class="selected-variant-info">
          <div class="selected-variant-title">Phiên bản đã chọn:</div>
          <div id="selectedVariantDetails">
            <span style="color: #666;">Vui lòng chọn các tùy chọn above</span>
          </div>
        </div>
      </div>
    `;
  }

  // createActionButtons: Tạo các nút hành động
  static createActionButtons() {
    return `
      <div class="product-actions">
        <button id="addToCartBtn" class="btn-primary">
          <i class="fas fa-cart-plus"></i>
          Thêm vào giỏ hàng
        </button>
        
        <button id="backBtn" class="btn-secondary">
          <i class="fas fa-arrow-left"></i>
          Quay lại
        </button>
      </div>
    `;
  }

  // createVariantsSection: Tạo phần chi tiết variants
  static createVariantsSection(product, formatPriceFn) {
    const variants = product.variant || product.variants || [];
    if (!variants || variants.length === 0) return '';

    return `
      <div class="product-variants">
        <h3 class="section-title">Phiên bản sản phẩm (${variants.length})</h3>
        <div class="variants-grid">
          ${variants.map((variant, index) => `
            <div class="variant-card">
              <h4 class="variant-card-title">Phiên bản ${index + 1}</h4>
              
              <div class="variant-card-price">
                ${variant.price ? formatPriceFn(variant.price) : 'Liên hệ'}
              </div>
              
              <div class="variant-card-info">
                SKU: <strong>${variant.skuCode || 'N/A'}</strong>
              </div>
              
              <div class="variant-card-info">
                Tồn kho: <strong class="variant-card-stock ${variant.quantity > 0 ? 'in-stock' : 'out-of-stock'}">
                  ${variant.quantity || 0}
                </strong>
              </div>
              
              ${variant.attributes && variant.attributes.length > 0 ? `
                <div class="variant-attributes">
                  <div class="variant-attributes-title">Thuộc tính:</div>
                  <div class="variant-attributes-list">
                    ${variant.attributes.map(attr => `
                      <span class="variant-attribute-tag">${attr.attribute}: ${attr.value}</span>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // createLoadingState: Tạo trạng thái loading
  static createLoadingState() {
    return `
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p style="margin: 0; font-size: 1.1rem;">Đang tải chi tiết sản phẩm...</p>
        <p style="margin: 8px 0 0 0; font-size: 0.9rem; color: #999;">
          Đang thử kết nối đến các API khác nhau...
        </p>
      </div>
    `;
  }

  // createErrorState: Tạo trạng thái lỗi
  static createErrorState(message) {
    return `
      <div class="error-container">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 20px;"></i>
        <h3 style="margin: 0 0 16px 0;">Có lỗi xảy ra</h3>
        <p style="margin: 0 0 24px 0;">${message}</p>
        <div class="error-actions">
          <button onclick="window.productDetailManager.retryLoad()" class="error-btn primary">
            <i class="fas fa-refresh" style="margin-right: 8px;"></i>
            Thử lại
          </button>
          <button onclick="history.back()" class="error-btn secondary">
            <i class="fas fa-arrow-left" style="margin-right: 8px;"></i>
            Quay lại
          </button>
        </div>
      </div>
    `;
  }

  // createSelectedVariantInfo: Tạo thông tin variant đã chọn
  static createSelectedVariantInfo(bestMatch, selectedOptions, formatPriceFn) {
    return `
      <div class="selected-variant-grid">
        <div class="selected-variant-item">
          <span>Giá:</span>
          <span class="selected-variant-value" style="color: #007bff; font-size: 1.1rem;">
            ${formatPriceFn(bestMatch.price)}
          </span>
        </div>
        <div class="selected-variant-item">
          <span>Tồn kho:</span>
          <span class="selected-variant-value" style="color: ${bestMatch.quantity > 0 ? '#4caf50' : '#f44336'};">
            ${bestMatch.quantity} sản phẩm
          </span>
        </div>
        <div class="selected-variant-item">
          <span>SKU:</span>
          <span class="selected-variant-value" style="color: #333; font-size: 0.9rem;">
            ${bestMatch.skuCode || 'N/A'}
          </span>
        </div>
      </div>
      <div class="selected-variant-tags">
        <span style="color: #666; font-size: 0.9rem;">Lựa chọn:</span>
        ${selectedOptions.map(([attr, data]) => `
          <span class="selected-variant-tag">${attr}: ${data.value}</span>
        `).join('')}
      </div>
    `;
  }
}

// Export cho global access
window.ProductDetailTemplates = ProductDetailTemplates;
