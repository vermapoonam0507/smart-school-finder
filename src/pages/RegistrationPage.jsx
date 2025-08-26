// src/pages/RegistrationPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchFormSchema } from '../api/mockApi'; // Assuming you still need this for the form structure
import { addSchool } from '../api/adminService'; // Nayi service file se function import kiya
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify'; // For showing success/error messages

// FormField aur DynamicListField components mein koi badlav nahi hai
// ... (Your FormField and DynamicListField components go here exactly as they were)
const FormField = ({ field, value, onChange, disabled }) => {
    const { name, label, type, required, enum: options } = field;
    const handleChange = (e) => { onChange(name, e.target.value); };
    const handleCheckboxChange = (option, isChecked) => {
        const currentValues = value || [];
        if (isChecked) { onChange(name, [...currentValues, option]); } 
        else { onChange(name, currentValues.filter(val => val !== option)); }
    };
    const renderInput = () => {
        if (type === 'String' && options) {
            return (
                <select id={name} name={name} value={value || ''} onChange={handleChange} required={required} disabled={disabled} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            );
        }
        if (type === 'Array' && options) {
            return (
                <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {options.map(opt => (
                        <label key={opt} className="flex items-center">
                            <input type="checkbox" name={name} value={opt} checked={(value || []).includes(opt)} onChange={(e) => handleCheckboxChange(opt, e.target.checked)} disabled={disabled} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
                            <span className="ml-2 text-gray-700">{opt}</span>
                        </label>
                    ))}
                </div>
            );
        }
        return (
            <input
                type={type === 'Number' ? 'number' : 'text'}
                id={name} name={name} value={value || ''} onChange={handleChange}
                required={required} disabled={disabled}
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

const DynamicListField = ({ field, value, onChange, disabled }) => {
    const { name, label, fields } = field;
    const list = value || [];
    const handleAddItem = () => {
        const newItem = fields.reduce((acc, f) => ({ ...acc, [f.name]: '' }), {});
        onChange(name, [...list, newItem]);
    };
    const handleRemoveItem = (index) => {
        onChange(name, list.filter((_, i) => i !== index));
    };
    const handleItemChange = (index, fieldName, fieldValue) => {
        const updatedList = list.map((item, i) => i === index ? { ...item, [fieldName]: fieldValue } : item);
        onChange(name, updatedList);
    };
    return (
        <div>
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {list.map((item, index) => (
                <div key={index} className="p-4 my-2 border rounded-md bg-gray-50 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {fields.map(f => (
                            <div key={f.name}>
                                <label htmlFor={`${name}-${index}-${f.name}`} className="text-xs text-gray-600">{f.label}</label>
                                <input
                                    type={f.type === 'Number' ? 'number' : 'text'}
                                    id={`${name}-${index}-${f.name}`}
                                    value={item[f.name] || ''}
                                    onChange={(e) => handleItemChange(index, f.name, e.target.value)}
                                    disabled={disabled}
                                    className="w-full px-2 py-1 mt-1 border border-gray-300 rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(index)} disabled={disabled} className="absolute top-2 right-2 text-red-500 hover:text-red-700 disabled:opacity-50">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddItem} disabled={disabled} className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50">
                <PlusCircle size={16} className="mr-1" /> Add {label}
            </button>
        </div>
    );
};


const RegistrationPage = () => {
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [loadingSchema, setLoadingSchema] = useState(true);
  
  // State for API submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    const getSchema = async () => {
      setLoadingSchema(true);
      try {
        const formSchema = await fetchFormSchema();
        setSchema(formSchema);
      } catch (error) {
        console.error("Failed to load form schema", error);
        toast.error("Could not load the registration form. Please try again later.");
      } finally {
        setLoadingSchema(false);
      }
    };
    getSchema();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form submit karne par ab yeh function chalega
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // API call ho rahi hai
      const response = await addSchool(formData);
      console.log('School added successfully:', response.data);
      
      toast.success('School Registration Successful!');
      
      // Success ke baad user ko dashboard ya kisi aur page par bhej denge
      navigate('/dashboard'); 

    } catch (error) {
      console.error('School registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please check your data and try again.';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingSchema) {
    return <div className="p-8 text-center text-lg">Loading Registration Form...</div>;
  }

  return (
    <div className="bg-gray-100 min-h-screen py-8 sm:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-lg shadow-lg space-y-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">School Registration</h1>
          
          {schema && Object.entries(schema).map(([sectionTitle, fields]) => (
            <div key={sectionTitle} className="border-t border-gray-200 pt-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">{sectionTitle}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map(field => {
                  const isFullWidth = field.type === 'ListOfObjects' || ['description', 'activities', 'predefinedAmenities'].includes(field.name);
                  return (
                    <div key={field.name} className={isFullWidth ? 'md:col-span-2' : ''}>
                      {field.type === 'ListOfObjects' ? (
                        <DynamicListField 
                          field={field}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      ) : (
                        <FormField 
                          field={field} 
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          disabled={isSubmitting}
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting Application...' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
