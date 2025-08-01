#!/usr/bin/env node

/**
 * Firebase Setup Script for TaskFlow
 * 
 * This script helps you set up Firebase for TaskFlow deployment.
 * Run this after creating your Firebase project.
 */

const fs = require('fs');
const path = require('path');

console.log('🔥 TaskFlow Firebase Setup');
console.log('========================\n');

console.log('📋 Prerequisites:');
console.log('1. Create a Firebase project at https://console.firebase.google.com/');
console.log('2. Enable Authentication (Email/Password)');
console.log('3. Create Firestore Database');
console.log('4. Get your Firebase config from Project Settings > General > Your apps\n');

console.log('📝 Next Steps:');
console.log('1. Copy your Firebase config values below');
console.log('2. Create a .env.local file with these values');
console.log('3. Deploy to Netlify with the environment variables\n');

console.log('🔧 Environment Variables Template:');
console.log('===================================');
console.log('NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here');
console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id');
console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com');
console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id');
console.log('NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id');
console.log('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id\n');

console.log('📄 Firestore Security Rules:');
console.log('=============================');
console.log('Copy these rules to your Firestore Database > Rules:');
console.log('');

const securityRules = `rules_version = '2';

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
        allow read, write: if get(/databases/\$(database)/documents/projects/\$(projectId)).data.memberIds.hasAny([request.auth.uid]);
      }
      
      // Status updates can be created, read by project members
      match /statusUpdates/{updateId} {
        allow read, write: if get(/databases/\$(database)/documents/projects/\$(projectId)).data.memberIds.hasAny([request.auth.uid]);
      }
    }
  }
}`;

console.log(securityRules);
console.log('');

console.log('🚀 Deployment Checklist:');
console.log('=======================');
console.log('☐ Firebase project created');
console.log('☐ Authentication enabled (Email/Password)');
console.log('☐ Firestore Database created');
console.log('☐ Security rules applied');
console.log('☐ Environment variables configured');
console.log('☐ Netlify deployment completed');
console.log('☐ Domain added to Firebase authorized domains');
console.log('☐ Testing completed\n');

console.log('📚 Additional Resources:');
console.log('=======================');
console.log('• README.md - Complete setup guide');
console.log('• DEPLOYMENT.md - Detailed deployment instructions');
console.log('• Firebase Docs: https://firebase.google.com/docs');
console.log('• Netlify Docs: https://docs.netlify.com/\n');

console.log('🎉 Happy deploying!'); 