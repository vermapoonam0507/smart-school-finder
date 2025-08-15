import React from 'react';
import { MapPin } from 'lucide-react';
import AccordionItem from '../components/AccordionItem';

const SchoolDetailsPage = ({ school, onNavigate }) => {
    if (!school) {
        return (
            <div className="flex flex-col justify-center items-center h-screen">
                <p>No school selected.</p>
                <button onClick={() => onNavigate('schools')} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Back to Schools</button>
            </div>
        );
    }

    const { basicInfo, activityInfo, alumniInfo, amenitiesInfo } = school;

    // Helper function to render custom amenities safely
    const renderCustomAmenities = () => {
        if (!amenitiesInfo.customAmenities || typeof amenitiesInfo.customAmenities !== 'string') {
            return null;
        }
        const customList = amenitiesInfo.customAmenities.split(',').map(item => item.trim()).filter(Boolean);
        if (customList.length === 0) {
            return null;
        }
        return customList.map(amenity => (
            <span key={amenity} className="bg-pink-100 text-pink-800 text-sm font-medium px-3 py-1 rounded-full">{amenity}</span>
        ));
    };

    return (
        <div className="bg-gray-100">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">{basicInfo.name}</h1>
                    <p className="text-lg text-gray-600 flex items-center mb-4"><MapPin size={18} className="mr-2" />{basicInfo.city}, {basicInfo.state}</p>
                    <p className="text-md text-gray-700">{basicInfo.description}</p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <a href={basicInfo.website} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">Visit Website</a>
                        <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors">Apply Now</button>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="bg-white shadow-lg rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">School Information</h2>
                    <AccordionItem title="Basic Info">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
                            <p><strong className="block text-gray-500">Board:</strong> {basicInfo.board}</p>
                            <p><strong className="block text-gray-500">Type:</strong> {basicInfo.genderType}</p>
                            <p><strong className="block text-gray-500">Mode:</strong> {basicInfo.schoolMode}</p>
                            <p><strong className="block text-gray-500">Grades:</strong> Up to {basicInfo.upto}</p>
                            <p><strong className="block text-gray-500">Medium:</strong> {basicInfo.languageMedium.join(', ')}</p>
                            <p><strong className="block text-gray-500">Transport:</strong> {basicInfo.transportAvailable}</p>
                            <p><strong className="block text-gray-500">Fee Range:</strong> ₹{basicInfo.feeRange}</p>
                        </div>
                    </AccordionItem>
                     <AccordionItem title="Activities & Focus">
                        <div className="flex flex-wrap gap-2">
                            {activityInfo.activities.map(activity => (
                                <span key={activity} className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full">{activity}</span>
                            ))}
                        </div>
                    </AccordionItem>
                    <AccordionItem title="Amenities">
                        <div className="flex flex-wrap gap-2">
                            {amenitiesInfo.predefinedAmenities.map(amenity => (
                                <span key={amenity} className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">{amenity}</span>
                            ))}
                            {renderCustomAmenities()}
                        </div>
                    </AccordionItem>
                    <AccordionItem title="Notable Alumni">
                        {alumniInfo.famousAlumnies.map(alumni => (
                            <p key={alumni.name} className="text-sm mb-1"><strong>{alumni.name}</strong> - {alumni.profession}</p>
                        ))}
                        {alumniInfo.famousAlumnies.length === 0 && <p className="text-sm text-gray-500">No famous alumni data available.</p>}
                    </AccordionItem>
                </div>
            </div>
        </div>
    );
};

export default SchoolDetailsPage;
