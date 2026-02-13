# FuelWatch South Sudan - Netlify Deployment Guide

This guide will help you deploy the FuelWatch South Sudan application to Netlify.

## Prerequisites

- A GitHub/GitLab/Bitbucket account
- A Netlify account
- A Gemini API key (get it from https://aistudio.google.com/app/apikey)

## Deployment Steps

### Step 1: Push Your Code to Git

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

```
bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

### Step 2: Connect to Netlify

1. Go to [Netlify](https://www.netlify.com) and sign in
2. Click "Add new site" → "Import an existing project"
3. Connect your Git provider and select your repository
4. Configure the build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18 (or leave as default)

### Step 3: Set Environment Variables

In the Netlify dashboard, go to **Site settings → Environment Variables** and add:

| Key | Value |
|-----|-------|
| GEMINI_API_KEY | your_actual_gemini_api_key |

To get a Gemini API key:
1. Go to https://aistudio.google.com/app/apikey
2. Create a new API key
3. Copy and paste it into the Netlify environment variable

### Step 4: Deploy

1. Click "Deploy site" in the Netlify dashboard
2. Wait for the build to complete (check the "Deploys" tab)
3. Once deployed, you'll get a live URL (e.g., `your-site-name.netlify.app`)

### Step 5: Custom Domain (Optional)

If you want a custom domain:
1. Go to **Domain management** in Netlify
2. Add your custom domain
3. Update your DNS records as instructed by Netlify

## Troubleshooting

### Build Fails
- Make sure all dependencies are properly installed
- Check that the Node version is compatible (18+)
- Verify environment variables are set correctly

### App Not Loading
- Check the redirect rules in netlify.toml
- Make sure the publish directory is set to "dist"

### API Not Working
- Verify GEMINI_API_KEY is set in Netlify environment variables
- Check that the API key has sufficient quota

## Configuration Files

- `netlify.toml` - Netlify configuration (build command, publish directory)
- `.env.example` - Template for environment variables

## Local Development

To run the app locally:

```
bash
# Install dependencies
npm install

# Start development server
npm run dev
```

To build for production locally:

```
bash
npm run build
npm run preview
```

## Support

If you encounter issues, check:
- Netlify documentation: https://docs.netlify.com
- Build logs in the Netlify dashboard
