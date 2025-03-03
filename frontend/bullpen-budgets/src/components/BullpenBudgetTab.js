import React, { useState } from 'react';

// This function prepares the last X days based on the most recent game date
const prepareLastXDays = (players, numDays) => {
  // Find the most recent game date across all players
  let mostRecentDate = null;
  
  players.forEach(player => {
    if (player.outings && player.outings.length > 0) {
      // Sort outings by date in descending order to get the most recent first
      const sortedOutings = [...player.outings].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      const playerLatestDate = new Date(sortedOutings[0].date);
      
      if (!mostRecentDate || playerLatestDate > mostRecentDate) {
        mostRecentDate = playerLatestDate;
      }
    }
  });
  
  if (!mostRecentDate) return [];
  
  // Generate array of the last X days (including the most recent)
  const lastXDays = [];
  for (let i = 0; i < numDays; i++) {
    const day = new Date(mostRecentDate);
    day.setDate(day.getDate() - i);
    
    // Format as MM/DD
    const month = day.getMonth() + 1; // getMonth is 0-indexed
    const date = day.getDate();
    const formattedDate = `${month}/${date}`;
    
    lastXDays.push({
      fullDate: day.toISOString().split('T')[0], // YYYY-MM-DD format for comparison
      displayDate: formattedDate
    });
  }
  
  return lastXDays;
};

// This function prepares the pitch data for the bullpen budget table
const prepareBullpenData = (players, lastXDays) => {
  const bullpenData = [];
  
  players.forEach(player => {
    if (!player.outings || player.outings.length === 0) return;
    
    // Create a record for this player
    const playerRecord = {
      id: player._id,
      name: player.name,
      dailyPitches: {},
      dailyIP: {},
      dailyK: {},
      dailyAvgVelo: {},  // New: Track average velocity per day
      hasPitchedInLastXDays: false,
      totalOutings: 0, // Track number of outings in the period
      totalPitches: 0,
      totalIP: 0,
      totalK: 0,
      avgPitchesPerOuting: 0
    };
    
    // Initialize all days with 0 values
    lastXDays.forEach(day => {
      playerRecord.dailyPitches[day.fullDate] = 0;
      playerRecord.dailyIP[day.fullDate] = 0;
      playerRecord.dailyK[day.fullDate] = 0;
      playerRecord.dailyAvgVelo[day.fullDate] = null;
    });
    
    // Fill in the actual data
    player.outings.forEach(outing => {
      const outingDate = outing.date;
      const outingDateObj = new Date(outingDate);
      const outingFullDate = outingDateObj.toISOString().split('T')[0];
      
      // Check if this outing falls within our last X days
      if (lastXDays.some(day => day.fullDate === outingFullDate)) {
        // Record data
        const pitches = parseInt(outing.P) || 0;
        playerRecord.dailyPitches[outingFullDate] = pitches;
        playerRecord.totalPitches += pitches;
        
        const ip = parseFloat(outing.IP) || 0;
        playerRecord.dailyIP[outingFullDate] = ip;
        playerRecord.totalIP += ip;
        
        const k = parseInt(outing.K) || 0;
        playerRecord.dailyK[outingFullDate] = k;
        playerRecord.totalK += k;

        // Assuming we had velocity data - in real app this would come from outing
        // For now we'll just set a placeholder or null
        playerRecord.dailyAvgVelo[outingFullDate] = outing.avgVelo || null;
        
        if (pitches > 0) {
          playerRecord.hasPitchedInLastXDays = true;
          playerRecord.totalOutings++;
        }
      }
    });
    
    // Calculate averages
    if (playerRecord.totalOutings > 0) {
      playerRecord.avgPitchesPerOuting = (playerRecord.totalPitches / playerRecord.totalOutings).toFixed(1);
    }
    
    // Only add players who have pitched in the period
    if (playerRecord.hasPitchedInLastXDays) {
      bullpenData.push(playerRecord);
    }
  });
  
  return bullpenData;
};

// Calculate the workload status for each pitcher
const calculateWorkloadStatus = (dailyPitches, numDays) => {
  const totalPitches = Object.values(dailyPitches).reduce((sum, pitches) => sum + pitches, 0);
  
  // Adjust thresholds based on the number of days
  const highThreshold = numDays * 15; // 15 pitches per day on average is high
  const mediumThreshold = numDays * 9; // 9 pitches per day on average is medium
  
  if (totalPitches > highThreshold) return { status: 'High', color: '#e53e3e' }; // Red
  if (totalPitches > mediumThreshold) return { status: 'Medium', color: '#ed8936' }; // Orange
  return { status: 'Low', color: '#38a169' }; // Green
};

