import React, { useState, useEffect } from 'react';
import { fetchFormSchema } from '../api/mockApi';
import { PlusCircle, Trash2 } from 'lucide-react';

// Reusable FormField Component
const FormField = ({ field, value, onChange }) => {
  const { name, label, type, required, enum: options } = field;

  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  const handleCheckboxChange = (option, isChecked) => {
    const currentValues = value || [];
    if (isChecked) {
      onChange(name, [...currentValues, option]);
    } else {
      onChange(name, currentValues.filter(val => val !== option));
    }
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
    if (type === 'Array' && options) {
      return (
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {options.map(opt => (
            <label key={opt} className="flex items-center">
              <input type="checkbox" name={name} value={opt} checked={(value || []).includes(opt)} onChange={(e) => handleCheckboxChange(opt, e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"/>
              <span className="ml-2 text-gray-700">{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    return (
      <input
        type={type === 'Number' ? 'number' : 'text'}
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

// Dynamic List of Objects ke liye naya component
const DynamicListField = ({ field, value, onChange }) => {
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
        const updatedList = list.map((item, i) => 
            i === index ? { ...item, [fieldName]: fieldValue } : item
        );
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
                                    className="w-full px-2 py-1 mt-1 border border-gray-300 rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={() => handleRemoveItem(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                        <Trash2 size={18} />
                    </button>
                </div>
            ))}
            <button type="button" onClick={handleAddItem} className="mt-2 flex items-center text-sm text-blue-600 hover:text-blue-800">
                <PlusCircle size={16} className="mr-1" /> Add {label}
            </button>
        </div>
    );
};


const RegistrationPage = ({ onNavigate }) => {
  const [schema, setSchema] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSchema = async () => {
      setLoading(true);
      const formSchema = await fetchFormSchema();
      setSchema(formSchema);
      setLoading(false);
    };
    getSchema();
  }, []);

  const handleInputChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted Data:", formData);
    alert("Registration Successful! (Check console for data)");
    onNavigate('landing'); 
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading Registration Form...</div>;
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
                  const isFullWidth = field.type === 'ListOfObjects' || field.name === 'description' || field.name === 'activities' || field.name === 'predefinedAmenities';
                  return (
                    <div key={field.name} className={isFullWidth ? 'md:col-span-2' : ''}>
                      {field.type === 'ListOfObjects' ? (
                        <DynamicListField 
                          field={field}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                        />
                      ) : (
                        <FormField 
                          field={field} 
                          value={formData[field.name]}
                          onChange={handleInputChange}
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
            className="w-full px-4 py-3 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrationPage;
