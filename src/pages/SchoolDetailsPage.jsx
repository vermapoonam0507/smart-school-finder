import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, BookOpen, Users, Heart, Building, Award, Sun, Moon, IndianRupee, Languages, Car, Star, CheckCircle } from 'lucide-react';

const InfoBox = ({ icon, label, value }) => (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex items-center text-gray-500 mb-1">
            {icon}
            <h3 className="text-sm font-medium ml-2">{label}</h3>
        </div>
        <p className="text-lg font-semibold text-gray-800">{value || 'N/A'}</p>
    </div>
);

const SchoolDetailsPage = ({ school, currentUser, shortlist, onShortlistToggle }) => {
    const navigate = useNavigate();

    if (!school || !school.basicInfo) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p>No school selected or data is incomplete. Please go back.</p>
                <button onClick={() => navigate('/schools')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Back to Schools</button>
            </div>
        );
    }

    const { basicInfo, activityInfo, alumniInfo, amenitiesInfo } = school;
    const isShortlisted = shortlist.some(item => item.id === school.id);

    const handleApplyNow = () => {
        if (!currentUser || currentUser.role !== 'parent') {
            alert("Please log in as a Parent/Student to apply.");
            navigate('/login');
        } else {
            navigate(`/apply/${school.id}`, { state: { schoolEmail: school.basicInfo.email } });
        }
    };

    const renderCustomAmenities = () => {
        if (!amenitiesInfo?.customAmenities || typeof amenitiesInfo.customAmenities !== 'string') {
            return null;
        }
        const customList = amenitiesInfo.customAmenities.split(',').map(item => item.trim()).filter(Boolean);
        if (customList.length === 0) return null;
        return customList.map(amenity => (
            <span key={amenity} className="bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">{amenity}</span>
        ));
    };

    return (
        <div className="bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8 relative">
                    {currentUser && currentUser.role === 'parent' && (
                        <button onClick={() => onShortlistToggle(school)} className="absolute top-6 right-6 text-gray-400 hover:text-red-500 z-10">
                            <Heart size={28} className={isShortlisted ? "fill-current text-red-500" : ""} />
                        </button>
                    )}
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{basicInfo.name}</h1>
                    <p className="text-lg text-gray-600 flex items-center mb-4"><MapPin size={18} className="mr-2" />{basicInfo.city}, {basicInfo.state}</p>
                    <p className="text-md text-gray-700">{basicInfo.description}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <a href={basicInfo.website} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Visit Website</a>
                        <button onClick={handleApplyNow} className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">
                            Apply Now
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-lg rounded-lg p-6">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Basic Information</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <InfoBox icon={<Award size={16} />} label="Board" value={basicInfo.board} />
                            <InfoBox icon={<Users size={16} />} label="Gender Type" value={basicInfo.genderType} />
                            <InfoBox icon={<Building size={16} />} label="School Mode" value={basicInfo.schoolMode} />
                            <InfoBox icon={<BookOpen size={16} />} label="Classes Upto" value={basicInfo.upto} />
                            <InfoBox icon={<Sun size={16} />} label="Shifts" value={basicInfo.shifts?.join(', ')} />
                            <InfoBox icon={<IndianRupee size={16} />} label="Fee Range" value={basicInfo.feeRange} />
                            <InfoBox icon={<Languages size={16} />} label="Medium" value={basicInfo.languageMedium?.join(', ')} />
                            <InfoBox icon={<Car size={16} />} label="Transport" value={basicInfo.transportAvailable} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Activities & Focus</h2>
                            <div className="flex flex-wrap gap-2">
                                {activityInfo?.activities?.map(activity => (
                                    <span key={activity} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full flex items-center">
                                        <CheckCircle size={14} className="mr-1.5" /> {activity}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Amenities</h2>
                            <div className="flex flex-wrap gap-2">
                                {amenitiesInfo?.predefinedAmenities?.map(amenity => (
                                    <span key={amenity} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">{amenity}</span>
                                ))}
                                {renderCustomAmenities()}
                            </div>
                        </div>
                    </div>
                     
                    <div className="mt-8">
                         <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">Notable Alumni</h2>
                         {alumniInfo?.famousAlumnies?.length > 0 ? (
                            <div className="space-y-2">
                                {alumniInfo.famousAlumnies.map(alumni => (
                                    <p key={alumni.name} className="text-gray-700"><Star size={16} className="inline-block mr-2 text-yellow-500" /><strong>{alumni.name}</strong> - {alumni.profession}</p>
                                ))}
                            </div>
                         ) : (
                            <p className="text-sm text-gray-500">No famous alumni data available.</p>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SchoolDetailsPage;
