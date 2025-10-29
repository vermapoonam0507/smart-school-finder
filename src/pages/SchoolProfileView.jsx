import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getSchoolById } from "../api/adminService";
import { toast } from "react-toastify";
import {
  getAmenitiesById,
  getActivitiesById,
  getInfrastructureById,
  getFeesAndScholarshipsById,
  getTechnologyAdoptionById,
  getSafetyAndSecurityById,
  getInternationalExposureById,
  getOtherDetailsById,
  getAdmissionTimelineById,
  getAcademicsById,
  getFacultyById
} from "../api/adminService";
import { getAlumniBySchool } from "../api/schoolService";

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
  // Read-only view (edit removed)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [amenities, setAmenities] = useState(null);
  const [activities, setActivities] = useState(null);
  const [infrastructure, setInfrastructure] = useState(null);
  const [fees, setFees] = useState(null);
  const [tech, setTech] = useState(null);
  const [safety, setSafety] = useState(null);
  const [intl, setIntl] = useState(null);
  const [otherDetails, setOtherDetails] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [academics, setAcademics] = useState(null);
  const [faculty, setFaculty] = useState(null);
  const [alumni, setAlumni] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const rawId = (typeof localStorage!=='undefined' && localStorage.getItem('lastCreatedSchoolId'))
          || currentUser?.schoolId
          || currentUser?._id;
        const id = (typeof rawId === 'string' ? rawId : String(rawId || '')).trim();
        
        console.log('🔍 SchoolProfileView - Loading profile for ID:', id);
        console.log('🔍 currentUser:', currentUser);
        
        if (!id) {
          setError("No school identifier found for current user.");
          setLoading(false);
          return;
        }
        const res = await getSchoolById(id, { headers: { 'X-Silent-Request': '1' } });
        const s = res?.data?.data || res?.data || {};
        setSchool(s);
        // Remember the actual school id we should use for updates
        setResolvedSchoolId(s?._id || id);

        const profileId = (s?._id || id || '').toString().trim();
        if (!profileId) {
          // No valid id to fetch sub-resources; leave them null
          return;
        }
        try {
          const [am, ac, inf, fe, te, sa, ine, od, tl, acd, fc, al] = await Promise.all([
            getAmenitiesById(profileId).catch(() => null),
            getActivitiesById(profileId).catch(() => null),
            getInfrastructureById(profileId).catch(() => null),
            getFeesAndScholarshipsById(profileId).catch(() => null),
            getTechnologyAdoptionById(profileId).catch(() => null),
            getSafetyAndSecurityById(profileId).catch(() => null),
            getInternationalExposureById(profileId).catch(() => null),
            getOtherDetailsById(profileId).catch(() => null),
            getAdmissionTimelineById(profileId).catch(() => null),
            getAcademicsById(profileId).catch(() => null),
            getFacultyById(profileId).catch(() => null),
            getAlumniBySchool(profileId).catch(() => null)
          ]);
          setAmenities(am?.data?.data || am?.data || null);
          setActivities(ac?.data?.data || ac?.data || null);
          setInfrastructure(inf?.data?.data || inf?.data || null);
          setFees(fe?.data?.data || fe?.data || null);
          setTech(te?.data?.data || te?.data || null);
          setSafety(sa?.data?.data || sa?.data || null);
          setIntl(ine?.data?.data || ine?.data || null);
          setOtherDetails(od?.data?.data || od?.data || null);
          setTimeline(tl?.data?.data || tl?.data || null);
          setAcademics(acd?.data?.data || acd?.data || null);
          setFaculty(fc?.data?.data || fc?.data || null);
          setAlumni(al?.data?.data || al?.data || null);
        } catch (_) {
          // Non-fatal: show what we have
        }
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
  const teacherStudentRatio = 
    school.TeacherToStudentRatio 
    || school.teacherStudentRatio 
    || school.teacherToStudentRatio 
    || (school.studentsPerTeacher != null && school.studentsPerTeacher !== '' ? `1:${school.studentsPerTeacher}` : '')
    || (academics && (academics.teacherStudentRatio || academics.TeacherToStudentRatio))
    || '';

  // Infrastructure fallbacks (ensure section renders even if subresource missing)
  const infraLabs = Array.isArray(infrastructure?.labs)
    ? infrastructure.labs
    : (Array.isArray(school?.labs) ? school.labs : []);
  const infraSports = Array.isArray(infrastructure?.sportsGrounds)
    ? infrastructure.sportsGrounds
    : (Array.isArray(school?.sportsGrounds) ? school.sportsGrounds : []);
  const infraLibraryBooks = (infrastructure && (infrastructure.libraryBooks ?? infrastructure.books))
    ?? (school && (school.libraryBooks ?? school.books))
    ?? '';
  const infraSmartClassrooms = (infrastructure && (infrastructure.smartClassrooms ?? infrastructure.smartRooms))
    ?? (school && (school.smartClassrooms ?? school.smartRooms))
    ?? '';

  // Read-only; no edit/save handlers

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-[70vh]">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 ring-1 ring-indigo-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{school.name || 'School Profile'}</h2>
            <p className="text-sm text-gray-600">Comprehensive profile overview</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-white ring-1 ring-gray-200 text-gray-700">Status: {(school.status || "—").toString()}</span>
            {school.city && <span className="text-xs px-2 py-1 rounded-full bg-white ring-1 ring-gray-200 text-gray-700">{school.city}</span>}
            {school.board && <span className="text-xs px-2 py-1 rounded-full bg-white ring-1 ring-gray-200 text-gray-700">{school.board}</span>}
          </div>
        </div>
      </div>

      <Section title="Basic Information">
        <div className="divide-y">
          <Row label="School Name" value={school.name} />
          <Row label="Email" value={school.email} />
          <Row label="Phone Number" value={school.mobileNo || school.phoneNo} />
          <Row label="Website" value={school.website} />
          <Row label="Address" value={school.address} />
          <Row label="Area" value={school.area} />
          <Row label="Description" value={school.description} />
          <Row label="Rank" value={school.rank} />
          <Row label="Specialist" value={(school.specialist || []).join(', ')} />
          <Row label="Tags" value={(school.tags || []).join(', ')} />
        </div>
      </Section>

      <Section title="Academics">
        <div className="divide-y">
          <Row label="Board" value={school.board} />
          <Row label="Upto Class" value={school.upto} />
          <Row label="Fee Range" value={school.feeRange} />
          <Row label="Gender Type" value={school.genderType} />
          <Row label="School Mode" value={school.schoolMode} />
          <Row label="Shifts" value={shifts} />
          <Row label="Language Medium" value={languageMedium} />
          <Row label="Teacher:Student Ratio" value={teacherStudentRatio} />
          {academics && (
            <>
              <Row label="Average Class 10 Result" value={academics.averageClass10Result} />
              <Row label="Average Class 12 Result" value={academics.averageClass12Result} />
              <Row label="Average School Marks" value={academics.averageSchoolMarks} />
              <Row label="Special Exams Training" value={(academics.specialExamsTraining || []).join(', ')} />
              <Row label="Extra Curricular Activities" value={(academics.extraCurricularActivities || []).join(', ')} />
            </>
          )}
        </div>
      </Section>

      {amenities && (
        <Section title="Amenities">
          <div className="divide-y">
            <Row label="Predefined Amenities" value={(amenities.predefinedAmenities || []).join(', ')} />
            <Row label="Custom Amenities" value={(amenities.customAmenities || []).join(', ')} />
          </div>
        </Section>
      )}

      {activities && (
        <Section title="Activities">
          <div className="divide-y">
            <Row label="Activities" value={(activities.activities || []).join(', ')} />
            <Row label="Custom Activities" value={(activities.customActivities || []).join(', ')} />
          </div>
        </Section>
      )}

      <Section title="Infrastructure">
        <div className="divide-y">
          <Row label="Labs" value={(infraLabs || []).join(', ')} />
          <Row label="Sports Grounds" value={(infraSports || []).join(', ')} />
          <Row label="Library Books" value={infraLibraryBooks} />
          <Row label="Smart Classrooms" value={infraSmartClassrooms} />
        </div>
      </Section>

      {fees && (
        <Section title="Fees & Scholarships">
          <div className="divide-y">
            <Row label="Fee Transparency %" value={fees.feesTransparency} />
            {fees.scholarships && fees.scholarships.length > 0 && (
              <div className="py-3">
                <div className="font-semibold text-gray-700 mb-2">Scholarships</div>
                <div className="space-y-2">
                  {fees.scholarships.map((s, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{s.name || s.type}</span>
                      {s.amount && <span className="text-gray-600"> - ₹{s.amount}</span>}
                      {s.type && s.name && <span className="text-gray-500"> ({s.type})</span>}
                      {s.documentsRequired && s.documentsRequired.length > 0 && (
                        <span className="text-gray-500 text-xs block ml-4">Docs: {s.documentsRequired.join(', ')}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {fees.classFees && fees.classFees.length > 0 && (
              <div className="py-3">
                <div className="font-semibold text-gray-700 mb-2">Class-wise Fees</div>
                <div className="space-y-2">
                  {fees.classFees.map((f, idx) => (
                    <div key={idx} className="text-sm">
                      <div className="font-medium">{f.className || f.class}</div>
                      <div className="ml-4 text-gray-600 text-xs">
                        {f.tuition != null && <span>Tuition: ₹{f.tuition}</span>}
                        {f.activity != null && f.activity > 0 && <span>, Activity: ₹{f.activity}</span>}
                        {f.transport != null && f.transport > 0 && <span>, Transport: ₹{f.transport}</span>}
                        {f.hostel != null && f.hostel > 0 && <span>, Hostel: ₹{f.hostel}</span>}
                        {f.misc != null && f.misc > 0 && <span>, Misc: ₹{f.misc}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {tech && (
        <Section title="Technology Adoption">
          <div className="divide-y">
            <Row label="Smart Classrooms %" value={tech.smartClassroomsPercentage} />
            <Row label="E-Learning Platforms" value={
              (tech.eLearningPlatforms || []).map(p => 
                typeof p === 'string' ? p : (p.platform || '')
              ).filter(Boolean).join(', ')
            } />
          </div>
        </Section>
      )}

      {safety && (
        <Section title="Safety & Security">
          <div className="divide-y">
            <Row label="CCTV Coverage %" value={safety.cctvCoveragePercentage} />
            <Row label="Doctor Availability" value={safety.medicalFacility?.doctorAvailability} />
            <Row label="Medkit Available" value={String(safety.medicalFacility?.medkitAvailable)} />
            <Row label="Ambulance Available" value={String(safety.medicalFacility?.ambulanceAvailable)} />
            <Row label="GPS Tracker" value={String(safety.transportSafety?.gpsTrackerAvailable)} />
            <Row label="Drivers Verified" value={String(safety.transportSafety?.driversVerified)} />
            <Row label="Fire Safety Measures" value={(safety.fireSafetyMeasures || []).join(', ')} />
            <Row label="Visitor Management System" value={String(safety.visitorManagementSystem)} />
          </div>
        </Section>
      )}

      {intl && (
        <Section title="International Exposure">
          <div className="divide-y">
            {intl.exchangePrograms && intl.exchangePrograms.length > 0 && (
              <div className="py-3">
                <div className="font-semibold text-gray-700 mb-2">Exchange Programs</div>
                <div className="space-y-2">
                  {intl.exchangePrograms.map((p, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{p.partnerSchool || p.school}</span>
                      {(p.programType || p.type) && <span className="text-gray-600"> - {p.programType || p.type}</span>}
                      {p.duration && <span className="text-gray-500"> ({p.duration})</span>}
                      {p.country && <span className="text-gray-500"> • {p.country}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            {intl.globalTieUps && intl.globalTieUps.length > 0 && (
              <div className="py-3">
                <div className="font-semibold text-gray-700 mb-2">Global Tie-ups</div>
                <div className="space-y-2">
                  {intl.globalTieUps.map((t, idx) => (
                    <div key={idx} className="text-sm">
                      <span className="font-medium">{t.organization || t.name}</span>
                      {(t.since || t.year) && <span className="text-gray-600"> (Since {t.since || t.year})</span>}
                      {t.country && <span className="text-gray-500"> • {t.country}</span>}
                      {t.purpose && <span className="text-gray-500 block ml-4 text-xs">{t.purpose}</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Section>
      )}

      {otherDetails && (
        <Section title="Diversity & Inclusivity">
          <div className="divide-y">
            <Row label="Gender Ratio" value={`Male ${otherDetails.genderRatio?.male || 0}%, Female ${otherDetails.genderRatio?.female || 0}%, Others ${otherDetails.genderRatio?.others || 0}%`} />
            <Row label="Scholarship Types" value={(otherDetails.scholarshipDiversity?.types || []).join(', ')} />
            <Row label="Students Covered %" value={otherDetails.scholarshipDiversity?.studentsCoveredPercentage} />
            <Row label="Dedicated Staff" value={String(otherDetails.specialNeedsSupport?.dedicatedStaff)} />
            <Row label="Students Supported %" value={otherDetails.specialNeedsSupport?.studentsSupportedPercentage} />
            <Row label="Facilities Available" value={(otherDetails.specialNeedsSupport?.facilitiesAvailable || []).join(', ')} />
          </div>
        </Section>
      )}

      {timeline && timeline.timelines && timeline.timelines.length > 0 && (
        <Section title="Admission Process Timeline">
          <div className="space-y-4">
            {timeline.timelines.map((t, idx) => (
              <div key={idx} className="border-b pb-4 last:border-b-0">
                <div className="font-semibold text-gray-800 mb-2">Admission Period {idx + 1}</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">Start Date:</div>
                  <div className="text-gray-900">{new Date(t.admissionStartDate).toLocaleDateString()}</div>
                  <div className="text-gray-600">End Date:</div>
                  <div className="text-gray-900">{new Date(t.admissionEndDate).toLocaleDateString()}</div>
                  <div className="text-gray-600">Status:</div>
                  <div className="text-gray-900">{t.status}</div>
                  {t.eligibility?.admissionLevel && (
                    <>
                      <div className="text-gray-600">Level:</div>
                      <div className="text-gray-900">{t.eligibility.admissionLevel}</div>
                    </>
                  )}
                  {t.eligibility?.ageCriteria && (
                    <>
                      <div className="text-gray-600">Age Criteria:</div>
                      <div className="text-gray-900">{t.eligibility.ageCriteria}</div>
                    </>
                  )}
                  {t.documentsRequired && t.documentsRequired.length > 0 && (
                    <>
                      <div className="text-gray-600">Documents:</div>
                      <div className="text-gray-900">{t.documentsRequired.join(', ')}</div>
                    </>
                  )}
                  {t.eligibility?.otherInfo && (
                    <>
                      <div className="text-gray-600 col-span-2">Other Info:</div>
                      <div className="text-gray-900 col-span-2">{t.eligibility.otherInfo}</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {faculty && (
        <Section title="Faculty">
          <div className="divide-y">
            {(faculty.facultyMembers || faculty.members || []).map((m, idx) => (
              <Row key={idx} label={m.name || `Faculty ${idx+1}`} value={`${m.qualification || ''}${m.experience ? `, ${m.experience} yrs` : ''}${m.awards ? `, Awards: ${m.awards}` : ''}`} />
            ))}
          </div>
        </Section>
      )}

      {alumni && (alumni.famousAlumnies?.length > 0 || alumni.topAlumnies?.length > 0 || alumni.otherAlumnies?.length > 0) && (
        <Section title="Alumni">
          <div className="divide-y">
            {alumni.famousAlumnies && alumni.famousAlumnies.length > 0 && (
              <>
                <div className="py-3">
                  <div className="font-semibold text-gray-700 mb-2">Famous Alumni</div>
                  <div className="space-y-2">
                    {alumni.famousAlumnies.map((alumniItem, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{alumniItem.name}</span>
                        {alumniItem.profession && <span className="text-gray-600"> - {alumniItem.profession}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {alumni.topAlumnies && alumni.topAlumnies.length > 0 && (
              <>
                <div className="py-3">
                  <div className="font-semibold text-gray-700 mb-2">Top Performers</div>
                  <div className="space-y-2">
                    {alumni.topAlumnies.map((alumniItem, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{alumniItem.name}</span>
                        {alumniItem.percentage && <span className="text-gray-600"> - {alumniItem.percentage}%</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {alumni.otherAlumnies && alumni.otherAlumnies.length > 0 && (
              <>
                <div className="py-3">
                  <div className="font-semibold text-gray-700 mb-2">Other Alumni</div>
                  <div className="space-y-2">
                    {alumni.otherAlumnies.map((alumniItem, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium">{alumniItem.name}</span>
                        {alumniItem.percentage && <span className="text-gray-600"> - {alumniItem.percentage}%</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </Section>
      )}

      <Section title="Location">
        <div className="divide-y">
          <Row label="City" value={school.city} />
          <Row label="State" value={school.state} />
          <Row label="Pin Code" value={school.pinCode || school.pincode} />
          <Row label="Transport Available" value={school.transportAvailable} />
          <Row label="Latitude" value={school.latitude} />
          <Row label="Longitude" value={school.longitude} />
        </div>
      </Section>
    </div>
  );
};

export default SchoolProfileView;


