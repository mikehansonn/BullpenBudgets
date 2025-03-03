import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllTeams } from '../api/apiService';

function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const teams = getAllTeams();
  
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 text-gray-800">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500 opacity-5 rounded-full blur-3xl"></div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-800 relative inline-block">
            MLB Bullpen Budgets
          </h1>
          <p className="text-xl text-gray-600 mt-6 max-w-2xl mx-auto">
            Explore team statistics and budget allocations for major league pitchers
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search for a team..."
              className="w-full pl-12 pr-4 py-4 rounded-full bg-white border border-gray-200 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {filteredTeams.map((team) => (
            <Link 
              to={`/team/${team.id}`} 
              key={team.id}
              className="group"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 h-full">
                <div 
                  className="h-40 flex items-center justify-center font-bold text-5xl relative overflow-hidden"
                  style={{ backgroundColor: team.color }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black opacity-20 group-hover:opacity-10 transition-opacity"></div>
                  <span className="relative z-10 transform group-hover:scale-110 transition-transform text-white">{team.abbr}</span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{team.name}</h3>
                  <div className="mt-3 flex items-center text-gray-600 font-medium group-hover:text-gray-800 transition-colors">
                    <span>View pitchers</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Empty State */}
        {filteredTeams.length === 0 && (
          <div className="bg-white rounded-2xl shadow-md p-10 text-center mt-12 border border-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p className="text-2xl text-gray-800 mb-4">No teams found matching "{searchTerm}"</p>
            <p className="text-gray-600 mb-6">Try adjusting your search or browse all teams</p>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="px-6 py-3 bg-gray-700 text-white rounded-full hover:bg-gray-600 transition-colors shadow-md hover:shadow-lg"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* Footer with baseball stitching design */}
      <div className="mt-16 py-8 bg-gray-100 border-t border-gray-200 relative">
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-red-500 via-transparent to-red-500"></div>
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <div className="text-gray-600 text-sm">
            MLB Bullpen Budgets • Data Analytics Dashboard
          </div>
          <div className="flex space-x-4">
            <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
            <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;