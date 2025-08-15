const mockApi = {
  fetchSchools: async () => {
    console.log("API: Fetching schools...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log("API: Schools fetched!");
    return [
      {
        id: 1,
        basicInfo: {
          name: 'Delhi Public School, RK Puram',
          description: 'A premier institution known for its academic excellence and holistic development.',
          board: 'CBSE',
          state: 'Delhi',
          city: 'New Delhi',
          schoolMode: 'private',
          genderType: 'co-ed',
          shifts: ['morning'],
          feeRange: '75000 - 100000',
          upto: 'Class 12',
          email: 'contact@dpsrkp.net',
          mobileNo: '9876543210',
          website: 'https://dpsrkp.net/',
          languageMedium: ['English'],
          transportAvailable: 'yes',
        },
        activityInfo: {
          activities: ['Focusing on Academics', 'Empowering in Sports', 'STEM Activities', 'Leadership Development']
        },
        alumniInfo: {
          topAlumnis: [{ name: 'Raghuram Rajan', percentage: 98 }],
          famousAlumnies: [{ name: 'Shah Rukh Khan', profession: 'Actor' }]
        },
        amenitiesInfo: {
          predefinedAmenities: ['Library', 'Science Lab', 'Computer Lab', 'Sports Ground'],
          customAmenities: 'Robotics Lab, Swimming Pool'
        }
      },
      {
        id: 2,
        basicInfo: {
          name: 'Modern School, Barakhamba Road',
          description: 'Fostering creativity and critical thinking since 1920.',
          board: 'CBSE',
          state: 'Delhi',
          city: 'New Delhi',
          schoolMode: 'private',
          genderType: 'co-ed',
          shifts: ['morning'],
          feeRange: '1 Lakh - 2 Lakh',
          upto: 'Class 12',
          email: 'info@modernschool.net',
          mobileNo: '9123456789',
          website: 'https://modernschool.net/',
          languageMedium: ['English'],
          transportAvailable: 'yes',
        },
        activityInfo: {
          activities: ['Empowering in Arts', 'Cultural Education', 'Technology Integration']
        },
        alumniInfo: {
          topAlumnis: [{ name: 'Khushwant Singh', percentage: 95 }],
          famousAlumnies: [{ name: 'Gurcharan Das', profession: 'Author' }]
        },
        amenitiesInfo: {
          predefinedAmenities: ['Auditorium', 'Art Studio', 'Music Room'],
          customAmenities: 'Horse Riding Club'
        }
      },
      {
        id: 3,
        basicInfo: {
          name: 'Kendriya Vidyalaya, Andrews Ganj',
          description: 'A government-run school providing quality education to all.',
          board: 'KVS',
          state: 'Delhi',
          city: 'New Delhi',
          schoolMode: 'government',
          genderType: 'co-ed',
          shifts: ['morning', 'afternoon'],
          feeRange: '1000 - 10000',
          upto: 'Class 12',
          email: 'kvag@example.com',
          mobileNo: '9998887776',
          website: 'https://andrewsganj.kvs.ac.in/',
          languageMedium: ['English', 'Hindi'],
          transportAvailable: 'no',
        },
        activityInfo: {
          activities: ['Environmental Awareness', 'Special Focus on Physical Education']
        },
        alumniInfo: {
          topAlumnis: [],
          famousAlumnies: []
        },
        amenitiesInfo: {
          predefinedAmenities: ['Library', 'Playground'],
          customAmenities: ''
        }
      },
      {
        id: 4,
        basicInfo: {
          name: 'Dhirubhai Ambani International School',
          description: 'A world-class school in the heart of Mumbai.',
          board: 'ICSE',
          state: 'Maharashtra',
          city: 'Mumbai',
          schoolMode: 'private',
          genderType: 'co-ed',
          shifts: ['morning'],
          feeRange: 'More than 5 Lakh',
          upto: 'Class 12',
          email: 'info@dais.edu.in',
          mobileNo: '9871234567',
          website: 'https://www.dais.edu.in/',
          languageMedium: ['English'],
          transportAvailable: 'yes',
        },
        activityInfo: {
          activities: ['Technology Integration', 'Leadership Development']
        },
        alumniInfo: {
          topAlumnis: [],
          famousAlumnies: []
        },
        amenitiesInfo: {
          predefinedAmenities: ['Library', 'Auditorium', 'Smart Classes'],
          customAmenities: 'Olympic Size Swimming Pool'
        }
      },
      {
        id: 5,
        basicInfo: {
          name: 'Bishop Cotton Boys\' School',
          description: 'One of the oldest and most prestigious schools in Bengaluru.',
          board: 'ICSE',
          state: 'Karnataka',
          city: 'Bengaluru',
          schoolMode: 'private',
          genderType: 'boy',
          shifts: ['morning'],
          feeRange: '1 Lakh - 2 Lakh',
          upto: 'Class 12',
          email: 'contact@bishopcottonboysschool.edu.in',
          mobileNo: '9988776655',
          website: 'https://www.bishopcottonboysschool.edu.in/',
          languageMedium: ['English'],
          transportAvailable: 'yes',
        },
        activityInfo: {
          activities: ['Empowering in Sports', 'Cultural Education']
        },
        alumniInfo: {
          topAlumnis: [],
          famousAlumnies: []
        },
        amenitiesInfo: {
          predefinedAmenities: ['Playground', 'Science Lab', 'Computer Lab'],
          customAmenities: 'Chapel, Boarding Facility'
        }
      }
    ];
  }
};

const fetchFormSchema = async () => {
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

export { mockApi, fetchFormSchema };