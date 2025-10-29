# Debugging: "No linked school profile found" Error

## Steps to Debug

### 1. Open Browser Console
- Press **F12** in your browser
- Go to the **Console** tab
- Try to click "Edit" button again
- Look for these messages:

Expected console output:
```
❌ localStorage schoolId not valid, trying other methods...
❌ currentUser.schoolId not valid, trying other methods...
🔍 Fetching all schools to find match by authId...
```

Then either:
- `✅ Found school by filtering all schools with authId`
- OR `❌ Could not fetch all schools: [error message]`

### 2. Check Your User Object

In the browser console, type:
```javascript
JSON.parse(localStorage.getItem('userData'))
```

**What to look for:**
- Does it have an `_id` field?
- What is the value of `_id`?
- Does it have `userType: 'school'` or `isAdmin: true`?

### 3. Check If School Exists in Database

In the browser console, try manually fetching all schools:
```javascript
fetch('http://localhost:8080/api/admin/schools/status/all', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('authToken')
  }
})
.then(r => r.json())
.then(data => {
  console.log('All schools:', data);
  const userData = JSON.parse(localStorage.getItem('userData'));
  console.log('Your authId:', userData._id);
  console.log('Matching school:', data.data?.find(s => s.authId === userData._id));
})
```

### 4. Common Issues & Solutions

#### Issue A: `getAllSchools()` endpoint returns error
**Solution:** Check if you're logged in with the correct admin credentials

#### Issue B: No schools returned
**Solution:** Create a school profile first using the registration form

#### Issue C: School exists but authId doesn't match
**Problem:** The school's `authId` field doesn't match your user's `_id`
**Solution:** The school needs to be created with your current user's `_id` as the `authId`

#### Issue D: User not logged in properly
**Solution:** Log out and log back in to refresh your session

### 5. Quick Fix: Manually Set School ID

If you know your school's ID, you can set it manually:
```javascript
// In browser console:
localStorage.setItem('lastCreatedSchoolId', 'YOUR_SCHOOL_ID_HERE');
```

Then refresh and try to edit again.

## What to Share for Help

Please share:
1. The console output after clicking "Edit"
2. Your user object (run step 2 above)
3. The result of the fetch test (step 3 above)

This will help identify exactly where the issue is occurring.
