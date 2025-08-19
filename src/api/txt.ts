// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { fetchSchools } from '../api/apiService';
// import SchoolCard from '../components/SchoolCard';

// const SchoolsPage = ({ onSelectSchool, onCompareToggle, comparisonList, currentUser, shortlist, onShortlistToggle }) => {
//   const [schools, setSchools] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const loadSchools = async () => {
//       try {
//         setLoading(true);
//         const response = await fetchSchools();
//         // console.log("response.data:", response.data); //add this line


//         // console.log("Fetch response:", response); // <- check this

//         setSchools(response.data);
//       } catch (error) {
//         console.error("Error fetching schools:", error);
//         setSchools([]);
//       } finally {
//         setLoading(false);
//       }
//     };
//     loadSchools();
//   }, []);
  
//   const handleCardClick = (school) => {
//     onSelectSchool(school);
//     navigate(`/school/${school.id}`);
//   };

//   if (loading) return <div className="flex justify-center items-center h-screen">Loading schools...</div>;

//   return (
//     <div className="bg-gray-100 min-h-screen">
//       <div className="container mx-auto px-6 py-8">
//         <h1 className="text-3xl font-bold text-gray-800 mb-6">Explore Schools</h1>
//         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

//           {schools.map(school => {
//             const isCompared = comparisonList.some(item => item.id === school.id);
//             const isShortlisted = shortlist.some(item => item.id === school.id);
//             return (
//               <SchoolCard
//                 key={school.id}
//                 school={school}
//                 onCardClick={() => handleCardClick(school)}
//                 onCompareToggle={() => onCompareToggle(school)}
//                 isCompared={isCompared}
//                 currentUser={currentUser}
//                 onShortlistToggle={() => onShortlistToggle(school)}
//                 isShortlisted={isShortlisted}
//               />
//             )
//           })}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default SchoolsPage;





//       activityInfo: { activities: ['Focusing on Academics', 'Empowering in Sports', 'STEM Activities'] },



//       //App.jsx 

//       import React, { useState, useEffect } from 'react';
// import { Routes, Route, useNavigate } from 'react-router-dom';
// import Header from './components/Header';
// import LandingPage from './pages/LandingPage';
// import SchoolsPage from './pages/SchoolsPage';
// import SchoolDetailsPage from './pages/SchoolDetailsPage';
// import LoginPage from './pages/LoginPage';
// import ComparePage from './pages/ComparePage';
// import RegistrationPage from './pages/RegistrationPage';
// import SignUpPage from './pages/SignUpPage';
// import ForgotPasswordPage from './pages/ForgotPasswordPage';
// import DashboardPage from './pages/DashboardPage';
// import SchoolPortalPage from './pages/SchoolPortalPage';
// import StudentApplicationPage from './pages/StudentApplicationPage';

// function App() {
//   const [selectedSchool, setSelectedSchool] = useState(null);
//   const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  
//   const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem('school-finder-users')) || []);
//   const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('school-finder-currentUser')) || null);
//   const [shortlist, setShortlist] = useState([]);
//   const [comparisonList, setComparisonList] = useState(() => JSON.parse(localStorage.getItem('school-finder-comparisonList')) || []);
//   const [schoolRegistrations, setSchoolRegistrations] = useState(() => JSON.parse(localStorage.getItem('school-finder-registrations')) || {});
//   const [studentApplications, setStudentApplications] = useState(() => JSON.parse(localStorage.getItem('school-finder-student-apps')) || []);
  
//   const navigate = useNavigate();

//   useEffect(() => { localStorage.setItem('school-finder-users', JSON.stringify(users)); }, [users]);
//   useEffect(() => { localStorage.setItem('school-finder-currentUser', JSON.stringify(currentUser)); }, [currentUser]);
//   useEffect(() => { if (currentUser) { localStorage.setItem(`shortlist_${currentUser.email}`, JSON.stringify(shortlist)); } }, [shortlist]);
//   useEffect(() => { localStorage.setItem('school-finder-comparisonList', JSON.stringify(comparisonList)); }, [comparisonList]);
//   useEffect(() => { localStorage.setItem('school-finder-registrations', JSON.stringify(schoolRegistrations)); }, [schoolRegistrations]);
//   useEffect(() => { localStorage.setItem('school-finder-student-apps', JSON.stringify(studentApplications)); }, [studentApplications]);

//   useEffect(() => {
//     if (currentUser) {
//       const userShortlist = JSON.parse(localStorage.getItem(`shortlist_${currentUser.email}`)) || [];
//       setShortlist(userShortlist);
//     } else {
//       setShortlist([]);
//     }
//   }, [currentUser]);

