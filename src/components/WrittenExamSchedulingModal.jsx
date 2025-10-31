import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';

const WrittenExamSchedulingModal = ({ isOpen, onClose, application, onSchedule }) => {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    venue: '',
    instructions: '',
    documentsToBring: '',
    contactPerson: '',
    contactPhone: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.date || !formData.time || !formData.venue) {
      toast.error('Please fill in all required fields (Date, Time, Venue)');
      return;
    }

    setLoading(true);
    try {
      const examNote = `
Written Exam Scheduled:
- Date: ${formData.date}
- Time: ${formData.time}
- Venue: ${formData.venue}
${formData.contactPerson ? `- Contact Person: ${formData.contactPerson}` : ''}
${formData.contactPhone ? `- Contact Phone: ${formData.contactPhone}` : ''}

Instructions:
${formData.instructions || 'Please arrive 15 minutes early.'}

Documents to Bring:
${formData.documentsToBring || 'Please bring any ID and original documents as required.'}

${formData.additionalNotes ? `Additional Notes: ${formData.additionalNotes}` : ''}
      `.trim();

      // Use same status convention as interview but for written exam
      await onSchedule(application.formId, 'WrittenExam', examNote);
      toast.success('Written exam scheduled successfully!');
      onClose();
    } catch (error) {
      console.error('Error scheduling written exam:', error);
      toast.error('Failed to schedule written exam. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      date: '',
      time: '',
      venue: '',
      instructions: '',
      documentsToBring: '',
      contactPerson: '',
      contactPhone: '',
      additionalNotes: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Calendar className="w-6 h-6 text-blue-600 mr-3" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Schedule Written Exam</h2>
              <p className="text-sm text-gray-600">{application?.studentName} - {application?.schoolName}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Date <span className="text-red-500">*</span>
              </label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required min={new Date().toISOString().split('T')[0]} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exam Time <span className="text-red-500">*</span>
              </label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Venue/Location <span className="text-red-500">*</span></label>
            <input type="text" name="venue" value={formData.venue} onChange={handleInputChange} required placeholder="e.g., Exam Hall A, Ground Floor" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
              <input type="text" name="contactPerson" value={formData.contactPerson} onChange={handleInputChange} placeholder="e.g., Mr. Kumar, Exam Coordinator" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Phone</label>
              <input type="tel" name="contactPhone" value={formData.contactPhone} onChange={handleInputChange} placeholder="e.g., +91 98765 43210" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions for Student</label>
            <textarea name="instructions" value={formData.instructions} onChange={handleInputChange} rows={3} placeholder="e.g., Please arrive 30 minutes early. Carry admission slip and ID." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Documents to Bring</label>
            <textarea name="documentsToBring" value={formData.documentsToBring} onChange={handleInputChange} rows={3} placeholder="e.g., Admission slip, ID, writing materials as specified." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes</label>
            <textarea name="additionalNotes" value={formData.additionalNotes} onChange={handleInputChange} rows={2} placeholder="Any additional information or special instructions..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Written Exam Details Preview:</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Date:</strong> {formData.date || 'Not set'}</p>
              <p><strong>Time:</strong> {formData.time || 'Not set'}</p>
              <p><strong>Venue:</strong> {formData.venue || 'Not set'}</p>
              {formData.contactPerson && <p><strong>Contact:</strong> {formData.contactPerson}</p>}
              {formData.contactPhone && <p><strong>Phone:</strong> {formData.contactPhone}</p>}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={handleClose} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Written Exam
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WrittenExamSchedulingModal;
