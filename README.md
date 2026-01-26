# Yarden Site - Updated

## What's New

### 1. Release Section Color Themes
- **Muse** - Yellow theme (golden glow effect on scroll)
- **The One Who Descends** - Cream/amber theme (warm glow effect on scroll)

The colors morph as you scroll through the releases.

### 2. Full CMS Admin Dashboard

Access the admin panel at `/admin/passes`

**Features by Section:**

#### Releases Management
- Add/edit/delete music releases
- Upload cover art from phone (tap the image to upload)
- Or paste image URL directly
- Configure all streaming platform links (Spotify, Apple Music, YouTube, etc.)
- Add tracklist with featured artists
- Set release type (EP, Album, Single)
- Toggle visibility (enabled/disabled)

#### Videos Management
- Add/edit/delete music videos
- Paste YouTube URL and thumbnail auto-imports
- Supports: youtu.be and youtube.com URLs
- Set video type (Official Video, Music Video, Visualizer)
- Add tags like "New"
- Toggle visibility

#### Tour Management
- Add/edit/delete tour dates
- Upload tour poster from phone
- Set show status (Announced, On Sale, Sold Out)
- Configure ticket portal link
- Edit headline and description

#### Merch Management
- Add/edit/delete merchandise items
- Upload product images from phone
- Set price and availability
- Add tags (New, Limited, etc.)

#### Newsletter Management
- Add/edit press items with images
- Add embed videos with YouTube IDs
- Upload background image

### 3. Mobile-Friendly Image Upload
All image fields support:
- Tap to upload from device camera roll
- Works on phones for easy content updates
- Supported formats: JPEG, PNG, WebP, GIF
- Max size: 10MB

### 4. YouTube Auto-Import
When you paste a YouTube URL in the videos section:
- Thumbnail is automatically imported
- Video ID is extracted and shown
- Preview thumbnail displays in editor

### 5. Pass Generator
The pass generator is working:
- Fill in name, email, phone
- Select Angel or Descendant
- Generates a unique pass with QR-like member mark
- Saves to storage (in-memory for dev, Vercel KV for production)
- Can download as PNG

## Setup

1. Extract the zip
2. Run `npm install`
3. Set `ADMIN_PASSWORD` in `.env.local`
4. Run `npm run dev`
5. Access admin at `http://localhost:3000/admin/passes`

## Environment Variables

```env
# Required for admin access
ADMIN_PASSWORD=your-secure-password

# Optional: Vercel KV for production storage
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
```

## Admin Login
Use the password set in `ADMIN_PASSWORD` environment variable.

## File Structure

```
app/
├── admin/passes/          # Admin dashboard
├── api/
│   ├── admin/
│   │   ├── cms/           # CMS API routes
│   │   ├── login/         # Admin auth
│   │   ├── passes/        # Pass management
│   │   └── upload/        # Image upload
│   └── passes/            # Public pass API
content/
├── cmsTypes.ts           # TypeScript types for CMS
└── defaultCms.ts         # Default content data
components/landing/        # All section components
libs/
└── passStorage.ts        # Pass storage with fallback
public/uploads/           # Uploaded images go here
```