//   const handleCompareToggle = (school) => {
//     setComparisonList((prevList) => {
//       const isInList = prevList.some((item) => item.id === school.id);
//       return isInList ? prevList.filter((item) => item.id !== school.id) : [...prevList, school];
//     });
//   };

//   const handleSignUp = (newUser) => {
//     if (users.some(user => user.email === newUser.email)) return false;
//     setUsers(prevUsers => [...prevUsers, newUser]);
//     return true;
//   };

//   const handleLogin = (credentials) => {
//     const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
//     if (user) {
//       setCurrentUser(user);
//       navigate(user.role === 'school' ? '/school-portal' : '/schools');
//       return true;
//     }
//     return false;
//   };

//   const handleLogout = () => {
//     setCurrentUser(null);
//     navigate('/');
//   };

//   const handleShortlistToggle = (school) => {
//     if (!currentUser || currentUser.role !== 'parent') {
//       alert("Please log in as a Parent/Student to shortlist schools.");
//       navigate('/login');
//       return;
//     }
//     setShortlist((prevList) => {
//       const isInList = prevList.some((item) => item.id === school.id);
//       return isInList ? prevList.filter((item) => item.id !== school.id) : [...prevList, school];
//     });
//   };
  
//   const handleSchoolRegistration = (formData) => {
//     if (!currentUser || currentUser.role !== 'school') return false;
//     setSchoolRegistrations(prev => ({ ...prev, [currentUser.email]: { ...formData, status: 'Pending' } }));
//     alert("School registration submitted successfully!");
//     return true;
//   };

//   const handleStudentApplication = (formData, schoolId) => {
//     if (!currentUser || currentUser.role !== 'parent') {
//         alert("Error: Please log in as a Parent/Student.");
//         return false;
//     }
//     const newApplication = {
//         id: Date.now(),
//         ...formData,
//         schoolId: schoolId,
//         applicantEmail: currentUser.email,
//         status: 'Pending',
//         date: new Date().toISOString().split('T')[0],
//     };
//     setStudentApplications(prev => [...prev, newApplication]);
//     alert("Application submitted successfully!");
//     navigate('/dashboard');
//     return true;
//   };

//   return (
//     <>
//       <Header
//         isMobileMenuOpen={isMobileMenuOpen}
//         setMobileMenuOpen={setMobileMenuOpen}
//         compareCount={comparisonList.length}
//         currentUser={currentUser}
//         onLogout={handleLogout}
//       />
//       <main>
//         <Routes>
//           <Route path="/" element={<LandingPage />} />
//           <Route path="/schools" element={<SchoolsPage onSelectSchool={setSelectedSchool} onCompareToggle={handleCompareToggle} comparisonList={comparisonList} currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} />} />
//           <Route path="/school/:id" element={<SchoolDetailsPage school={selectedSchool} currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} />} />
//           <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
//           <Route path="/signup" element={<SignUpPage onSignUp={handleSignUp} />} />
//           <Route path="/signup-school" element={<SignUpPage onSignUp={handleSignUp} isSchoolSignUp={true} />} />
//           <Route path="/forgot-password" element={<ForgotPasswordPage />} />
//           <Route path="/dashboard" element={<DashboardPage currentUser={currentUser} shortlist={shortlist} onShortlistToggle={handleShortlistToggle} onSelectSchool={setSelectedSchool} comparisonList={comparisonList} onCompareToggle={handleCompareToggle} />} />
//           <Route path="/compare" element={<ComparePage comparisonList={comparisonList} onCompareToggle={handleCompareToggle} />} />
//           <Route path="/school-portal/*" element={<SchoolPortalPage currentUser={currentUser} onLogout={handleLogout} registrationData={schoolRegistrations[currentUser?.email]} onRegister={handleSchoolRegistration} />} />
//           <Route path="/apply/:schoolId" element={<StudentApplicationPage onApply={handleStudentApplication} currentUser={currentUser} />} />
//         </Routes>
//       </main>
//     </>
//   );
// }

// export default App;



// ///=============================================///

// import React from 'react';
// import { useNavigate } from 'react-router-dom';
// import { MapPin, BookOpen, Users, Heart, Building, Award, Sun, Moon, IndianRupee, Languages, Car, Star, CheckCircle } from 'lucide-react';

// // Naya InfoBox component
// const InfoBox = ({ icon, label, value }) => (
//     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
//         <div className="flex items-center text-gray-500 mb-1">
//             {icon}
//             <h3 className="text-sm font-medium ml-2">{label}</h3>
//         </div>
//         <p className="text-lg font-semibold text-gray-800">{value}</p>
//     </div>
// );

// const SchoolDetailsPage = ({ school, currentUser, shortlist, onShortlistToggle }) => {
//     const navigate = useNavigate();

