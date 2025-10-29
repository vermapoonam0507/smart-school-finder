# School Profile Edit Mode - Deployment Fix

## Problem
When trying to edit or update existing school details on the deployed Render environment, the system shows:
**"No linked school profile found for this account."**

This works fine on localhost but fails on production.

## Root Cause
The frontend was trying to find the school profile using:
1. `localStorage.getItem('lastCreatedSchoolId')` - only available in the same browser session
2. `currentUser.schoolId` - not populated in the production auth response

On production, when a school admin logs in, the `schoolId` field isn't included in the user object returned by the backend, so the system can't locate their school profile.

## Solution Implemented

### Frontend Changes (✅ DONE)

1. **Added new API function** in `src/api/adminService.js`:
   ```javascript
   export const getSchoolByAuthId = (authId, config) =>
     apiClient.get(`/admin/schools/auth/${encodeURIComponent(authId)}`, config);
   ```

2. **Updated RegistrationPage.jsx** to use `authId` (which is always available from the logged-in user):
   - Primary method: Fetch school using `getSchoolByAuthId(currentUser._id)`
   - Fallback method: Use old approach if the new endpoint doesn't exist

### Backend Changes Required (⚠️ ACTION NEEDED)

You need to add an endpoint in your backend to fetch a school by `authId`:

**Endpoint:** `GET /api/admin/schools/auth/:authId`

**Example Implementation (Node.js/Express):**

```javascript
// In your schools router (e.g., routes/admin.js or routes/schools.js)
router.get('/schools/auth/:authId', async (req, res) => {
  try {
    const { authId } = req.params;
    
    // Find school where authId matches
    const school = await School.findOne({ authId: authId });
    
    if (!school) {
      return res.status(404).json({
        success: false,
        message: 'No school found for this account'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: school
    });
  } catch (error) {
    console.error('Error fetching school by authId:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching school'
    });
  }
});
```

**Important Notes:**
- Ensure this endpoint is placed BEFORE the `/schools/:schoolId` route to avoid route conflicts
- Add authentication middleware to verify the user is logged in
- The `authId` should match the `_id` field from your Auth/User collection

## Testing

After deploying the backend changes:

1. Log in to your school admin account on Render
2. Navigate to the school registration/edit page
3. Click "Edit" or try to update existing details
4. The system should now successfully load your school profile

## Fallback Behavior

If the backend endpoint is not yet deployed, the frontend will:
1. Try the new `/admin/schools/auth/:authId` endpoint
2. If it fails, fall back to the old method using `localStorage` or `currentUser.schoolId`
3. Display an appropriate error message if neither method works

This ensures backward compatibility while you deploy the backend fix.
