# 🖼️ Hướng dẫn sử dụng Google Drive Images

## Tổng quan
Hệ thống này hỗ trợ tự động chuyển đổi và hiển thị ảnh từ Google Drive thông qua nhiều format khác nhau.

## 🔧 Cách thiết lập

### 1. Chuẩn bị ảnh trên Google Drive

1. **Upload ảnh lên Google Drive**
2. **Chia sẻ ảnh public:**
   - Click chuột phải vào ảnh → "Share" → "Get link"
   - Chọn "Anyone with the link can view"
   - Copy link hoặc file ID

### 2. Các format được hỗ trợ

#### Format 1: Google Drive File ID (khuyến nghị)
```javascript
// Chỉ cần file ID
const product = {
  id: "1",
  name: "Áo thun",
  imageUrl: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
}
```

#### Format 2: Google Drive Sharing URL
```javascript
const product = {
  id: "1", 
  name: "Áo thun",
  imageUrl: "https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing"
}
```

#### Format 3: Google Drive UC URL
```javascript
const product = {
  id: "1",
  name: "Áo thun", 
  imageUrl: "https://drive.google.com/uc?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms&export=view"
}
```

### 3. Cách lấy Google Drive File ID

#### Từ sharing URL:
```
URL: https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view?usp=sharing
File ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

#### Từ Google Drive interface:
1. Click chuột phải → "Get link"
2. Copy URL
3. Extract phần ID từ URL

## 🚀 Cách sử dụng trong code

### 1. Automatic Processing (Tự động)
Hệ thống sẽ tự động xử lý khi load sản phẩm:

```javascript
// Trong API response, chỉ cần trả về:
{
  "id": "1",
  "name": "Áo thun", 
  "imageUrl": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
  "images": [
    "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "1ABC123xyz456def789",
    "./public/images/backup.png"
  ]
}
```

### 2. Manual Processing (Thủ công)
```javascript
// Xử lý 1 ảnh
const processedUrl = window.GoogleDriveImageHelper.processGoogleDriveImage(
  "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
);

// Xử lý nhiều ảnh
const images = ["id1", "id2", "id3"];
const processedImages = window.GoogleDriveImageHelper.batchProcessImages(images);

// Kiểm tra loại ảnh
const isGoogleDriveId = window.GoogleDriveImageHelper.isGoogleDriveId("1BxiMVs0XRA5...");
```

### 3. Trong database/API

#### SQL Database:
```sql
CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(255),
  image_url VARCHAR(255), -- Lưu Google Drive ID hoặc full URL
  google_drive_id VARCHAR(100), -- Lưu riêng Drive ID nếu cần
  images TEXT -- JSON array của các image IDs
);

-- Ví dụ data:
INSERT INTO products VALUES (
  1, 
  'Áo thun',
  '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  '["1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", "1ABC123xyz456"]'
);
```

#### JSON API Response:
```json
{
  "data": {
    "id": 1,
    "name": "Áo thun",
    "imageUrl": "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
    "images": [
      "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
      "https://drive.google.com/file/d/1ABC123xyz/view",
      "./public/images/fallback.png"
    ],
    "variant": [
      {
        "id": "v1",
        "name": "Size M",
        "image": "1DEF456ghi789jkl"
      }
    ]
  }
}
```

## 🎯 Các trường hợp sử dụng

### 1. Sản phẩm với ảnh chính
```javascript
const product = {
  imageUrl: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
};
// Tự động chuyển thành: https://drive.google.com/uc?id=1BxiMVs0XRA5...&export=view
```

### 2. Sản phẩm với gallery ảnh
```javascript
const product = {
  images: [
    "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms", // Google Drive ID
    "1ABC123xyz456def789", // Google Drive ID khác
    "./public/images/local.png" // Local image
  ]
};
```

### 3. Variants với ảnh riêng
```javascript
const product = {
  variant: [
    {
      id: "red",
      name: "Màu đỏ",
      image: "1RED123colorimage456"
    },
    {
      id: "blue", 
      name: "Màu xanh",
      image: "1BLUE789colorimage123"
    }
  ]
};
```

## 🛠️ Các utility functions

### Kiểm tra và validate:
```javascript
// Kiểm tra Google Drive ID
GoogleDriveImageHelper.isGoogleDriveId("1BxiMVs0XRA5..."); // true/false

// Kiểm tra local path
GoogleDriveImageHelper.isLocalPath("./images/test.png"); // true/false

// Extract Google Drive ID từ URL
GoogleDriveImageHelper.extractGoogleDriveId("https://drive.google.com/file/d/1ABC/view");
// Returns: "1ABC"
```

### Tạo URL đặc biệt:
```javascript
// Tạo thumbnail URL
GoogleDriveImageHelper.createThumbnailUrl("1BxiMVs0XRA5...", 200);
// Returns: https://drive.google.com/thumbnail?id=1BxiMVs0...&sz=s200

// Validate ảnh (async)
await GoogleDriveImageHelper.validateImageUrl("https://...");

// Preload ảnh
await GoogleDriveImageHelper.preloadImage("https://...");
```

## 🔍 Testing và Debug

### 1. Test với file demo:
Mở `google-drive-image-test.html` để test các format ảnh khác nhau.

### 2. Console logs:
Hệ thống sẽ log chi tiết quá trình xử lý:
```
🖼️ Getting product image for: Áo thun
📸 Processing Google Drive image: 1BxiMVs0XRA5...
✅ Converted Drive ID to direct URL: https://drive.google.com/uc?id=...
```

### 3. Fallback handling:
Nếu ảnh không load được, sẽ tự động dùng ảnh fallback:
```javascript
// Default fallback
'./public/images/cart_logo.png'

// Custom fallback
GoogleDriveImageHelper.processGoogleDriveImage(imageId, {
  fallback: './custom-fallback.png'
});
```

## 📝 Best Practices

### 1. Chuẩn bị ảnh:
- Tối ưu kích thước ảnh trước khi upload (< 2MB)
- Sử dụng format JPG cho ảnh sản phẩm
- Đặt tên file có ý nghĩa

### 2. Trong database:
- Lưu Google Drive ID thay vì full URL để dễ quản lý
- Có ảnh fallback cho trường hợp Google Drive lỗi
- Backup ảnh quan trọng ở nhiều nơi

### 3. Performance:
- Sử dụng preloadImage() cho ảnh quan trọng
- Batch process nhiều ảnh cùng lúc
- Cache processed URLs nếu cần

### 4. Error handling:
- Luôn có ảnh fallback
- Log errors để debug
- Validate ảnh trước khi hiển thị

## 🚨 Lưu ý quan trọng

1. **Google Drive Limitations:**
   - Có giới hạn bandwidth
   - Cần public sharing
   - Có thể bị rate limit

2. **Security:**
   - Chỉ share ảnh cần thiết
   - Không để thông tin nhạy cảm trong ảnh
   - Kiểm tra permissions định kỳ

3. **Backup:**
   - Luôn có local backup
   - Sử dụng CDN cho production
   - Test định kỳ để đảm bảo ảnh vẫn accessible