//     if (!school) {
//         return (
//             <div className="flex flex-col justify-center items-center h-screen">
//                 <p>No school selected. Please go back to the schools list.</p>
//                 <button onClick={() => navigate('/schools')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Back to Schools</button>
//             </div>
//         );
//     }

//     const { basicInfo, activityInfo, alumniInfo, amenitiesInfo } = school;
//     const isShortlisted = shortlist.some(item => item.id === school.id);

//     const handleApplyNow = () => {
//         if (!currentUser || currentUser.role !== 'parent') {
//             alert("Please log in as a Parent/Student to apply.");
//             navigate('/login');
//         } else {
//             navigate(`/apply/${school.id}`);
//         }
//     };

//     const renderCustomAmenities = () => {
//         if (!amenitiesInfo.customAmenities || typeof amenitiesInfo.customAmenities !== 'string') {
//             return null;
//         }
//         const customList = amenitiesInfo.customAmenities.split(',').map(item => item.trim()).filter(Boolean);
//         if (customList.length === 0) return null;
//         return customList.map(amenity => (
//             <span key={amenity} className="bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">{amenity}</span>
//         ));
//     };

//     return (
//         <div className="bg-gray-100">
//             <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
//                 {/* Header Section */}
//                 <div className="bg-white shadow-lg rounded-lg p-6 mb-8 relative">
//                     {currentUser && currentUser.role === 'parent' && (
//                         <button onClick={() => onShortlistToggle(school)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 z-10">
//                             <Heart size={28} className={isShortlisted ? "fill-current text-red-500" : ""} />
//                         </button>
//                     )}
//                     <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{basicInfo.name}</h1>
//                     <p className="text-lg text-gray-600 flex items-center mb-4"><MapPin size={18} className="mr-2" />{basicInfo.city}, {basicInfo.state}</p>
//                     <p className="text-md text-gray-700">{basicInfo.description}</p>
//                     <div className="mt-6 flex flex-wrap gap-3">
//                         <a href={basicInfo.website} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Visit Website</a>
//                         <button onClick={handleApplyNow} className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
//                             Apply Now
//                         </button>
//                     </div>
//                 </div>

//                 {/* Details Section */}
//                 <div className="bg-white shadow-lg rounded-lg p-6">
//                     {/* Basic Info */}
//                     <div className="mb-8">
//                         <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Basic Information</h2>
//                         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//                             <InfoBox icon={<Award size={16} />} label="Board" value={basicInfo.board} />
//                             <InfoBox icon={<Users size={16} />} label="Gender Type" value={basicInfo.genderType} />
//                             <InfoBox icon={<Building size={16} />} label="School Mode" value={basicInfo.schoolMode} />
//                             <InfoBox icon={<BookOpen size={16} />} label="Classes Upto" value={basicInfo.upto} />
//                             <InfoBox icon={<Sun size={16} />} label="Shifts" value={basicInfo.shifts.join(', ')} />
//                             <InfoBox icon={<IndianRupee size={16} />} label="Fee Range" value={basicInfo.feeRange} />
//                             <InfoBox icon={<Languages size={16} />} label="Medium" value={basicInfo.languageMedium.join(', ')} />
//                             <InfoBox icon={<Car size={16} />} label="Transport" value={basicInfo.transportAvailable} />
//                         </div>
//                     </div>

//                     {/* Activities & Amenities */}
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                         <div>
//                             <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Activities & Focus</h2>
//                             <div className="flex flex-wrap gap-2">
//                                 {activityInfo.activities.map(activity => (
//                                     <span key={activity} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
//                                         <CheckCircle size={14} className="mr-1.5" /> {activity}
//                                     </span>
//                                 ))}
//                             </div>
//                         </div>
//                         <div>
//                             <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Amenities</h2>
//                             <div className="flex flex-wrap gap-2">
//                                 {amenitiesInfo.predefinedAmenities.map(amenity => (
//                                     <span key={amenity} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">{amenity}</span>
//                                 ))}
//                                 {renderCustomAmenities()}
//                             </div>
//                         </div>
//                     </div>
                     
//                      {/* Alumni Info */}
//                     <div className="mt-8">
//                          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Notable Alumni</h2>
//                          {alumniInfo.famousAlumnies.length > 0 ? (
//                             <div className="space-y-2">
//                                 {alumniInfo.famousAlumnies.map(alumni => (
//                                     <p key={alumni.name} className="text-gray-700"><Star size={16} className="inline-block mr-2 text-yellow-500" /><strong>{alumni.name}</strong> - {alumni.profession}</p>
//                                 ))}
//                             </div>
//                          ) : (
//                             <p className="text-sm text-gray-500">No famous alumni data available.</p>
//                          )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default SchoolDetailsPage;



