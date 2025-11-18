# Cloud Upload Feature - Setup Guide

## Overview

The image editor now supports uploading images from cloud storage services including:
- **Google Drive**
- **OneDrive**
- **Dropbox**
- **Box**
- **Direct URL** (works immediately without setup)

## Quick Start - URL Upload (No Setup Required)

The easiest way to upload from cloud storage is using the **Direct URL** method:

1. Click "Tải từ đám mây" button on the upload screen
2. Switch to "URL trực tiếp" tab
3. Paste the direct image URL
4. Click "Tải ảnh"

### Getting Direct URLs:

**Google Drive:**
```
1. Right-click file → Share
2. Set to "Anyone with the link"
3. Convert the URL:
   From: https://drive.google.com/file/d/FILE_ID/view
   To:   https://drive.google.com/uc?export=view&id=FILE_ID
```

**OneDrive:**
```
1. Click Share → Copy link
2. Replace ?e=view with ?download=1
```

**Imgur/Flickr:**
```
Right-click image → Copy image address
```

## Advanced Setup - Native Integrations

For native file pickers (optional), you'll need to set up API keys:

### Google Drive

1. Create project at [Google Cloud Console](https://console.cloud.google.com)
2. Enable Google Picker API
3. Create API Key and OAuth 2.0 Client ID
4. Add to `.env`:
```env
REACT_APP_GOOGLE_API_KEY=your_api_key
REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
```

### OneDrive

1. Register app at [Azure Portal](https://portal.azure.com)
2. Configure permissions: Files.Read.All
3. Add to `.env`:
```env
REACT_APP_ONEDRIVE_CLIENT_ID=your_client_id
```

### Dropbox

1. Create app at [Dropbox App Console](https://www.dropbox.com/developers/apps)
2. Get App Key
3. Add to `.env`:
```env
REACT_APP_DROPBOX_APP_KEY=your_app_key
```

## Components

### CloudUploadModal
- Main modal component for cloud upload
- Provides two tabs: Cloud providers and Direct URL
- Handles URL fetching and file conversion

### CloudIntegrationGuide
- Comprehensive setup documentation
- Step-by-step instructions for each provider
- Code examples and troubleshooting

## Features

✅ **Direct URL Upload** - Works immediately without API keys
✅ **Multiple Cloud Providers** - Support for major cloud services
✅ **CORS Handling** - Automatically fetches images from public URLs
✅ **Error Handling** - Clear error messages for common issues
✅ **File Validation** - Ensures uploaded files are valid images
✅ **Responsive UI** - Works on all device sizes

## Security Notes

⚠️ **Important:**
- Never commit `.env` files to version control
- Add `.env` to `.gitignore`
- API keys should be kept secret
- For production, use backend proxy for API calls
- This app is not intended for collecting PII or sensitive data

## Troubleshooting

**CORS Errors:**
- Some websites block cross-origin requests
- Use services that support CORS (Imgur, Unsplash, etc.)
- For testing, use CORS proxy (development only)
- Download and re-upload as alternative

**Invalid URL:**
- Ensure URL is a direct link to the image file
- URL should end with image extension (.jpg, .png, etc.)
- Make sure the resource is publicly accessible

**API Integration:**
- Check that API keys are correctly set in `.env`
- Verify OAuth redirect URIs are configured
- Ensure required permissions are granted
- Check browser console for detailed errors

## Future Enhancements

Potential improvements:
- [ ] Add more cloud providers (iCloud, Amazon Photos, etc.)
- [ ] Batch upload multiple images
- [ ] Save edited images back to cloud storage
- [ ] Integration with photo libraries (Unsplash, Pexels API)
- [ ] QR code scanner for easy mobile-to-desktop transfer

## Usage Example

```typescript
// In UploadScreen component
import { CloudUploadModal } from './components/CloudUploadModal';

<Button onClick={() => setShowCloudModal(true)}>
  <Cloud className="w-4 h-4" />
  Tải từ đám mây
</Button>

{showCloudModal && (
  <CloudUploadModal
    onImageLoad={handleImageUpload}
    onClose={() => setShowCloudModal(false)}
  />
)}
```

## License

This feature is part of the image editor application and follows the same license.
