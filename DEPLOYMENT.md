# 🚀 Production Deployment Guide

This guide will walk you through deploying TaskFlow to production on Netlify with Firebase backend.

## 📋 Prerequisites

- GitHub account
- Netlify account (free)
- Firebase account (free tier available)

## 🔥 Step 1: Firebase Setup

### 1.1 Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter a project name (e.g., "taskflow-production")
4. Choose whether to enable Google Analytics (recommended)
5. Click "Create project"

### 1.2 Enable Authentication

1. In your Firebase project, go to **Authentication**
2. Click "Get started"
3. Go to **Sign-in method** tab
4. Enable **Email/Password** provider
5. Click **Save**

### 1.3 Set up Firestore Database

1. Go to **Firestore Database**
2. Click "Create database"
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location close to your users
5. Click "Done"

### 1.4 Configure Security Rules

1. In Firestore Database, go to **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can read their own user document and other users' public profiles
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Projects can be read by any member of the project
    // Projects can be created by authenticated users
    // Projects can be updated or deleted only by members of the project
    match /projects/{projectId} {
      allow read, update, delete: if request.auth.uid in resource.data.memberIds;
      allow create: if request.auth != null;
      
      // Tasks can be created, read, updated, and deleted by any member of the project
      match /tasks/{taskId} {
        allow read, write: if get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds.hasAny([request.auth.uid]);
      }
      
      // Status updates can be created, read by project members
      match /statusUpdates/{updateId} {
        allow read, write: if get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds.hasAny([request.auth.uid]);
      }
    }
  }
}
```

3. Click **Publish**

### 1.5 Get Firebase Configuration

1. Go to **Project settings** (gear icon)
2. Scroll down to **Your apps**
3. Click the web app icon (</>)
4. Register app with a nickname (e.g., "TaskFlow Web")
5. Copy the configuration object

## 🌐 Step 2: Deploy to Netlify

### 2.1 Fork the Repository

1. Go to this repository on GitHub
2. Click **Fork** in the top right
3. Clone your forked repository locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/taskflow.git
   cd taskflow
   ```

### 2.2 Connect to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Sign up/login with your GitHub account
3. Click **"New site from Git"**
4. Choose **GitHub** as your Git provider
5. Select your forked repository
6. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
7. Click **"Deploy site"**

### 2.3 Configure Environment Variables

1. In your Netlify dashboard, go to **Site settings**
2. Click **Environment variables**
3. Add the following variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Click **Save**

### 2.4 Trigger a New Deploy

1. Go to **Deploys** tab in Netlify
2. Click **"Trigger deploy"** > **"Deploy site"**
3. Wait for the build to complete

## 🔧 Step 3: Configure Domain

### 3.1 Add Custom Domain (Optional)

1. In Netlify dashboard, go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow the DNS configuration instructions

### 3.2 Update Firebase Authorized Domains

1. In Firebase Console, go to **Authentication**
2. Click **Settings** tab
3. Scroll to **Authorized domains**
4. Add your Netlify domain (e.g., `your-app.netlify.app`)
5. Click **Save**

## 🧪 Step 4: Testing

### 4.1 Test User Registration

1. Visit your deployed site
2. Click **"Sign up"**
3. Create a test account
4. Verify you can log in and out

### 4.2 Test Project Creation

1. Log in to your account
2. Click **"Create Project"**
3. Enter a project name
4. Verify the project appears in your list

### 4.3 Test Real-time Features

1. Open your app in two browser tabs
2. Create a project in one tab
3. Verify it appears in the other tab
4. Add a task and verify real-time updates

### 4.4 Test Mobile Responsiveness

1. Open your app on a mobile device
2. Test all features work properly
3. Verify the responsive design

## 🔒 Step 5: Security Hardening

### 5.1 Update Firestore Rules

After testing, update your Firestore rules to be more restrictive:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users can only access their own data
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }
    
    // Projects require authentication and membership
    match /projects/{projectId} {
      allow read, update, delete: if request.auth != null && request.auth.uid in resource.data.memberIds;
      allow create: if request.auth != null;
      
      // Tasks require project membership
      match /tasks/{taskId} {
        allow read, write: if request.auth != null && 
          get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds.hasAny([request.auth.uid]);
      }
      
      // Status updates require project membership
      match /statusUpdates/{updateId} {
        allow read, write: if request.auth != null && 
          get(/databases/$(database)/documents/projects/$(projectId)).data.memberIds.hasAny([request.auth.uid]);
      }
    }
  }
}
```

### 5.2 Enable HTTPS

Netlify automatically provides HTTPS certificates. Verify it's working by checking the lock icon in your browser.

## 📊 Step 6: Monitoring

### 6.1 Set up Analytics

1. In Firebase Console, go to **Analytics**
2. Follow the setup wizard
3. Add the measurement ID to your environment variables

### 6.2 Monitor Usage

1. Check Firebase Console for:
   - Authentication usage
   - Firestore read/write operations
   - Storage usage

2. Check Netlify for:
   - Build times
   - Deploy frequency
   - Bandwidth usage

## 🚨 Troubleshooting

### Common Issues

**Build Fails**
- Check that all environment variables are set
- Verify Node.js version (should be 18+)
- Check build logs in Netlify

**Authentication Not Working**
- Verify Firebase configuration is correct
- Check that your domain is in authorized domains
- Ensure Email/Password auth is enabled

**Real-time Updates Not Working**
- Check Firestore security rules
- Verify Firebase project ID is correct
- Check browser console for errors

**Mobile Issues**
- Test on different devices
- Check responsive design
- Verify touch interactions work

### Getting Help

1. Check the [Firebase documentation](https://firebase.google.com/docs)
2. Review [Netlify documentation](https://docs.netlify.com/)
3. Check browser console for error messages
4. Verify all environment variables are set correctly

## 🎉 Success!

Your TaskFlow app is now deployed and ready for collaboration! Share the URL with your team and start managing projects together.

### Next Steps

1. **Invite your team** to test the app
2. **Create your first project** for your hackathon
3. **Set up regular backups** of your Firestore data
4. **Monitor usage** to stay within free tier limits
5. **Consider upgrading** if you need more resources

---

**Happy collaborating! 🚀** 