// //==============================================//

// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Link, useNavigate } from 'react-router-dom';
// import { School, LogOut, FileText, Eye, Download, Check, X } from 'lucide-react';
// import RegistrationPage from './RegistrationPage';
// import { fetchStudentApplications } from '../api/apiService';

// const SchoolHeader = ({ schoolName, onLogout }) => (
//     <header className="bg-white shadow-md">
//         <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
//             <div className="text-xl font-bold text-gray-800">
//                 <School className="inline-block mr-2 text-blue-600" /> School Portal
//             </div>
//             <div className="flex items-center space-x-6">
//                 <Link to="/school-portal/register" className="text-gray-600 hover:text-blue-600 flex items-center"><FileText size={18} className="mr-2" /> My School Profile</Link>
//                 <Link to="/school-portal/applications" className="text-gray-600 hover:text-blue-600 flex items-center"><Eye size={18} className="mr-2" /> View Student Applications</Link>
//                 <span className="text-gray-500">|</span>
//                 <span className="text-gray-700">Welcome, {schoolName}!</span>
//                 <button onClick={onLogout} className="text-gray-600 hover:text-blue-600 flex items-center"><LogOut size={16} className="mr-1" /> Logout</button>
//             </div>
//         </nav>
//     </header>
// );

// const ViewStudentApplications = ({ schoolEmail }) => {
//     const [applications, setApplications] = useState([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         const getApps = async () => {
//             setLoading(true);
//             try {
//               const response = await fetchStudentApplications(schoolEmail);
//               setApplications(response.data);
//             } catch (error) {
//               console.error("Error fetching applications:", error);
//             } finally {
//               setLoading(false);
//             }
//         };
//         getApps();
//     }, [schoolEmail]);

//     const handleStatusChange = (id, newStatus) => {
//         setApplications(prevApps => prevApps.map(app => app.id === id ? { ...app, status: newStatus } : app));
//         console.log(`Updating status for application ${id} to ${newStatus}`);
//     };

//     if (loading) return <div className="p-8 text-center">Loading applications...</div>;

//     return (
//         <div className="p-8">
//             <h2 className="text-3xl font-bold mb-6 text-gray-800">Student Applications</h2>
//             <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//                 <table className="min-w-full">
//                     <thead className="bg-gray-100">
//                         <tr>
//                             <th className="p-4 text-left text-sm font-semibold text-gray-600">Student Name</th>
//                             <th className="p-4 text-left text-sm font-semibold text-gray-600">Class</th>
//                             <th className="p-4 text-left text-sm font-semibold text-gray-600">Date</th>
//                             <th className="p-4 text-left text-sm font-semibold text-gray-600">Status</th>
//                             <th className="p-4 text-left text-sm font-semibold text-gray-600">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {applications.map(app => (
//                             <tr key={app.id} className="border-t">
//                                 <td className="p-4">{app.studentName}</td>
//                                 <td className="p-4">{app.class}</td>
//                                 <td className="p-4">{app.date}</td>
//                                 <td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${app.status === 'Accepted' ? 'bg-green-100 text-green-800' : app.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>{app.status}</span></td>
//                                 <td className="p-4 flex space-x-2">
//                                     <button onClick={() => handleStatusChange(app.id, 'Accepted')} className="p-2 text-green-600 bg-green-100 rounded-full hover:bg-green-200"><Check size={16} /></button>
//                                     <button onClick={() => handleStatusChange(app.id, 'Rejected')} className="p-2 text-red-600 bg-red-100 rounded-full hover:bg-red-200"><X size={16} /></button>
//                                     <button className="text-sm text-blue-600 hover:underline">Details</button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//                 {applications.length === 0 && <p className="p-8 text-center text-gray-500">No student applications received yet.</p>}
//             </div>
//         </div>
//     );
// };


// const SchoolPortalPage = ({ currentUser, onLogout, onRegister }) => {
//     const navigate = useNavigate();
    
//     if (!currentUser || currentUser.role !== 'school') {
//         return <div className="container mx-auto px-6 py-20 text-center"><p>Access Denied. Please log in as a school.</p></div>;
//     }
    
//     return (
//         <div>
//             <SchoolHeader schoolName={currentUser?.name} onLogout={onLogout} />
//             <Routes>
//                 <Route path="applications" element={<ViewStudentApplications schoolEmail={currentUser?.email} />} />
//                 <Route path="register" element={<RegistrationPage onRegister={onRegister} onRegisterSuccess={() => navigate('/school-portal/applications')} />} />
//                 <Route index element={<ViewStudentApplications schoolEmail={currentUser?.email} />} />
//             </Routes>
//         </div>
//     );
// };

// export default SchoolPortalPage;