// Calculate days since last pitched
const calculateDaysSinceLastPitched = (dailyPitches, lastXDays) => {
  // Find the most recent day pitched by checking from the most recent day backward
  for (let i = 0; i < lastXDays.length; i++) {
    const date = lastXDays[i].fullDate;
    if (dailyPitches[date] > 0) {
      return i;
    }
  }
  
  return lastXDays.length; // If no pitches in the period
};

// Component to render the Bullpen Budget tab content
const BullpenBudgetTab = ({ players, team }) => {
  const [activePeriod, setActivePeriod] = useState(5); // Default to 5 days
  
  const lastXDays = prepareLastXDays(players, activePeriod);
  const bullpenData = prepareBullpenData(players, lastXDays);
  
  // Calculate team totals for each day
  const teamTotals = {};
  lastXDays.forEach(day => {
    teamTotals[day.fullDate] = 0;
  });
  
  bullpenData.forEach(player => {
    Object.entries(player.dailyPitches).forEach(([date, pitches]) => {
      teamTotals[date] += pitches;
    });
  });
  
  // Sort bullpen data by workload (highest to lowest)
  const sortedBullpenData = [...bullpenData].sort((a, b) => {
    const totalA = Object.values(a.dailyPitches).reduce((sum, count) => sum + count, 0);
    const totalB = Object.values(b.dailyPitches).reduce((sum, count) => sum + count, 0);
    return totalB - totalA;
  });

  // Handle tab change
  const handlePeriodChange = (period) => {
    setActivePeriod(period);
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div 
        className="p-6 border-b text-white"
        style={{ backgroundColor: team.color }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <h3 className="text-2xl font-bold mb-2 md:mb-0">{team.name} Bullpen Budget</h3>
          
          {/* Team Stats summary */}
          <div className="flex space-x-4">
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="text-sm opacity-80">Active Pitchers</div>
              <div className="text-xl font-bold">{bullpenData.length}</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg px-4 py-2">
              <div className="text-sm opacity-80">{activePeriod}-Day Total</div>
              <div className="text-xl font-bold">
                {Object.values(teamTotals).reduce((sum, count) => sum + count, 0)} pitches
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Period tabs */}
      <div className="border-b border-gray-200">
        <div className="flex">
          {[3, 5, 7, 14].map(period => (
            <button
              key={period}
              className={`py-3 px-6 text-center font-medium transition-colors duration-200 ${
                activePeriod === period
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              onClick={() => handlePeriodChange(period)}
            >
              Last {period} Days
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-6">
        <div className="overflow-x-auto bg-gray-50 rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 bg-gray-100 text-left text-xs font-medium text-gray-600 uppercase tracking-wider sticky left-0 rounded-tl-lg">Pitcher</th>
                <th className="py-3 px-4 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Outings</th>
                <th className="py-3 px-4 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Days Since Last</th>
                {lastXDays.map(day => (
                  <th key={day.fullDate} className="py-3 px-4 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                    {day.displayDate}
                  </th>
                ))}
                <th className="py-3 px-4 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Total P</th>
                <th className="py-3 px-4 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">Avg P/Game</th>
                <th className="py-3 px-4 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">IP</th>
                <th className="py-3 px-4 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">K</th>
                <th className="py-3 px-4 bg-gray-100 text-center text-xs font-medium text-gray-600 uppercase tracking-wider rounded-tr-lg">Workload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedBullpenData.map(player => {
                const totalPitches = Object.values(player.dailyPitches).reduce((sum, count) => sum + count, 0);
                const workload = calculateWorkloadStatus(player.dailyPitches, activePeriod);
                const daysSinceLastPitched = calculateDaysSinceLastPitched(player.dailyPitches, lastXDays);
                
                return (
                  <tr key={player.id} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="py-3 px-4 text-sm text-gray-800 font-medium sticky left-0 bg-white">{player.name}</td>
                    <td className="py-3 px-4 text-sm text-center">{player.totalOutings}</td>
                    <td className={`py-3 px-4 text-sm text-center ${
                      daysSinceLastPitched > 3 ? 'text-green-600 font-medium' : 
                      daysSinceLastPitched > 1 ? 'text-blue-600' : 'text-red-600 font-medium'
                    }`}>
                      {daysSinceLastPitched === 0 ? 'Today' : `${daysSinceLastPitched} ${daysSinceLastPitched === 1 ? 'day' : 'days'}`}
                    </td>
                    {lastXDays.map(day => (
                      <td 
                        key={day.fullDate} 
                        className={`py-3 px-4 text-sm text-center font-medium ${
                          player.dailyPitches[day.fullDate] > 0 
                            ? player.dailyPitches[day.fullDate] > 25 
                              ? 'text-red-600 bg-red-50' 
                              : 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {player.dailyPitches[day.fullDate]}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-sm text-center font-semibold">{totalPitches}</td>
                    <td className="py-3 px-4 text-sm text-center">{player.avgPitchesPerOuting}</td>
                    <td className="py-3 px-4 text-sm text-center">{player.totalIP.toFixed(1)}</td>
                    <td className="py-3 px-4 text-sm text-center">{player.totalK}</td>
                    <td 
                      className="py-3 px-4 text-sm text-center font-medium"
                      style={{ color: workload.color }}
                    >
                      {workload.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 border-t-2 border-gray-300">
                <td className="py-3 px-4 text-sm text-gray-800 font-bold sticky left-0 bg-gray-100">Team Total</td>
                <td className="py-3 px-4 text-sm text-center font-bold">
                  {sortedBullpenData.reduce((sum, player) => sum + player.totalOutings, 0)}
                </td>
                <td className="py-3 px-4"></td>
                {lastXDays.map(day => (
                  <td 
                    key={day.fullDate} 
                    className="py-3 px-4 text-sm text-center font-bold"
                    style={{ color: team.color }}
                  >
                    {teamTotals[day.fullDate]}
                  </td>
                ))}
                <td 
                  className="py-3 px-4 text-sm text-center font-bold"
                  style={{ color: team.color }}
                >
                  {Object.values(teamTotals).reduce((sum, count) => sum + count, 0)}
                </td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-sm text-center font-bold">
                  {sortedBullpenData.reduce((sum, player) => sum + player.totalIP, 0).toFixed(1)}
                </td>
                <td className="py-3 px-4 text-sm text-center font-bold">
                  {sortedBullpenData.reduce((sum, player) => sum + player.totalK, 0)}
                </td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="mt-6 flex justify-end">
          <div className="bg-gray-100 rounded-lg p-4 max-w-xl">
            <div className="font-medium text-gray-700 mb-1">Bullpen Budget Guide</div>
            <div className="text-sm text-gray-600">
              This table shows pitch counts for the last {activePeriod} days. Pitchers with high workloads ({activePeriod * 15}+ pitches over {activePeriod} days) may need rest.
              Highlighted cells indicate heavy single-day workloads (25+ pitches). The "Days Since Last" column helps identify pitchers who are well-rested.
            </div>
          </div>
        </div>
        
        {/* Workload Status Legend */}
        <div className="mt-4 flex flex-wrap justify-start gap-6">
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-red-600 mr-2"></div>
            <span className="text-sm text-gray-600">High Workload ({activePeriod * 15}+ pitches)</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-sm text-gray-600">Medium Workload ({activePeriod * 9}-{activePeriod * 15} pitches)</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 rounded-full bg-green-600 mr-2"></div>
            <span className="text-sm text-gray-600">Low Workload (&lt;{activePeriod * 9} pitches)</span>
          </div>
          <div className="flex items-center">
            <div className="h-4 w-4 bg-red-50 mr-2 border border-red-600"></div>
            <span className="text-sm text-gray-600">Heavy Day (25+ pitches)</span>
          </div>
        </div>

        {/* Availability Guide */}
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">Pitcher Availability Guide</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="text-red-600 font-medium mb-1">Low Availability</div>
              <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
                <li>Pitched in the last day</li>
                <li>High workload status</li>
                <li>25+ pitches in most recent outing</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="text-orange-500 font-medium mb-1">Limited Availability</div>
              <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
                <li>Pitched in the last 2 days</li>
                <li>Medium workload status</li>
                <li>15-25 pitches in most recent outing</li>
              </ul>
            </div>
            <div className="bg-white p-3 rounded shadow-sm">
              <div className="text-green-600 font-medium mb-1">Full Availability</div>
              <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
                <li>3+ days since last appearance</li>
                <li>Low workload status</li>
                <li>&lt;15 pitches in most recent outing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BullpenBudgetTab;