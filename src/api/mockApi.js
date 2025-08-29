////Mockapi for testing when i haven't real api at that time i was use it//////

export const fetchFormSchema = async () => {
  console.log("API: Fetching form schema...");
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log("API: Schema fetched!");
  return {
    'Basic Info': [
      { name: 'name', label: 'School Name', type: 'String', required: true },
      { name: 'description', label: 'Description', type: 'String', required: true },
      { name: 'board', label: 'Board', type: 'String', required: true, enum: ['CBSE', 'ICSE', 'CISCE', 'NIOS', 'SSC', 'IGCSE', 'IB', 'KVS', 'JNV', 'DBSE', 'MSBSHSE', 'UPMSP', 'KSEEB', 'WBBSE', 'GSEB', 'RBSE', 'BSEB', 'PSEB', 'BSE', 'SEBA', 'MPBSE', 'STATE', 'OTHER'] },
      { name: 'state', label: 'State', type: 'String', required: true },
      { name: 'city', label: 'City', type: 'String', required: true },
      { name: 'schoolMode', label: 'School Mode', type: 'String', required: true, enum: ['convent', 'private', 'government'] },
      { name: 'genderType', label: 'Gender Type', type: 'String', required: true, enum: ['boy', 'girl', 'co-ed'] },
      { name: 'shifts', label: 'Shifts', type: 'Array', required: true, enum: ['morning', 'afternoon', 'night school'] },
      { name: 'feeRange', label: 'Fee Range', type: 'String', required: true, enum: ["1000 - 10000", "10000 - 25000", "25000 - 50000", "50000 - 75000", "75000 - 100000", "1 Lakh - 2 Lakh", "2 Lakh - 3 Lakh", "3 Lakh - 4 Lakh", "4 Lakh - 5 Lakh", "More than 5 Lakh"] },
      { name: 'upto', label: 'Classes Upto', type: 'String', required: true },
      { name: 'email', label: 'Email', type: 'String', required: true },
      { name: 'mobileNo', label: 'Mobile No', type: 'String', required: true },
      { name: 'website', label: 'Website', type: 'String', required: false },
      { name: 'languageMedium', label: 'Language Medium', type: 'Array', required: true, enum: ['English', 'Hindi', 'Bengali', 'Marathi', 'Other'] },
      { name: 'transportAvailable', label: 'Transport Available', type: 'String', required: true, enum: ['yes', 'no'] },
    ],
    'Activity Info': [
       { name: 'activities', label: 'Activities', type: 'Array', required: true, enum: ['Focusing on Academics', 'Focuses on Practical Learning', 'Focuses on Theoretical Learning', 'Empowering in Sports', 'Empowering in Arts', 'Special Focus on Mathematics', 'Special Focus on Science', 'Special Focus on Physical Education', 'Leadership Development', 'STEM Activities', 'Cultural Education', 'Technology Integration', 'Environmental Awareness'] },
    ],
    'Alumni Info': [
        { name: 'topAlumnis', label: 'Top Alumni', type: 'ListOfObjects', required: false, fields: [
            { name: 'name', label: 'Alumni Name', type: 'String' },
            { name: 'percentage', label: 'Percentage', type: 'Number' }
        ]},
        { name: 'famousAlumnies', label: 'Famous Alumni', type: 'ListOfObjects', required: false, fields: [
            { name: 'name', label: 'Alumni Name', type: 'String' },
            { name: 'profession', label: 'Profession', type: 'String' }
        ]}
    ],
    'Amenities Info': [
        { name: 'predefinedAmenities', label: 'Facilities', type: 'Array', required: false, enum: ['Library', 'Playground', 'Science Lab', 'Computer Lab', 'Auditorium', 'Canteen', 'Smart Classes', 'Wi-Fi Campus'] },
        { name: 'customAmenities', label: 'Other Facilities (comma separated)', type: 'String', required: false }
    ]
  };
};

export const fetchStudentApplicationSchema = async () => {
  console.log("API: Fetching student application schema...");
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    'Student Details': [
      { name: 'studentName', label: 'Student Full Name', type: 'String', required: true },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'Date', required: true },
      { name: 'applyingForClass', label: 'Applying for Class', type: 'String', required: true, enum: ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] },
    ],
    'Parent/Guardian Details': [
      { name: 'parentName', label: 'Parent/Guardian Name', type: 'String', required: true },
      { name: 'parentContact', label: 'Parent Contact No.', type: 'String', required: true },
      { name: 'parentEmail', label: 'Parent Email', type: 'String', required: true },
    ],
    'Previous School Details': [
        { name: 'previousSchool', label: 'Previous School Name', type: 'String', required: false },
        { name: 'previousClass', label: 'Last Class Attended', type: 'String', required: false },
    ]
  };
};
