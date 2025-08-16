import React, { useState } from 'react';
import { School, LogOut, FileText, Eye, Download } from 'lucide-react';
import RegistrationPage from './RegistrationPage';

const SchoolHeader = ({ schoolName, onLogout, onNavigate }) => (
    <header className="bg-white shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="text-xl font-bold text-gray-800">
                <School className="inline-block mr-2 text-blue-600" />
                School Portal
            </div>
            <div className="flex items-center space-x-6">
                <button onClick={() => onNavigate('register-form')} className="text-gray-600 hover:text-blue-600 flex items-center">
                    <FileText size={18} className="mr-2" /> Register Your School
                </button>
                <button onClick={() => onNavigate('view-application')} className="text-gray-600 hover:text-blue-600 flex items-center">
                    <Eye size={18} className="mr-2" /> View My Application
                </button>
                <span className="text-gray-500">|</span>
                <span className="text-gray-700">Welcome, {schoolName}!</span>
                <button onClick={onLogout} className="text-gray-600 hover:text-blue-600 flex items-center">
                    <LogOut size={16} className="mr-1" /> Logout
                </button>
            </div>
        </nav>
    </header>
);

const ViewApplicationPage = ({ schoolName }) => {
    // Yeh status backend se aayega. Abhi hum ise simulate kar rahe hain.
    const applicationStatus = 'Pending'; 

    const getStatusClass = (status) => {
        if (status === 'Accept') return 'bg-green-100 text-green-800';
        if (status === 'Reject') return 'bg-red-100 text-red-800';
        return 'bg-yellow-100 text-yellow-800';
    };

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">My School Application</h2>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                    {/* School Name */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">School Name</h3>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{schoolName}</p>
                    </div>

                    {/* View PDF */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500">Submitted Application</h3>
                        <button 
                            onClick={() => alert('PDF viewer will open here (Simulation).')}
                            className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Download size={16} className="mr-2" /> View PDF
                        </button>
                    </div>

                    {/* Status */}
                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Application Status</h3>
                        <div className="flex space-x-2">
                            {['Pending', 'Accept', 'Reject'].map(status => (
                                <span 
                                    key={status}
                                    className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                        applicationStatus === status ? getStatusClass(status) : 'bg-gray-100 text-gray-500'
                                    }`}
                                >
                                    {status}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const SchoolPortalPage = ({ currentUser, onLogout }) => {
    const [portalPage, setPortalPage] = useState('register-form');

    if (!currentUser || currentUser.role !== 'school') {
        return (
            <div className="container mx-auto px-6 py-20 text-center">
                <p>You do not have access to this page. Please log in as a school.</p>
            </div>
        );
    }

    const renderPortalContent = () => {
        switch (portalPage) {
            case 'register-form':
                return <RegistrationPage />;
            case 'view-application':
                return <ViewApplicationPage schoolName={currentUser.name} />;
            default:
                return <RegistrationPage />;
        }
    };

    return (
        <div>
            <SchoolHeader 
                schoolName={currentUser.name} 
                onLogout={onLogout}
                onNavigate={setPortalPage}
            />
            <main>
                {renderPortalContent()}
            </main>
        </div>
    );
};

export default SchoolPortalPage;
