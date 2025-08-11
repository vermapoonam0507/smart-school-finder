export const mockApi = {
  fetchSchools: async () => {
    console.log("API: Fetching schools...");

    // Simulate a network delay

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
          website: '[https://dpsrkp.net/](https://dpsrkp.net/)',
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
          customAmenities: ['Robotics Lab', 'Swimming Pool']
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
          website: '[https://modernschool.net/](https://modernschool.net/)',
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
          customAmenities: ['Horse Riding Club']
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
          website: '[https://andrewsganj.kvs.ac.in/](https://andrewsganj.kvs.ac.in/)',
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
          customAmenities: []
        }
      }
    ];
  }
};
