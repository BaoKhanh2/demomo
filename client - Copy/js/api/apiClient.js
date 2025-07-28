// ========================================
// API CLIENT
// ========================================

class ApiClient {
  constructor() {
    this.baseUrl = 'http://localhost:8060';
    this.categoryApiUrl = 'http://localhost:8000'; // API riêng cho categories và sản phẩm theo category
    this.timeout = 8000;
    this.maxRetries = 2;
  }

  // Generic API call with retry
  async apiCall(url, options = {}, retries = this.maxRetries) {
    console.log('🔗 API Call starting:', url);
    
    for (let i = 0; i <= retries; i++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);
        
        console.log(`📡 Attempt ${i + 1}/${retries + 1} for: ${url}`);
        
        const response = await fetch(url, {
          ...options,
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('📊 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('✅ API Response received:', data);
        console.log('📋 Response structure:', {
          hasData: !!data.data,
          hasResult: !!data.result,
          isArray: Array.isArray(data),
          keys: Object.keys(data)
        });
        
        return data;
        
      } catch (error) {
        window.UtilHelpers.logWithTime(`API attempt ${i + 1} failed: ${error.message}`, 'warn');
        
        if (i < retries) {
          await window.UtilHelpers.delay((i + 1) * 1000);
        } else {
          throw error;
        }
      }
    }
  }

  // Test API availability
  async testApiAvailability(baseUrl = this.baseUrl) {
    try {
      const response = await Promise.race([
        fetch(`${baseUrl}/products`, { method: 'HEAD' }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 2000)
        )
      ]);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Get products from API - Lấy sản phẩm từ API theo categoryId
  async getProducts(categoryId = null) {
    let url;
    
    if (categoryId) {
      // Sử dụng API chuyên biệt cho sản phẩm theo category
      url = `${this.categoryApiUrl}/product/products/category/${categoryId}`;
    } else {
      // Tất cả sản phẩm từ API chính
      url = `${this.baseUrl}/products`;
    }
    
    console.log(`🔗 Fetching products from: ${url}`);
    console.log(`📋 CategoryId: ${categoryId}`);
    
    try {
      const data = await this.apiCall(url);
      
      console.log('🎯 Raw API data:', data);
      console.log('🔍 Data type:', typeof data);
      console.log('🔍 Data is array?', Array.isArray(data));
      console.log('🔍 Data keys:', data ? Object.keys(data) : 'null/undefined');
      
      // Thử các cách parse khác nhau - ưu tiên productList/productlist trước
      let products = [];
      
      // 1. Kiểm tra result.productList (API c10 trả về result.productList với 4 sản phẩm)
      if (data.result && data.result.productList && Array.isArray(data.result.productList)) {
        products = data.result.productList;
        console.log('✅ Using data.result.productList array:', products.length);
      }
      // 2. Kiểm tra data.productList (viết hoa)
      else if (data.productList && Array.isArray(data.productList)) {
        products = data.productList;
        console.log('✅ Using data.productList array:', products.length);
      }
      // 3. Kiểm tra data.productlist (viết thường)
      else if (data.productlist && Array.isArray(data.productlist)) {
        products = data.productlist;
        console.log('✅ Using data.productlist array:', products.length);
      }
      // 4. Kiểm tra nếu response là array trực tiếp
      else if (Array.isArray(data)) {
        products = data;
        console.log('✅ Using direct array:', products.length);
      } 
      // 5. Kiểm tra data.data
      else if (data.data && Array.isArray(data.data)) {
        products = data.data;
        console.log('✅ Using data.data array:', products.length);
      } 
      // 6. Kiểm tra data.result nếu là array
      else if (data.result && Array.isArray(data.result)) {
        products = data.result;
        console.log('✅ Using data.result array:', products.length);
      } 
      // 7. Kiểm tra data.products
      else if (data.products && Array.isArray(data.products)) {
        products = data.products;
        console.log('✅ Using data.products array:', products.length);
      } 
      // 6. Kiểm tra nếu data là object có properties như products
      else if (data && typeof data === 'object') {
        // Tìm property đầu tiên là array
        const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        if (arrayKey) {
          products = data[arrayKey];
          console.log(`✅ Using data.${arrayKey} array:`, products.length);
        } else {
          console.warn('⚠️ No array property found in object');
          console.log('🔍 Full object structure:', JSON.stringify(data, null, 2));
          products = [];
        }
      }
      // 7. Fallback - không tìm thấy gì
      else {
        console.warn('⚠️ No valid product array found in response');
        console.log('🔍 Full response data:', JSON.stringify(data, null, 2));
        products = [];
      }
      
      console.log(`📦 Final parsed products count: ${products.length}`);
      
      // Nếu productlist rỗng, trả về mảng rỗng
      if (products.length === 0) {
        console.log('📭 No products found for category:', categoryId);
        return [];
      }
      
      if (products.length > 0) {
        console.log('📊 Sample product structure:', products[0]);
        console.log('🔍 Products with children:', products.filter(p => p.children && p.children.length > 0));
        
        // Xử lý Google Drive images cho tất cả sản phẩm
        products = await this.processAllProductImages(products);
      }
      
      window.UtilHelpers.logWithTime(`Loaded ${products.length} products from API`);
      return products;
      
    } catch (error) {
      console.error('❌ getProducts error:', error);
      window.UtilHelpers.logWithTime(`Products API failed: ${error.message}`, 'error');
      return [];
    }
  }

  // Get categories - Lấy danh mục từ API - không sử dụng fallback
  async getCategories() {
    try {
      const data = await this.apiCall(`${this.categoryApiUrl}/product/categories/tree`);
      
      // Parse categories từ response
      let categories = [];
      if (Array.isArray(data.result)) {
        categories = data.result;
      } else if (Array.isArray(data.data)) {
        categories = data.data;
      } else if (Array.isArray(data)) {
        categories = data;
      }
      
      console.log(`📊 ApiClient loaded ${categories.length} categories`);
      return categories;
      
    } catch (error) {
      console.error(`❌ Categories API failed: ${error.message}`);
      // Không trả về fallback để tránh hiển thị dữ liệu mẫu
      return [];
    }
  }

  // Get subcategories - Lấy danh mục con theo parent ID
  async getSubcategories(parentId) {
    try {
      const data = await this.apiCall(`${this.categoryApiUrl}/product/categories/tree`);
      const categories = data.data || data.result || data || [];
      
      // Tìm danh mục cha và trả về children
      const parentCategory = categories.find(cat => cat.id === parentId);
      return parentCategory?.children || [];
      
    } catch (error) {
      window.UtilHelpers.logWithTime(`Subcategories API failed: ${error.message}`, 'warn');
      return [];
    }
  }

  // getProductDetail: Lấy chi tiết sản phẩm theo ID - API tổng quát
  async getProductDetail(productId) {
    if (!productId) {
      throw new Error('Product ID is required');
    }

    // Thử nhiều API endpoints khác nhau
    const possibleUrls = [
      `${this.baseUrl}/products/${productId}`,           // API chính
      `${this.categoryApiUrl}/product/products/${productId}`, // API category
      `http://localhost:8080/products/${productId}`,     // API backup từ Postman
    ];

    console.log(`� Trying to fetch product detail for ID: ${productId}`);
    
    for (const url of possibleUrls) {
      try {
        console.log(`📡 Attempting: ${url}`);
        const data = await this.apiCall(url);
        
        console.log('🎯 Product detail raw data:', data);
        
        // Parse response data linh hoạt
        let product = null;
        
        if (data.data) {
          product = data.data;
          console.log('✅ Found product in data.data');
        } else if (data.result) {
          product = data.result;
          console.log('✅ Found product in data.result');
        } else if (data.id) {
          // Trường hợp sản phẩm trả về trực tiếp
          product = data;
          console.log('✅ Found product as direct response');
        }
        
        if (product && product.id) {
          console.log(`✅ Product detail loaded successfully from: ${url}`);
          
          // Tự động xử lý ảnh của sản phẩm
          const processedProduct = await this.processProductImages(product);
          return processedProduct;
        } else {
          console.warn(`⚠️ Product not found in response from: ${url}`);
        }
        
      } catch (error) {
        console.warn(`⚠️ Failed to fetch from ${url}: ${error.message}`);
        // Tiếp tục với URL tiếp theo
      }
    }
    
    // Nếu tất cả URLs đều thất bại
    throw new Error(`Không thể tải chi tiết sản phẩm từ bất kỳ API nào. ID: ${productId}`);
  }

  // getOptimizedImageUrl: Lấy URL ảnh tối ưu từ nhiều nguồn (deprecated - use GoogleDriveImageHelper)
  async getOptimizedImageUrl(imageSource) {
    console.log('🔍 Processing image source (deprecated method):', imageSource);
    
    // Sử dụng GoogleDriveImageHelper nếu có
    if (window.GoogleDriveImageHelper) {
      return window.GoogleDriveImageHelper.processGoogleDriveImage(imageSource, {
        fallback: './public/images/cart_logo.png'
      });
    }
    
    // Fallback xử lý cũ
    console.log('⚠️ Using deprecated image processing - consider using GoogleDriveImageHelper');
    
    // Nếu là Google Drive ID
    if (imageSource && !imageSource.startsWith('http') && imageSource.length > 10) {
      console.log('🔍 Detected Google Drive ID:', imageSource);
      const driveUrl = `https://drive.google.com/uc?id=${imageSource}&export=view`;
      console.log('✅ Created Google Drive direct URL:', driveUrl);
      return driveUrl;
    }
    
    // Nếu là Google Drive sharing URL
    if (imageSource && imageSource.includes('drive.google.com/file/d/')) {
      const fileIdMatch = imageSource.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
      if (fileIdMatch) {
        const fileId = fileIdMatch[1];
        const driveUrl = `https://drive.google.com/uc?id=${fileId}&export=view`;
        console.log('✅ Converted sharing URL to direct URL:', driveUrl);
        return driveUrl;
      }
    }
    
    // Nếu đã là Google Drive uc URL, thêm export=view nếu chưa có
    if (imageSource && imageSource.includes('drive.google.com/uc?id=')) {
      if (!imageSource.includes('export=view')) {
        const enhancedUrl = imageSource + '&export=view';
        console.log('✅ Enhanced Google Drive URL:', enhancedUrl);
        return enhancedUrl;
      }
    }
    
    // Return as-is for regular URLs
    console.log('ℹ️ Using original URL:', imageSource);
    return imageSource || './public/images/cart_logo.png';
  }

  // processProductImages: Xử lý tất cả ảnh của sản phẩm
  async processProductImages(product) {
    if (!product) return product;
    
    console.log('🖼️ Processing images for product:', product.id || product.name);
    
    // Sử dụng GoogleDriveImageHelper nếu có
    if (window.GoogleDriveImageHelper) {
      // Xử lý ảnh chính
      if (product.imageUrl || product.image || product.googleDriveId) {
        const mainImageSource = product.imageUrl || product.image || product.googleDriveId;
        product.optimizedImageUrl = window.GoogleDriveImageHelper.processGoogleDriveImage(mainImageSource);
        console.log('✅ Processed main image:', product.optimizedImageUrl);
      }
      
      // Xử lý mảng ảnh nếu có
      if (product.images && Array.isArray(product.images)) {
        product.optimizedImages = window.GoogleDriveImageHelper.batchProcessImages(product.images);
        console.log('✅ Processed image array:', product.optimizedImages);
      }
      
      // Xử lý variant images nếu có
      if (product.variant && Array.isArray(product.variant)) {
        product.variant.forEach((variant, index) => {
          if (variant.image || variant.imageUrl) {
            const variantImageSource = variant.image || variant.imageUrl;
            variant.optimizedImageUrl = window.GoogleDriveImageHelper.processGoogleDriveImage(variantImageSource);
            console.log(`✅ Processed variant ${index} image:`, variant.optimizedImageUrl);
          }
        });
      }
    }
    
    return product;
  }

  // processAllProductImages: Xử lý Google Drive images cho tất cả sản phẩm
  async processAllProductImages(products) {
    if (!Array.isArray(products)) {
      console.warn('⚠️ Products must be an array');
      return products;
    }

    console.log('🖼️ Processing Google Drive images for all products...');
    
    const processedProducts = await Promise.all(
      products.map(async (product) => {
        try {
          return await this.processProductImages(product);
        } catch (error) {
          console.warn(`⚠️ Failed to process images for product ${product.id}:`, error.message);
          return product; // Trả về sản phẩm gốc nếu lỗi
        }
      })
    );

    console.log('✅ Completed processing images for all products');
    return processedProducts;
  }
}

// Create global instance
window.apiClient = new ApiClient();
