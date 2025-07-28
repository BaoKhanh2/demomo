# Google Drive Image Integration

This feature allows you to connect Google Drive images with your product data instead of using local files.

## Features

- ✅ **Google Drive URL Processing**: Automatically converts Google Drive sharing links to direct image URLs
- ✅ **Fallback Support**: Falls back to local images if Google Drive images fail to load
- ✅ **Admin Interface**: Easy-to-use interface for managing Google Drive image connections
- ✅ **URL Format Support**: Supports multiple Google Drive URL formats
- ✅ **Error Handling**: Graceful handling of failed image loads with placeholder images

## Supported Google Drive URL Formats

1. **Sharing Link**: `https://drive.google.com/file/d/FILE_ID/view?usp=sharing`
2. **Open Link**: `https://drive.google.com/open?id=FILE_ID`
3. **File ID Only**: Just the file ID string

## How to Use

### 1. Upload Image to Google Drive
- Upload your product image to Google Drive
- Right-click the image and select "Share"
- Set sharing to "Anyone with the link can view"
- Copy the sharing link

### 2. Connect Image via Admin Interface
- Access the Google Drive Image Manager at: `/google-drive-manager.html`
- Find the product you want to update
- Paste the Google Drive sharing link into the "Google Drive URL" field
- Click "Cập nhật Google Drive" (Update Google Drive)
- The image source will change from "Local File" to "Google Drive"

### 3. Remove Google Drive Connection
- In the admin interface, click "Xóa Google Drive" (Remove Google Drive)
- The product will revert to using its local image file

## Data Structure

The system adds optional Google Drive fields to your product data:

```json
{
  "id": 1,
  "name": "Product Name",
  "image": "../images/local-image.png",
  "googleDriveImageUrl": "https://drive.google.com/file/d/FILE_ID/view",
  "googleDriveImageId": "FILE_ID"
}
```

## Image Priority

The system uses the following priority for images:
1. **Google Drive Image ID** (if available)
2. **Google Drive Image URL** (if available and ID not set)
3. **Local Image** (fallback)

## Technical Implementation

### Files Added/Modified

- `js/googleDriveManager.js`: Core functionality for Google Drive URL processing
- `google-drive-manager.html`: Admin interface for managing connections
- `js/homeProductsCards.js`: Updated to support Google Drive images
- `js/showAddToCartCards.js`: Updated to support Google Drive images
- `public/images/placeholder.svg`: Fallback image for failed loads

### Key Functions

- `extractGoogleDriveFileId(url)`: Extract file ID from various URL formats
- `getGoogleDriveImageUrl(fileId)`: Convert file ID to direct image URL
- `getBestImageUrl(product)`: Get the best available image URL for a product
- `processGoogleDriveUrl(url)`: Process any Google Drive URL format

## Benefits

1. **Centralized Storage**: Store all product images in Google Drive
2. **Easy Management**: Use Google Drive's interface for organizing images
3. **Sharing**: Easy sharing and collaboration on product images
4. **Backup**: Automatic backup through Google Drive
5. **CDN**: Google Drive provides global CDN for fast image loading
6. **Flexible**: Maintains compatibility with existing local images

## Notes

- Google Drive images may be subject to CORS restrictions in some browsers
- For production use, consider using Google Drive API for better reliability
- The system gracefully falls back to local images if Google Drive fails
- All existing functionality remains unchanged when not using Google Drive images