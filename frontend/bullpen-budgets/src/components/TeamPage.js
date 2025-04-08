import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTeamPlayers, getAllTeams } from '../api/apiService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { calculatePitcherUsage, preparePitcherUsageChartData } from '../utils/PitcherUsageMetric';
import BullpenBudgetTab from './BullpenBudgetTab';

function TeamPage() {
  const { teamName } = useParams();
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activeTab, setActiveTab] = useState('bullpenBudget'); // 'playerDetails' or 'staffOverview'
  
  const team = getAllTeams().find(t => t.id === teamName) || { name: teamName, color: '#333' };

  useEffect(() => {
    const fetchTeamPlayers = async () => {
      try {
        setLoading(true);
        const playersData = await getTeamPlayers(teamName);
        setPlayers(playersData);
        if (playersData.length > 0) {
          setSelectedPlayer(playersData[0]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching team players:', error);
        setError('Failed to load team players. Please try again later.');
        setLoading(false);
      }
    };

    fetchTeamPlayers();
  }, [teamName]);

  const prepareChartData = (player) => {
    if (!player || !player.outings || player.outings.length === 0) return [];
    
    return player.outings
      .slice() // Create a copy to avoid modifying the original
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(outing => ({
        date: outing.date,
        ERA: parseFloat(outing.ERA),
        IP: parseFloat(outing.IP),
        K: parseInt(outing.K),
      }));
  };

  const prepareUsageChartData = (player) => {
    if (!player) return [];
    return preparePitcherUsageChartData(player, players);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-gray-700 text-lg font-medium mb-6">{error}</p>
          <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition duration-200">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  const chartData = selectedPlayer ? prepareChartData(selectedPlayer) : [];
  const usageChartData = selectedPlayer ? prepareUsageChartData(selectedPlayer) : [];
  
  console.log(selectedPlayer.outings);
  const averageERA = selectedPlayer.outings[selectedPlayer.outings.length - 1]['ERA'];
  
  const totalStrikeouts = selectedPlayer && selectedPlayer.outings.length > 0
    ? selectedPlayer.outings.reduce((total, outing) => total + parseInt(outing.K || 0), 0)
    : 'N/A';
  
  const usageMetric = selectedPlayer ? calculatePitcherUsage(selectedPlayer, players) : null;
    
  const calculateTeamStats = () => {
    if (!players.length) return { teamERA: 0, totalIP: 0, totalER: 0 };
    
    let totalOuts = 0;
    let totalER = 0;
    
    players.forEach(player => {
      if (player.outings && player.outings.length) {
        totalOuts += sumPlayerOuts(player.outings);
        player.outings.forEach(outing => {
          
          const erValue = parseInt(outing.ER);
          totalER += !isNaN(erValue) ? erValue : 0;
        });
      }
    });
    const totalIP = calculateNumberOfInnings(totalOuts);

    const teamERA = totalIP > 0 ? ((totalER / displayInningsToERAInnings(totalIP)) * 9).toFixed(2) : 0;
    
    return { teamERA, totalIP: totalIP.toFixed(1), totalER };
  };

  const sumPlayerOuts = (playerStats) => {
    var totalOuts = 0;

    playerStats.forEach(outing => {
        const fullOuts = Math.floor(outing.IP / 1) * 3;
        const extraOuts = (outing.IP % 1) * 10;
        totalOuts = totalOuts + fullOuts + extraOuts;
      }
    );

    return totalOuts;
  }

  const calculateNumberOfInnings = (totalOuts) => {
    const extra = (totalOuts % 3) / 10;
    const completeInnings = Math.floor(totalOuts / 3);
    return (extra + completeInnings);
  }

  const displayInningsToERAInnings = (totalIP) => {
    const extraOuts = parseFloat(totalIP) % 1;
    const IP = totalIP - extraOuts + ((extraOuts*10) * (1/3));
    return IP
  }
  
  const teamStats = calculateTeamStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between">
          <div className="flex items-center mb-4 md:mb-0">
            <Link to="/" className="mr-4 bg-white hover:bg-gray-100 text-gray-800 px-4 py-2 rounded-lg shadow-sm transition duration-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Link>
            <div className="flex items-center">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg mr-4 shadow-md"
                style={{ backgroundColor: team.color }}
              >
                {team.abbr}
              </div>
              <h2 className="text-3xl font-bold text-gray-800">{team.name}</h2>
            </div>
          </div>
          
          <div className="flex">
            <div className="bg-white rounded-lg shadow-sm px-4 py-2 flex items-center mr-3">
              <span className="text-gray-500 mr-2">Total Pitchers:</span>
              <span className="font-semibold">{players.length}</span>
            </div>
            <div className="bg-white rounded-lg shadow-sm px-4 py-2 flex items-center">
              <span className="text-gray-500 mr-2">Team ERA:</span>
              <span className="font-semibold">{teamStats.teamERA}</span>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        {players.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg mb-6 flex">
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                activeTab === 'bullpenBudget' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('bullpenBudget')}
            >
              Bullpen Budget
            </button>
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                activeTab === 'playerDetails' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('playerDetails')}
            >
              Player Details
            </button>
            <button 
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors duration-200 ${
                activeTab === 'staffOverview' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => setActiveTab('staffOverview')}
            >
              Staff Overview
            </button>
          </div>
        )}
        
        {players.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xl text-gray-600">No pitchers found for this team.</p>
          </div>
        ) : activeTab === 'bullpenBudget' ? (
          <BullpenBudgetTab players={players} team={team} />
        ) : activeTab === 'staffOverview' ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div 
              className="p-6 border-b text-white"
              style={{ backgroundColor: team.color }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <h3 className="text-2xl font-bold mb-2 md:mb-0">{team.name} Pitching Staff</h3>
                
                {/* Team Stats summary cards */}
                <div className="flex space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <div className="text-sm opacity-80">Team ERA</div>
                    <div className="text-xl font-bold">{teamStats.teamERA}</div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                    <div className="text-sm opacity-80">Total IP</div>
                    <div className="text-xl font-bold">{teamStats.totalIP}</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="overflow-x-auto bg-gray-50 rounded-lg">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">Pitcher</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Appearances</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">IP</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">H</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">R</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ER</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">BB</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">K</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">HR</th>
                      <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ERA</th>
                      <th className="py-3 px-4 bg-gray-100 text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Usage Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {players.map((player) => {
                      // Calculate player stats
                      const appearances = player.outings ? player.outings.length : 0;
                      const totalIP = player.outings ? calculateNumberOfInnings(sumPlayerOuts(player.outings)) : 0;
                      const totalH = player.outings ? player.outings.reduce((sum, o) => sum + parseInt(o.H || 0), 0) : 0;
                      const totalR = player.outings ? player.outings.reduce((sum, o) => sum + parseInt(o.R || 0), 0) : 0;
                      const totalER = player.outings ? player.outings.reduce((sum, o) => sum + parseInt(o.ER || 0), 0) : 0;
                      const totalBB = player.outings ? player.outings.reduce((sum, o) => sum + parseInt(o.BB || 0), 0) : 0;
                      const totalK = player.outings ? player.outings.reduce((sum, o) => sum + parseInt(o.K || 0), 0) : 0;
                      const totalHR = player.outings ? player.outings.reduce((sum, o) => sum + parseInt(o.HR || 0), 0) : 0;
                      const playerERA = parseFloat(totalIP) > 0 ? ((totalER / displayInningsToERAInnings(totalIP)) * 9).toFixed(2) : 'N/A';
                      
                      // Calculate usage score
                      const usage = calculatePitcherUsage(player, players);
                      const usageScore = usage ? usage.usageScore : 'N/A';
                      
                      return (
                        <tr key={player._id} 
                            className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
                            onClick={() => {
                              setSelectedPlayer(player);
                              setActiveTab('playerDetails');
                            }}>
                          <td className="py-3 px-4 text-sm text-gray-800 font-medium">{player.name}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{appearances}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{totalIP}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{totalH}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{totalR}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{totalER}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{totalBB}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{totalK}</td>
                          <td className="py-3 px-4 text-sm text-gray-700">{totalHR}</td>
                          <td className="py-3 px-4 text-sm font-medium" style={{ color: team.color }}>{playerERA}</td>
                          <td className="py-3 text-center px-4 text-sm font-medium"
                              style={{ 
                                color: usage && usage.isHighUsage ? '#e53e3e' : 
                                      usage && usage.isLowUsage ? '#38a169' : '#4a5568' 
                              }}
                          >
                            {usageScore}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <div className="bg-gray-100 rounded-lg p-4 max-w-xl">
                  <div className="font-medium text-gray-700 mb-1">Pitching Staff Summary</div>
                  <div className="text-sm text-gray-600">
                    This overview shows cumulative stats for each pitcher. Usage Score measures workload relative to team average (100=average, lower=higher usage).
                    Click on any pitcher to see their detailed performance.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-4 text-white">
                  <h3 className="text-lg font-bold">Pitchers Roster</h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {players.map((player) => (
                    <div 
                      key={player._id} 
                      className={`p-4 cursor-pointer transition duration-200 ${
                        selectedPlayer && selectedPlayer._id === player._id 
                          ? `bg-blue-50 border-l-4 border-blue-500` 
                          : `hover:bg-gray-50 border-l-4 border-transparent`
                      }`}
                      onClick={() => setSelectedPlayer(player)}
                    >
                      <div className="font-medium">{player.name}</div>
                      {selectedPlayer && selectedPlayer._id === player._id && (
                        <div className="text-blue-600 text-sm mt-1">Currently Selected</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-3">
              {selectedPlayer ? (
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div 
                    className="p-6 border-b text-white"
                    style={{ backgroundColor: team.color }}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <h3 className="text-2xl font-bold mb-2 md:mb-0">{selectedPlayer.name}</h3>
                      
                      {/* Stats summary cards */}
                      <div className="flex space-x-4">
                        <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                          <div className="text-sm opacity-80">ERA</div>
                          <div className="text-xl font-bold">{averageERA}</div>
                        </div>
                        <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                          <div className="text-sm opacity-80">Total K</div>
                          <div className="text-xl font-bold">{totalStrikeouts}</div>
                        </div>
                        {usageMetric && (
                          <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
                            <div className="text-sm opacity-80">Usage Score</div>
                            <div className="text-xl font-bold">{usageMetric.usageScore}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {chartData.length > 1 ? (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold mb-4 text-gray-700">ERA Performance Trend</h4>
                        <div className="h-72 bg-gray-50 p-4 rounded-lg">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fill: '#6b7280' }}
                                axisLine={{ stroke: '#d1d5db' }}
                              />
                              <YAxis 
                                tick={{ fill: '#6b7280' }}
                                axisLine={{ stroke: '#d1d5db' }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'white', 
                                  borderRadius: '0.5rem',
                                  border: 'none',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <Legend />
                              <Line 
                                type="monotone" 
                                dataKey="ERA" 
                                stroke={team.color} 
                                strokeWidth={3}
                                dot={{ fill: team.color, strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, strokeWidth: 0 }} 
                                name="ERA" 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
                        <p className="text-gray-600">Not enough data to show ERA trend</p>
                      </div>
                    )}
                    
                    {/* Add Pitcher Usage Metric Chart */}
                    {usageChartData.length > 1 ? (
                      <div className="mb-8">
                        <h4 className="text-lg font-semibold mb-4 text-gray-700">Pitcher Usage Trend</h4>
                        <div className="h-72 bg-gray-50 p-4 rounded-lg">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={usageChartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                              <XAxis 
                                dataKey="date" 
                                tick={{ fill: '#6b7280' }}
                                axisLine={{ stroke: '#d1d5db' }}
                              />
                              <YAxis 
                                domain={[0, 200]}
                                tick={{ fill: '#6b7280' }}
                                axisLine={{ stroke: '#d1d5db' }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: 'white', 
                                  borderRadius: '0.5rem',
                                  border: 'none',
                                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                }}
                              />
                              <Legend />
                              {/* Reference line at 100 (average usage) */}
                              <Line 
                                type="monotone" 
                                stroke="#718096" 
                                strokeWidth={1}
                                strokeDasharray="3 3" 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="usageScore" 
                                stroke="#2c5282" 
                                strokeWidth={3}
                                dot={{ fill: '#2c5282', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, strokeWidth: 0 }} 
                                name="Usage Score" 
                              />
                              <Line 
                                type="monotone" 
                                dataKey="pitches" 
                                stroke="#718096" 
                                strokeWidth={1}
                                dot={{ fill: '#718096', r: 4 }}
                                name="Pitches (scaled)" 
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 bg-gray-100 p-3 rounded text-sm text-gray-600">
                          Usage Score: 100 = team average, &lt;100 = higher usage (may need rest), &gt;100 = lower usage
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
                        <p className="text-gray-600">Not enough data to show pitcher usage trend</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-lg font-semibold mb-4 text-gray-700">Pitching History</h4>
                      <div className="overflow-x-auto bg-gray-50 rounded-lg">
                        <table className="min-w-full">
                          <thead>
                            <tr>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tl-lg">Date</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">IP</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">H</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">R</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ER</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">BB</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">K</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">HR</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">P</th>
                              <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">ERA</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {selectedPlayer.outings
                              .slice()
                              .sort((a, b) => new Date(b.date) - new Date(a.date))
                              .map((outing, index) => (
                                <tr key={index} className="hover:bg-blue-50 transition-colors duration-150">
                                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{outing.date}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{outing.IP}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{outing.H}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{outing.R}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{outing.ER}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{outing.BB}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{outing.K}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{outing.HR}</td>
                                  <td className="py-3 px-4 text-sm text-gray-700">{outing.P}</td>
                                  <td className="py-3 px-4 text-sm font-medium" style={{ color: team.color }}>{outing.ERA}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Show usage metrics details if available */}
                    {usageMetric && (
                      <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                        <h4 className="text-lg font-semibold mb-4 text-gray-700">Usage Metrics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Total Appearances</div>
                            <div className="text-xl font-semibold">{usageMetric.totalAppearances}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Total Innings Pitched</div>
                            <div className="text-xl font-semibold">{usageMetric.totalIP.toFixed(1)}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Total Pitches</div>
                            <div className="text-xl font-semibold">{usageMetric.totalPitches}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Pitches per Appearance</div>
                            <div className="text-xl font-semibold">{usageMetric.pitchesPerAppearance.toFixed(1)}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Pitches per Inning</div>
                            <div className="text-xl font-semibold">{usageMetric.pitchesPerInning.toFixed(1)}</div>
                          </div>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="text-sm text-gray-500">Usage Status</div>
                            <div 
                              className={`text-xl font-semibold ${
                                usageMetric.isHighUsage 
                                  ? 'text-red-600' 
                                  : usageMetric.isLowUsage 
                                  ? 'text-green-600' 
                                  : 'text-gray-700'
                              }`}
                            >
                              {usageMetric.isHighUsage 
                                ? 'High Usage' 
                                : usageMetric.isLowUsage 
                                ? 'Low Usage' 
                                : 'Average Usage'}
                            </div>
                          </div>
                          
                          {/* New Rest Days Section */}
                          {usageMetric.avgRestDays !== null && (
                            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                              <div className="text-sm text-gray-500">Avg. Days Between Appearances</div>
                              <div className="text-xl font-semibold">{usageMetric.avgRestDays.toFixed(1)}</div>
                              {usageMetric.recommendedRest && (
                                <div className="mt-1 text-sm">
                                  <span className="text-gray-600">Recommended: </span>
                                  <span className={`font-medium ${usageMetric.restAdequacy < 0.9 ? 'text-red-600' : 'text-green-600'}`}>
                                    {usageMetric.recommendedRest} days
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Team comparison for rest days */}
                          {usageMetric.teamAvgRestDays && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">Team Avg. Rest Days</div>
                              <div className="text-xl font-semibold">{usageMetric.teamAvgRestDays.toFixed(1)}</div>
                              {usageMetric.avgRestDays !== null && (
                                <div className="mt-1 text-sm">
                                  <span className={`font-medium ${
                                    usageMetric.avgRestDays < usageMetric.teamAvgRestDays ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    {usageMetric.avgRestDays < usageMetric.teamAvgRestDays ? 'Below' : 'Above'} team average
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Rest adequacy visualization */}
                          {usageMetric.restAdequacy !== null && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <div className="text-sm text-gray-500">Rest Adequacy</div>
                              <div className={`text-xl font-semibold ${
                                usageMetric.restAdequacy < 0.9 ? 'text-red-600' : 
                                usageMetric.restAdequacy > 1.1 ? 'text-green-600' : 'text-gray-700'
                              }`}>
                                {(usageMetric.restAdequacy * 100).toFixed(0)}%
                              </div>
                              <div className="mt-1 text-sm">
                                {usageMetric.restAdequacy < 0.9 ? 'Insufficient rest' : 
                                 usageMetric.restAdequacy > 1.1 ? 'Well-rested' : 'Adequate rest'}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                          <strong>Note:</strong> Usage Score is calculated relative to team average workload. 
                          A score of 100 is average, below 100 indicates higher than average usage, 
                          and above 100 indicates lower than average usage. Scores below 85 may indicate a need for rest.
                          Rest adequacy shows how well the pitcher's rest days match recommended levels based on workload.
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 flex flex-col justify-center items-center h-96">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m-8 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <p className="text-lg text-gray-500">Select a pitcher from the roster to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeamPage;