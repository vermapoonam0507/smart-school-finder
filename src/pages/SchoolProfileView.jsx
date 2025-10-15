import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSchoolById, updateSchoolInfo } from "../api/adminService";
import { toast } from "react-toastify";

const Row = ({ label, value }) => (
  <div className="grid grid-cols-3 gap-3 py-2 border-b last:border-b-0">
    <div className="col-span-1 text-gray-500 text-sm">{label}</div>
    <div className="col-span-2 text-gray-900 font-medium break-words">{value || "—"}</div>
  </div>
);

const Section = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow p-6 ring-1 ring-gray-200">
    <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
    {children}
  </div>
);

const SchoolProfileView = () => {
  const { user: currentUser } = useAuth();
  const [school, setSchool] = useState(null);
  const [resolvedSchoolId, setResolvedSchoolId] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const id = (typeof localStorage!=='undefined' && localStorage.getItem('lastCreatedSchoolId'))
          || currentUser?.schoolId
          || currentUser?._id
          || currentUser?.authId;
        if (!id) {
          setError("No school identifier found for current user.");
          setLoading(false);
          return;
        }
        const res = await getSchoolById(id);
        const s = res?.data?.data || res?.data || {};
        setSchool(s);
        // Remember the actual school id we should use for updates
        setResolvedSchoolId(s?._id || id);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to load school profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentUser]);

  if (loading) {
    return <div className="p-8 text-center">Loading school profile...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-600">{error}</div>;
  }

  if (!school) {
    return <div className="p-8 text-center text-gray-600">No school profile found.</div>;
  }

  const languageMedium = Array.isArray(school.languageMedium)
    ? school.languageMedium.join(", ")
    : school.languageMedium;
  const shifts = Array.isArray(school.shifts) ? school.shifts.join(", ") : school.shifts;
  const teacherStudentRatio = school.TeacherToStudentRatio || school.teacherStudentRatio || school.teacherToStudentRatio || "";

  const onChange = (e) => {
    const { name, value } = e.target;
    setSchool((prev) => ({ ...prev, [name]: value }));
  };

  const onSave = async () => {
    try {
      setSaving(true);
      const id = resolvedSchoolId || currentUser?.schoolId || currentUser?._id || currentUser?.authId;
      if (!id) throw new Error("Missing school id");
      const payload = { ...school };
      if (typeof payload.languageMedium === 'string') {
        payload.languageMedium = payload.languageMedium
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      if (payload.shifts && !Array.isArray(payload.shifts)) {
        payload.shifts = String(payload.shifts).split(',').map(s=>s.trim()).filter(Boolean);
      }
      // Normalize teacher-student ratio key casing for backend
      if (payload.TeacherToStudentRatio && !payload.teacherStudentRatio) {
        payload.teacherStudentRatio = payload.TeacherToStudentRatio;
      }
      if (payload.teacherToStudentRatio && !payload.teacherStudentRatio) {
        payload.teacherStudentRatio = payload.teacherToStudentRatio;
      }
      await updateSchoolInfo(id, payload);
      toast.success("School profile updated");
      setIsEditing(false);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-[70vh]">
      <div className="bg-white rounded-lg shadow p-6 ring-1 ring-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">School Profile</h2>
          <div className="flex items-center gap-3">
            <span className="text-sm px-2 py-1 rounded bg-gray-100 text-gray-700">Status: {(school.status || "—").toString()}</span>
            {isEditing ? (
              <button onClick={onSave} disabled={saving} className="px-3 py-1.5 bg-blue-600 text-white rounded disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 border border-gray-300 rounded">Edit</button>
            )}
          </div>
        </div>
      </div>

      <Section title="Basic Information">
        <div className="divide-y">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="name" value={school.name || ''} onChange={onChange} className="border p-2 rounded" placeholder="School Name" />
              <input name="email" value={school.email || ''} onChange={onChange} className="border p-2 rounded" placeholder="Email" />
              <input name="mobileNo" value={school.mobileNo || school.phoneNo || ''} onChange={(e) => setSchool(prev => ({ ...prev, mobileNo: e.target.value }))} className="border p-2 rounded" placeholder="Phone Number" />
              <input name="website" value={school.website || ''} onChange={onChange} className="border p-2 rounded" placeholder="Website" />
              <input name="address" value={school.address || ''} onChange={onChange} className="border p-2 rounded md:col-span-2" placeholder="Address" />
              <textarea name="description" value={school.description || ''} onChange={onChange} className="border p-2 rounded md:col-span-2" rows={3} placeholder="Description" />
            </div>
          ) : (
            <>
              <Row label="School Name" value={school.name} />
              <Row label="Email" value={school.email} />
              <Row label="Phone Number" value={school.mobileNo || school.phoneNo} />
              <Row label="Website" value={school.website} />
              <Row label="Address" value={school.address} />
              <Row label="Description" value={school.description} />
            </>
          )}
        </div>
      </Section>

      <Section title="Academics">
        <div className="divide-y">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="board" value={school.board || ''} onChange={onChange} className="border p-2 rounded" placeholder="Board" />
              <input name="upto" value={school.upto || ''} onChange={onChange} className="border p-2 rounded" placeholder="Upto Class" />
              <input name="feeRange" value={school.feeRange || ''} onChange={onChange} className="border p-2 rounded" placeholder="Fee Range" />
              <input name="genderType" value={school.genderType || ''} onChange={onChange} className="border p-2 rounded" placeholder="Gender Type" />
              <input name="schoolMode" value={school.schoolMode || ''} onChange={onChange} className="border p-2 rounded" placeholder="School Mode" />
              <input name="shifts" value={shifts || ''} onChange={(e) => setSchool(prev => ({ ...prev, shifts: e.target.value }))} className="border p-2 rounded" placeholder="Shifts (comma separated)" />
              <input name="languageMedium" value={languageMedium || ''} onChange={onChange} className="border p-2 rounded md:col-span-2" placeholder="Language Medium (comma separated)" />
              <input name="TeacherToStudentRatio" value={teacherStudentRatio} onChange={(e) => setSchool(prev => ({ ...prev, TeacherToStudentRatio: e.target.value }))} className="border p-2 rounded" placeholder="Teacher:Student Ratio" />
            </div>
          ) : (
            <>
              <Row label="Board" value={school.board} />
              <Row label="Upto Class" value={school.upto} />
              <Row label="Fee Range" value={school.feeRange} />
              <Row label="Gender Type" value={school.genderType} />
              <Row label="School Mode" value={school.schoolMode} />
              <Row label="Shifts" value={shifts} />
              <Row label="Language Medium" value={languageMedium} />
              <Row label="Teacher:Student Ratio" value={teacherStudentRatio} />
            </>
          )}
        </div>
      </Section>

      <Section title="Location">
        <div className="divide-y">
          {isEditing ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="city" value={school.city || ''} onChange={onChange} className="border p-2 rounded" placeholder="City" />
              <input name="state" value={school.state || ''} onChange={onChange} className="border p-2 rounded" placeholder="State" />
              <input name="pinCode" value={school.pinCode || school.pincode || ''} onChange={(e) => setSchool(prev => ({ ...prev, pinCode: e.target.value }))} className="border p-2 rounded" placeholder="Pin Code" />
              <input name="transportAvailable" value={school.transportAvailable || ''} onChange={onChange} className="border p-2 rounded" placeholder="Transport Available (yes/no)" />
              <input name="latitude" value={school.latitude || ''} onChange={onChange} className="border p-2 rounded" placeholder="Latitude" />
              <input name="longitude" value={school.longitude || ''} onChange={onChange} className="border p-2 rounded" placeholder="Longitude" />
            </div>
          ) : (
            <>
              <Row label="City" value={school.city} />
              <Row label="State" value={school.state} />
              <Row label="Pin Code" value={school.pinCode || school.pincode} />
              <Row label="Transport Available" value={school.transportAvailable} />
              <Row label="Latitude" value={school.latitude} />
              <Row label="Longitude" value={school.longitude} />
            </>
          )}
        </div>
      </Section>
    </div>
  );
};

export default SchoolProfileView;


