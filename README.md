# TaskFlow - Collaborative Project Management

A modern, real-time project and task management application built with Next.js, Firebase, and TypeScript. Perfect for hackathons, team projects, and collaborative work.

## 🚀 Features

### Core Functionality
- **Real-time Collaboration**: Live updates across all team members
- **Project Management**: Create and manage personal or shared projects
- **Task Tracking**: Add, edit, and track tasks with status, priority, and due dates
- **Team Invitations**: Invite team members via email
- **Status Updates**: Share daily/weekly stand-ups and progress updates
- **Responsive Design**: Works seamlessly on desktop and mobile

### Advanced Features
- **Task Statistics**: Visual progress tracking with completion metrics
- **Project Settings**: Customize project names and descriptions
- **Member Management**: See who's working on what
- **Real-time Notifications**: Instant feedback for all actions
- **Modern UI**: Clean, calm design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Firebase Firestore, Firebase Authentication
- **Deployment**: Netlify (ready)
- **AI Integration**: Google AI (Gemini 2.0 Flash) via Genkit

## 🚀 Quick Deploy to Netlify

### Option 1: Deploy from GitHub (Recommended)

1. **Fork this repository** to your GitHub account
2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Choose your forked repository
   - Set build command: `npm run build`
   - Set publish directory: `.next`
   - Click "Deploy site"

3. **Configure Environment Variables**:
   - In your Netlify dashboard, go to Site settings > Environment variables
   - Add your Firebase configuration:
   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

### Option 2: Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/taskflow.git
   cd taskflow
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   cp env.example .env.local
   # Edit .env.local with your Firebase configuration
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:9002](http://localhost:9002)** in your browser

## 🔥 Firebase Setup

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Follow the setup wizard

### 2. Enable Authentication
1. In Firebase Console, go to Authentication
2. Click "Get started"
3. Enable "Email/Password" provider
4. Add your domain to authorized domains

### 3. Set up Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (we'll add security rules later)
4. Select a location close to your users

### 4. Security Rules
Replace the default Firestore rules with the ones in `firestore.rules`:

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

### 5. Get Configuration
1. In Firebase Console, go to Project settings
2. Scroll down to "Your apps"
3. Click the web app icon (</>)
4. Copy the configuration object
5. Use these values in your environment variables

## 👥 Usage Guide

### For Hackathon Teams

1. **Create a Project**:
   - Sign up with your email
   - Click "Create Project"
   - Name it after your hackathon (e.g., "AI Chatbot Hackathon")

2. **Invite Team Members**:
   - Click the "+" button next to member avatars
   - Enter their email addresses
   - They'll receive access to the project

3. **Add Tasks**:
   - Use the input field at the bottom of each project
   - Set priorities and due dates
   - Assign tasks to team members

4. **Share Updates**:
   - Click the "Updates" tab
   - Share daily stand-ups and progress
   - Track completed tasks and blockers

### For Solo Projects

1. **Create Personal Projects**:
   - Projects are private by default
   - Perfect for personal task management

2. **Track Progress**:
   - Use the task statistics to see your progress
   - Set priorities and due dates
   - Mark tasks as complete

## 🎨 Customization

### Colors and Styling
The app uses a calm purple color scheme defined in `src/app/globals.css`:
- Primary: Muted purple (#9D7CBF)
- Background: Light purple (#F4F2F7)
- Accent: Blue (#7BA9BF)

### Adding Features
The modular component structure makes it easy to add new features:
- `src/components/taskflow/` - Core task management components
- `src/components/ui/` - Reusable UI components
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript type definitions

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript check

### Project Structure
```
src/
├── app/                 # Next.js app router pages
├── components/          # React components
│   ├── taskflow/       # Task management components
│   └── ui/            # Reusable UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility libraries
├── types/              # TypeScript definitions
└── ai/                 # AI integration
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues:
1. Check the [Firebase documentation](https://firebase.google.com/docs)
2. Verify your environment variables are set correctly
3. Ensure your Firebase project is properly configured
4. Check the browser console for error messages

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Set up Firebase project
- [ ] Configure authentication
- [ ] Set up Firestore database
- [ ] Add security rules
- [ ] Configure environment variables
- [ ] Test user registration and login
- [ ] Test project creation and collaboration
- [ ] Verify real-time updates work
- [ ] Test on mobile devices

---

**Happy collaborating! 🎉**
