// ========================================
// PRODUCT CARD COMPONENT
// ========================================

class ProductCard {
  constructor(product) {
    this.product = product;
  }

  // Create product card element
  createElement() {
    console.log('🎯 Creating card for product:', this.product.name || this.product.id);
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cssText = `
      border: 1px solid #e9ecef;
      border-radius: 16px;
      padding: 20px;
      background: white;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      min-height: 300px;
    `;
    
    this.addHoverEffects(card);
    card.innerHTML = this.getCardHTML();
    this.addEventListeners(card);
    
    console.log('✅ Card created successfully for:', this.product.name);
    return card;
  }

  // Add hover effects
  addHoverEffects(card) {
    card.addEventListener('mouseenter', () => {
      card.style.transform = 'translateY(-8px)';
      card.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
      card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)';
    });
  }

  // Get product price info
  getPriceInfo() {
    let price = 0;
    let originalPrice = null;
    let stock = 0;

    if (this.product.variants && this.product.variants.length > 0) {
      price = this.product.variants[0].price;
      originalPrice = this.product.variants[0].actualPrice;
      stock = this.product.variants[0].stock || this.product.variants[0].quantity || 0;
    } else if (this.product.price) {
      price = this.product.price;
      stock = this.product.stock || 0;
    }

    return { price, originalPrice, stock };
  }

  // Get product image URL - sử dụng GoogleDriveImageHelper
  getImageUrl() {
    console.log('🖼️ Getting image URL for product card:', this.product.name || this.product.id);
    
    // Sử dụng GoogleDriveImageHelper nếu có
    if (window.GoogleDriveImageHelper) {
      const imageSource = this.product.optimizedImageUrl || 
                         this.product.imageUrl || 
                         this.product.image || 
                         this.product.googleDriveId;
      
      const processedUrl = window.GoogleDriveImageHelper.processGoogleDriveImage(imageSource, {
        fallback: './public/images/cart_logo.png'
      });
      
      console.log('✅ Product card image processed:', {
        original: imageSource,
        processed: processedUrl
      });
      
      return processedUrl;
    }
    
    // Fallback xử lý cũ
    let imageUrl = this.product.imageUrl || this.product.image || './public/images/cart_logo.png';
    if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('./')) {
      imageUrl = './public/images/' + imageUrl;
    }
    return imageUrl;
  }

  // Create badges
  createBadges() {
    const { price, originalPrice, stock } = this.getPriceInfo();
    let badges = '';
    
    // Stock badge
    if (stock > 0) {
      badges += `
        <span style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        ">Còn hàng</span>
      `;
    } else {
      badges += `
        <span style="
          position: absolute;
          top: 12px;
          right: 12px;
          background: linear-gradient(135deg, #dc3545, #c82333);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        ">Hết hàng</span>
      `;
    }
    
    // Discount badge
    if (originalPrice && originalPrice > price) {
      const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
      badges += `
        <span style="
          position: absolute;
          top: 12px;
          left: 12px;
          background: linear-gradient(135deg, #ff6b6b, #ee5a24);
          color: white;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        ">-${discount}%</span>
      `;
    }
    
    return badges;
  }

  // Get main card HTML
  getCardHTML() {
    const { price, originalPrice, stock } = this.getPriceInfo();
    const imageUrl = this.getImageUrl();
    const badges = this.createBadges();
    
    return `
      ${badges}
      
      <div style="
        width: 100%;
        height: 200px;
        background: #f8f9fa;
        border-radius: 12px;
        margin-bottom: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      ">
        <img src="${imageUrl}" alt="${this.product.name || 'Sản phẩm'}" 
             style="
               width: 100%;
               height: 100%;
               object-fit: cover;
               transition: transform 0.3s ease;
             "
             onerror="this.src='./public/images/cart_logo.png'; console.warn('❌ Failed to load image:', '${imageUrl}');"
             onload="console.log('✅ Image loaded successfully:', '${imageUrl}');"
        />
      </div>
      
      <div style="padding: 0 4px;">
        <h3 style="
          margin: 0 0 8px 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">${this.product.name || 'Tên sản phẩm'}</h3>
        
        <p style="
          margin: 0 0 12px 0;
          color: #7f8c8d;
          font-size: 0.9rem;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        ">${this.product.description || 'Mô tả sản phẩm'}</p>
        
        <div style="margin-bottom: 16px;">
          ${originalPrice && originalPrice > price ? `
            <span style="
              text-decoration: line-through;
              color: #95a5a6;
              font-size: 0.9rem;
              margin-right: 8px;
            ">${this.formatPrice(originalPrice)}</span>
          ` : ''}
          
          <span style="
            font-size: 1.2rem;
            font-weight: 700;
            color: #e74c3c;
          ">${price ? this.formatPrice(price) : 'Liên hệ'}</span>
        </div>
        
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        ">
          <span style="
            font-size: 0.85rem;
            color: ${stock > 0 ? '#27ae60' : '#e74c3c'};
            font-weight: 500;
          ">
            ${stock > 0 ? `Còn ${stock} sản phẩm` : 'Hết hàng'}
          </span>
          
          <button class="add-to-cart-btn" style="
            background: linear-gradient(135deg, #3498db, #2980b9);
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            ${stock <= 0 ? 'opacity: 0.6; cursor: not-allowed;' : ''}
          " ${stock <= 0 ? 'disabled' : ''}>
            <i class="fa-solid fa-cart-plus" style="margin-right: 4px;"></i>
            ${stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
          </button>
        </div>
      </div>
    `;
  }

  // Format price
  formatPrice(price) {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Add event listeners
  addEventListeners(card) {
    const addToCartBtn = card.querySelector('.add-to-cart-btn');
    if (addToCartBtn && !addToCartBtn.disabled) {
      addToCartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.addToCart();
      });
      
      addToCartBtn.addEventListener('mouseenter', () => {
        addToCartBtn.style.background = 'linear-gradient(135deg, #2980b9, #1f3a93)';
        addToCartBtn.style.transform = 'translateY(-1px)';
      });
      
      addToCartBtn.addEventListener('mouseleave', () => {
        addToCartBtn.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
        addToCartBtn.style.transform = 'translateY(0)';
      });
    }
  }

  // Add to cart functionality
  addToCart() {
    console.log('🛒 Adding to cart:', this.product.name);
    
    // Create toast notification
    this.showToast(`Đã thêm "${this.product.name}" vào giỏ hàng!`, 'success');
  }

  // Show toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#27ae60' : '#3498db'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
}

// Export globally
window.ProductCard = ProductCard;
