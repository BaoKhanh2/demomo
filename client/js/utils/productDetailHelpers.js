// ========================================
// PRODUCT DETAIL HELPERS - Utility Functions
// ========================================

class ProductDetailHelpers {
  
  // getProductImage: Lấy ảnh sản phẩm từ nhiều nguồn và xử lý Google Drive
  static getProductImage(product) {
    console.log('🖼️ Getting product image for:', product.name || product.id);
    
    // Thử các sources khác nhau theo thứ tự ưu tiên
    const imageSources = [
      product.optimizedImageUrl,
      product.imageUrl,
      product.image,
      product.thumbnail,
      product.photo,
      product.googleDriveId
    ].filter(Boolean);
    
    console.log('🖼️ Available image sources:', imageSources);
    
    // Nếu không có source nào
    if (imageSources.length === 0) {
      console.warn('⚠️ No image sources found for product');
      return './public/images/cart_logo.png';
    }
    
    // Sử dụng source đầu tiên và xử lý qua GoogleDriveImageHelper
    const primarySource = imageSources[0];
    
    // Sử dụng GoogleDriveImageHelper nếu có
    if (window.GoogleDriveImageHelper) {
      const processedUrl = window.GoogleDriveImageHelper.processGoogleDriveImage(primarySource, {
        fallback: './public/images/cart_logo.png'
      });
      console.log('🎯 Final processed image URL:', processedUrl);
      return processedUrl;
    }
    
    // Fallback xử lý basic nếu không có GoogleDriveImageHelper
    return this.basicImageProcessing(primarySource);
  }

  // basicImageProcessing: Xử lý ảnh cơ bản (fallback)
  static basicImageProcessing(imageUrl) {
    if (!imageUrl) return './public/images/cart_logo.png';
    
    // Xử lý Google Drive URLs cơ bản
    if (imageUrl.includes('drive.google.com/file/d/')) {
      const fileIdMatch = imageUrl.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        return `https://drive.google.com/uc?id=${fileId}&export=view`;
      }
    }
    
    // Fallback to array images
    if (!imageUrl && product.images && product.images.length > 0) {
      imageUrl = this.getProductImage({ imageUrl: product.images[0] });
    }
    
    // Fallback to default image
    if (!imageUrl) {
      imageUrl = './public/images/cart_logo.png';
      console.log('⚠️ Using fallback image');
    }
    
    console.log('🎯 Final imageUrl:', imageUrl);
    return imageUrl;
  }

  // formatPrice: Format giá tiền
  static formatPrice(price) {
    if (!price) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // findBestMatchVariant: Tìm variant phù hợp nhất
  static findBestMatchVariant(variants, selectedVariantData) {
    let bestMatch = null;
    let matchScore = 0;

    variants.forEach((variant, index) => {
      let score = 0;
      if (variant.attributes) {
        variant.attributes.forEach(attr => {
          if (selectedVariantData[attr.attribute] && 
              selectedVariantData[attr.attribute].value === attr.value) {
            score++;
          }
        });
      }
      
      if (score > matchScore) {
        matchScore = score;
        bestMatch = { ...variant, index: index };
      }
    });

    return bestMatch;
  }

  // createToast: Tạo và hiển thị toast notification
  static createToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  }

  // updateThumbnails: Cập nhật active thumbnail
  static updateThumbnails(selectedThumbnail) {
    document.querySelectorAll('.thumbnail').forEach(t => {
      t.classList.remove('active');
    });
    if (selectedThumbnail) {
      selectedThumbnail.classList.add('active');
    }
  }

  // updateVariantButtons: Cập nhật trạng thái variant buttons
  static updateVariantButtons(attribute, selectedButton) {
    // Remove selected từ buttons cùng attribute group
    const sameAttributeButtons = document.querySelectorAll(`[data-attribute="${attribute}"]`);
    sameAttributeButtons.forEach(btn => {
      btn.classList.remove('selected');
    });

    // Thêm selected cho button được chọn
    selectedButton.classList.add('selected');
  }

  // scrollToElement: Scroll smooth đến element
  static scrollToElement(element, options = {}) {
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        ...options 
      });
    }
  }

  // highlightElement: Tạm thời highlight element
  static highlightElement(element, color = 'rgba(220, 53, 69, 0.3)', duration = 2000) {
    if (element) {
      element.style.boxShadow = `0 0 20px ${color}`;
      setTimeout(() => {
        element.style.boxShadow = 'none';
      }, duration);
    }
  }

  // testGoogleDriveImage: Test xem Google Drive image có load được không
  static async testGoogleDriveImage(imageUrl) {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        console.log('⏱️ Image loading timeout:', imageUrl);
        resolve(false);
      }, 5000); // 5 second timeout
      
      img.onload = function() {
        clearTimeout(timeout);
        console.log('✅ Image loaded successfully:', imageUrl);
        resolve(true);
      };
      
      img.onerror = function() {
        clearTimeout(timeout);
        console.log('❌ Image failed to load:', imageUrl);
        resolve(false);
      };
      
      img.src = imageUrl;
    });
  }

  // preloadImages: Preload tất cả images của sản phẩm
  static async preloadImages(product) {
    const mainImage = this.getProductImage(product);
    const images = product.images || [];
    
    console.log('🔄 Preloading images...');
    
    // Test main image
    const mainImageWorks = await this.testGoogleDriveImage(mainImage);
    
    // Test other images
    const imageTests = await Promise.all(
      images.map(img => this.testGoogleDriveImage(this.getProductImage({ imageUrl: img })))
    );
    
    console.log('📊 Image test results:', {
      mainImage: { url: mainImage, works: mainImageWorks },
      otherImages: images.map((img, i) => ({
        url: this.getProductImage({ imageUrl: img }),
        works: imageTests[i]
      }))
    });
    
    return {
      mainImage: mainImageWorks ? mainImage : './public/images/cart_logo.png',
      workingImages: images.filter((img, i) => imageTests[i])
    };
  }

  // validateProductData: Kiểm tra dữ liệu sản phẩm
  static validateProductData(product) {
    if (!product) {
      throw new Error('Dữ liệu sản phẩm không hợp lệ');
    }
    
    if (!product.id) {
      throw new Error('Sản phẩm không có ID');
    }
    
    return true;
  }

  // getUrlParams: Lấy parameters từ URL
  static getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
      id: params.get('id'),
      categoryId: params.get('categoryId'),
      categoryName: params.get('categoryName')
    };
  }

  // updatePageTitle: Cập nhật title trang
  static updatePageTitle(productName) {
    document.title = `${productName || 'Sản phẩm'} - Chi tiết`;
  }

  // updatePageHeading: Cập nhật heading trang
  static updatePageHeading(productName) {
    const heading = document.querySelector('.section-common--heading');
    if (heading) {
      heading.textContent = `Chi tiết sản phẩm: ${productName || 'Không có tên'}`;
    }
  }

  // logCartAction: Log hành động thêm vào giỏ hàng
  static logCartAction(productData) {
    console.log('🛒 Adding to cart with variant:', {
      productId: productData.productId,
      productName: productData.productName,
      variantId: productData.variantId,
      variantSku: productData.variantSku,
      price: productData.price,
      quantity: productData.quantity || 1,
      selectedOptions: productData.selectedOptions
    });
  }

  // buildProductUrl: Tạo URL sản phẩm với category params
  static buildProductUrl(categoryId, categoryName) {
    if (categoryId) {
      return `products.html?categoryId=${categoryId}&categoryName=${encodeURIComponent(categoryName)}`;
    }
    return null;
  }
}

// Export cho global access
window.ProductDetailHelpers = ProductDetailHelpers;
