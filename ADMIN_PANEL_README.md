# Admin Panel Documentation

## Overview
The admin panel provides administrative access to manage users, schools, and system settings for the School Finder application.

## Access

### Admin Login
- **URL**: `/admin/login`
- **Features**:
  - Secure admin authentication
  - Remember me functionality
  - Admin-specific styling with shield icon
  - Redirects to admin dashboard on successful login

### Admin Signup
- **URL**: `/admin/signup`
- **Features**:
  - Admin account creation
  - Admin code verification (currently: `ADMIN2024`)
  - Strong password requirements
  - Email validation

### Admin Dashboard
- **URL**: `/admin/dashboard`
- **Features**:
  - Overview statistics (users, schools, activity)
  - Quick action buttons
  - Recent activity feed
  - Protected route (admin access only)

## Navigation

### Header Integration
- Admin login link available in main navigation
- Shield icon for easy identification
- Mobile-responsive design

### Route Protection
- `AdminProtectedRoute` component ensures only admin users can access admin pages
- Automatic redirect to appropriate login page based on user type
- Loading states for better UX

## API Integration

### Admin Service (`/src/api/adminService.js`)
- `registerAdmin()` - Register new admin
- `loginAdmin()` - Admin login
- `getAdminStats()` - Dashboard statistics
- `getAllUsers()` - User management
- `getAllSchools()` - School management
- `updateUserStatus()` - Activate/deactivate users
- `updateSchoolStatus()` - Approve/reject schools
- `deleteUser()` - Remove users
- `deleteSchool()` - Remove schools
- `getAdminProfile()` - Admin profile
- `updateAdminProfile()` - Update profile
- `changeAdminPassword()` - Password change

## Security Features

### Authentication
- Admin-specific user type validation
- Secure password requirements
- Admin code verification for registration
- Protected routes with automatic redirects

### Access Control
- Only users with `userType: 'admin'` can access admin features
- Automatic logout and redirect for non-admin users
- Secure token-based authentication

## Usage

1. **Access Admin Panel**: Click "Admin" link in the main navigation
2. **Login**: Use admin credentials or create new admin account
3. **Dashboard**: View system statistics and quick actions
4. **Manage**: Use quick action buttons to manage users and schools

## Development Notes

- All admin pages use consistent styling with blue gradient backgrounds
- Admin-specific icons (Shield, UserPlus) for better UX
- Responsive design for mobile and desktop
- Toast notifications for user feedback
- Loading states for better user experience

## Future Enhancements

- User management interface
- School approval workflow
- Analytics and reporting
- System settings configuration
- Audit logs and activity tracking


