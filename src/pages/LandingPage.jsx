import React from 'react';
import { Search, GraduationCap, FileText, Star } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';

const LandingPage = ({ onNavigate }) => (
  <div className="bg-gray-50">
    <section className="text-center py-20 md:py-32 bg-white">
      <div className="container mx-auto px-6">
        <GraduationCap size={48} className="mx-auto text-blue-600 mb-4" />
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">Find Your Perfect School</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Discover, compare, and apply to the best schools for your educational journey. From elementary to high school, find institutions that match your aspirations.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg w-full sm:w-auto" onClick={() => onNavigate('schools')}>
            Browse Schools
          </button>
          <button className="bg-white text-gray-700 font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors border border-gray-300 shadow-lg w-full sm:w-auto" onClick={() => onNavigate('register')}>
            Register Your School
          </button>
        </div>
      </div>
    </section>
    <section className="py-20">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">Why Choose SchoolFinder?</h2>
        <p className="text-center text-gray-600 mb-12">Everything you need to make informed decisions about education.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Search size={32} />}
            title="Comprehensive Search"
            text="Easily search and filter through thousands of schools based on your preferences."
          />
          <FeatureCard
            icon={<FileText size={32} />}
            title="Easy Applications"
            text="Submit applications to multiple schools with a single, streamlined profile."
          />
          <FeatureCard
            icon={<Star size={32} />}
            title="Quality Schools"
            text="Browse detailed profiles of verified and quality-rated schools."
          />
        </div>
      </div>
    </section>
    <section className="bg-gray-800 text-white">
      <div className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
        <p className="text-gray-300 mb-8">Join thousands of students finding their perfect educational match.</p>
        <button className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg" onClick={() => onNavigate('schools')}>
          Explore Schools Now
        </button>
      </div>
    </section>
  </div>
);

export default LandingPage;