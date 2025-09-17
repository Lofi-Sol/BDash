# Netlify Deployment Guide for BDash

This guide will help you deploy the BDash betting dashboard to Netlify.

## Prerequisites

- GitHub repository: [https://github.com/Lofi-Sol/BDash](https://github.com/Lofi-Sol/BDash)
- Netlify account (free tier available)

## Deployment Steps

### Method 1: Deploy from GitHub (Recommended)

1. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"

2. **Connect Repository**
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your repositories
   - Select `Lofi-Sol/BDash` repository

3. **Configure Build Settings**
   - **Build command**: Leave empty (static site)
   - **Publish directory**: `.` (root directory)
   - **Branch to deploy**: `main`

4. **Deploy**
   - Click "Deploy site"
   - Wait for deployment to complete
   - Your site will be available at `https://[random-name].netlify.app`

### Method 2: Manual Deploy

1. **Build the site locally**
   ```bash
   # No build step needed for static site
   # Just ensure all files are ready
   ```

2. **Deploy to Netlify**
   - Go to Netlify dashboard
   - Drag and drop the entire project folder
   - Or use Netlify CLI:
   ```bash
   npm install -g netlify-cli
   netlify deploy --prod --dir .
   ```

## Configuration Files

The following files have been created for optimal Netlify deployment:

### `netlify.toml`
- Main configuration file
- Defines redirects, headers, and build settings
- Handles SPA routing

### `public/_redirects`
- Redirects all routes to the dashboard
- Handles API redirects if needed

### `public/_headers`
- Security headers
- Caching policies
- Content Security Policy

### `index.html`
- Landing page with loading animation
- SEO optimized
- Redirects to main dashboard

## Environment Variables (Optional)

If you need to configure environment variables:

1. Go to Site settings → Environment variables
2. Add any required variables:
   - `GOOGLE_SHEETS_URL` (if using different URL)
   - `API_BASE_URL` (if using different API)

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Add your custom domain
3. Configure DNS settings as instructed
4. Enable HTTPS (automatic with Netlify)

## Features Included

- ✅ **SPA Routing**: All routes redirect to dashboard
- ✅ **Security Headers**: XSS protection, content type options
- ✅ **Caching**: Optimized cache headers for static assets
- ✅ **SEO**: Meta tags and Open Graph support
- ✅ **Performance**: Preloading and optimized delivery
- ✅ **Mobile Responsive**: Works on all devices

## Troubleshooting

### Common Issues

1. **404 on refresh**
   - Solution: `_redirects` file handles this
   - All routes redirect to dashboard

2. **CORS errors**
   - Solution: Google Sheets API handles CORS
   - Check API URL configuration

3. **Slow loading**
   - Solution: Caching headers optimize delivery
   - CDN automatically enabled

### Support

- Check Netlify deployment logs
- Verify all files are in the repository
- Ensure `netlify.toml` is in root directory

## Post-Deployment

After successful deployment:

1. **Test the dashboard**
   - Verify all features work
   - Check betting functionality
   - Test Google Sheets integration

2. **Configure Google Sheets**
   - Update API URL if needed
   - Test bet saving functionality

3. **Monitor performance**
   - Use Netlify analytics
   - Check for any errors

## URL Structure

- **Main Dashboard**: `https://[site-name].netlify.app/`
- **Direct Dashboard**: `https://[site-name].netlify.app/Dashboard/bettingdashboard.html`
- **API Endpoints**: Handled by redirects

Your BDash dashboard is now ready for production deployment! 🚀
