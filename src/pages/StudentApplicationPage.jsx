import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchStudentApplicationSchema } from '../api/mockApi';
import { FileText } from 'lucide-react';

// FormField component ko yahan reuse kar sakte hain
const FormField = ({ field, value, onChange }) => {
  const { name, label, type, required, enum: options } = field;

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const renderInput = () => {
    if (type === 'String' && options) {
      return (
        <select id={name} name={name} value={value || ''} onChange={handleChange} required={required} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    return (
      <input
        type={type === 'Date' ? 'date' : 'text'}
        id={name}
        name={name}
        value={value || ''}
        onChange={handleChange}
        required={required}
        className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
      />
    );
  };

  return (
    <div>
      <label htmlFor={name} className="text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {renderInput()}
    </div>
  );
};


const StudentApplicationPage = ({ onApply, currentUser }) => {
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const { schoolId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'parent') {
        navigate('/login');
    }
    const getSchema = async () => {
      setLoading(true);
      const formSchema = await fetchStudentApplicationSchema();
      setSchema(formSchema);
      setLoading(false);
    };
    getSchema();
  }, [currentUser, navigate]);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onApply(formData, schoolId);
  };

  if (loading) {
    return <div className="p-8 text-center">Loading Application Form...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-2xl px-4">
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-lg space-y-8">
          <div className="text-center">
            <FileText size={40} className="mx-auto text-blue-600 mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Student Application Form</h1>
          </div>
          
          {schema && Object.entries(schema).map(([sectionTitle, fields]) => (
            <div key={sectionTitle} className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">{sectionTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map(field => (
                  <div key={field.name} className="md:col-span-1">
                    <FormField 
                      field={field} 
                      value={formData[field.name]}
                      onChange={handleInputChange}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default StudentApplicationPage;
