// Pitcher Usage Metric calculation with rest days factor
const calculatePitcherUsage = (player, allTeamPitchers, timeframeDays = 365) => {
    if (!player || !player.outings || player.outings.length === 0) return null;
    
    // Filter outings within the specified timeframe
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - timeframeDays);
    
    const recentOutings = player.outings.filter(outing => {
      const outingDate = new Date(outing.date);
      return outingDate >= pastDate && outingDate <= today;
    });
    
    if (recentOutings.length === 0) return null;
    
    // Sort outings by date for rest calculation
    const sortedOutings = [...recentOutings].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate rest days between appearances
    let totalRestDays = 0;
    let restDaysCounts = [];
    
    for (let i = 1; i < sortedOutings.length; i++) {
      const currentDate = new Date(sortedOutings[i].date);
      const previousDate = new Date(sortedOutings[i-1].date);
      
      // Calculate days between appearances (subtract 1 to not count game day)
      const diffTime = Math.abs(currentDate - previousDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
      
      totalRestDays += diffDays;
      restDaysCounts.push(diffDays);
    }
    
    // Calculate average rest days between appearances
    const avgRestDays = sortedOutings.length > 1 ? totalRestDays / (sortedOutings.length - 1) : 0;
    
    // Calculate metrics for this player
    const totalIP = sortedOutings.reduce((sum, o) => sum + parseFloat(o.IP || 0), 0);
    const totalAppearances = sortedOutings.length;
    const totalPitches = sortedOutings.reduce((sum, o) => sum + parseInt(o.P || 0), 0);
    
    // Get team averages for comparison
    let teamIPAvg = 0;
    let teamAppearancesAvg = 0;
    let teamPitchesAvg = 0;
    let teamAvgRestDays = 0;
    let pitchersWithData = 0;
    
    allTeamPitchers.forEach(pitcher => {
      const recentPitcherOutings = pitcher.outings?.filter(outing => {
        const outingDate = new Date(outing.date);
        return outingDate >= pastDate && outingDate <= today;
      }) || [];
      
      if (recentPitcherOutings.length > 1) { // Need at least 2 outings to calculate rest
        // Sort outings by date for rest calculation
        const sortedPitcherOutings = [...recentPitcherOutings].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        // Calculate rest days for this pitcher
        let pitcherTotalRestDays = 0;
        for (let i = 1; i < sortedPitcherOutings.length; i++) {
          const currentDate = new Date(sortedPitcherOutings[i].date);
          const previousDate = new Date(sortedPitcherOutings[i-1].date);
          
          const diffTime = Math.abs(currentDate - previousDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
          
          pitcherTotalRestDays += diffDays;
        }
        
        const pitcherAvgRestDays = pitcherTotalRestDays / (sortedPitcherOutings.length - 1);
        
        teamIPAvg += recentPitcherOutings.reduce((sum, o) => sum + parseFloat(o.IP || 0), 0);
        teamAppearancesAvg += recentPitcherOutings.length;
        teamPitchesAvg += recentPitcherOutings.reduce((sum, o) => sum + parseInt(o.P || 0), 0);
        teamAvgRestDays += pitcherAvgRestDays;
        pitchersWithData++;
      } else if (recentPitcherOutings.length === 1) {
        // Still count this pitcher for IP, appearances, and pitches averages
        teamIPAvg += recentPitcherOutings.reduce((sum, o) => sum + parseFloat(o.IP || 0), 0);
        teamAppearancesAvg += recentPitcherOutings.length;
        teamPitchesAvg += recentPitcherOutings.reduce((sum, o) => sum + parseInt(o.P || 0), 0);
        // But don't include in rest day calculations
      }
    });
    
    // Calculate averages
    if (pitchersWithData > 0) {
      teamIPAvg /= pitchersWithData;
      teamAppearancesAvg /= pitchersWithData;
      teamPitchesAvg /= pitchersWithData;
      teamAvgRestDays /= pitchersWithData;
    }
    
    // Calculate normalized values (higher is more usage)
    const ipRatio = teamIPAvg > 0 ? totalIP / teamIPAvg : 1;
    const appearancesRatio = teamAppearancesAvg > 0 ? totalAppearances / teamAppearancesAvg : 1;
    const pitchesRatio = teamPitchesAvg > 0 ? totalPitches / teamPitchesAvg : 1;
    
    // Determine optimal rest recommendation based on average pitches per outing
    const avgPitchesPerOuting = totalPitches / totalAppearances;
    let recommendedRest = 0;
    
    if (avgPitchesPerOuting <= 20) recommendedRest = 2; // Low pitch count, less rest needed
    else if (avgPitchesPerOuting <= 35) recommendedRest = 3; // Medium pitch count
    else if (avgPitchesPerOuting <= 50) recommendedRest = 4; // Higher pitch count
    else recommendedRest = 5; // Very high pitch count
    
    // If there's not enough data for rest calculation, use traditional metrics only
    if (sortedOutings.length <= 1 || !teamAvgRestDays) {
      // Weighted average - more weight to pitches (50%), then IP (30%), then appearances (20%)
      const usageRatio = (pitchesRatio * 0.5) + (ipRatio * 0.3) + (appearancesRatio * 0.2);
      const usageScore = Math.round(100 / usageRatio);
      
      return {
        usageScore,
        totalIP,
        totalAppearances,
        totalPitches,
        ipPerAppearance: totalIP / totalAppearances,
        pitchesPerAppearance: totalPitches / totalAppearances,
        pitchesPerInning: totalPitches / totalIP,
        recentOutings: sortedOutings,
        isHighUsage: usageScore < 85,  // 15% more usage than average
        isLowUsage: usageScore > 115,  // 15% less usage than average
        // Include null values for rest-related metrics
        avgRestDays: null,
        teamAvgRestDays: null,
        recommendedRest: recommendedRest,
        restAdequacy: null,
        restDaysCounts: []
      };
    }
    
    // Calculate rest adequacy - how close is the actual rest to recommended rest
    // Values < 1 mean not enough rest, values > 1 mean more than enough rest
    const restAdequacy = avgRestDays / recommendedRest;
    
    // Weighted average with rest factors included
    const usageRatio = (
      (pitchesRatio * 0.35) +         // 35% weight on pitches
      (ipRatio * 0) +              // 25% weight on innings pitched
      (appearancesRatio * 0.05) +     // 15% weight on appearances
      (1/restAdequacy * 0.6)         // 25% weight on rest adequacy (inverted)
    );
    
    // Calculate the usage score like ERA+ where 100 is average
    // Higher scores are better (less usage/more optimal rest)
    const usageScore = Math.round(100 / usageRatio);
    
    return {
      usageScore,
      totalIP,
      totalAppearances,
      totalPitches,
      avgRestDays,
      teamAvgRestDays,
      recommendedRest,
      restAdequacy,
      ipPerAppearance: totalIP / totalAppearances,
      pitchesPerAppearance: totalPitches / totalAppearances,
      pitchesPerInning: totalPitches / totalIP,
      recentOutings: sortedOutings,
      restDaysCounts,
      isHighUsage: usageScore < 85,  // 15% more usage than average
      isLowUsage: usageScore > 115,  // 15% less usage than average
    };
};

// Prepare chart data for pitcher usage over time
const preparePitcherUsageChartData = (player, allTeamPitchers) => {
  if (!player || !player.outings || player.outings.length <= 1) return [];
  
  const sortedOutings = [...player.outings].sort((a, b) => new Date(a.date) - new Date(b.date));
  const chartData = [];
  
  // For each outing date, calculate the usage at that point
  sortedOutings.forEach((currentOuting, index) => {
    // Skip the first value
    if (index === 0) return;
    
    const currentDate = new Date(currentOuting.date);
    
    // Create a temporary player object with outings up to this date
    const temporaryPlayer = {
      ...player,
      outings: sortedOutings.filter((outing, i) => i <= index)
    };
    
    // Calculate usage based on all available data at this point
    const usageMetric = calculatePitcherUsage(temporaryPlayer, allTeamPitchers, 365);
    
    if (usageMetric) {
      chartData.push({
        date: currentOuting.date,
        usageScore: usageMetric.usageScore,
        IP: parseFloat(currentOuting.IP || 0),
        pitches: parseInt(currentOuting.P || 0),
        restDays: index > 0 ? usageMetric.restDaysCounts[usageMetric.restDaysCounts.length - 1] : null,
        avgRestDays: usageMetric.avgRestDays,
        restAdequacy: usageMetric.restAdequacy
      });
    }
  });
  
  return chartData;
};

// Get team-wide pitcher usage stats
const calculateTeamUsageStats = (players, timeframeDays = 365) => {
  if (!players || players.length === 0) return null;
  
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - timeframeDays);
  
  const pitcherUsageData = players.map(player => {
    const usage = calculatePitcherUsage(player, players, timeframeDays);
    return {
      name: player.name,
      usageMetric: usage
    };
  }).filter(data => data.usageMetric !== null);
  
  // Sort by usage score (ascending - lower score means higher usage)
  pitcherUsageData.sort((a, b) => a.usageMetric.usageScore - b.usageMetric.usageScore);
  
  const highUsagePitchers = pitcherUsageData.filter(p => p.usageMetric.isHighUsage);
  const lowUsagePitchers = pitcherUsageData.filter(p => p.usageMetric.isLowUsage);
  const avgUsagePitchers = pitcherUsageData.filter(p => 
    !p.usageMetric.isHighUsage && !p.usageMetric.isLowUsage
  );
  
  // Calculate team stats including rest metrics
  const pitchersWithRestData = pitcherUsageData.filter(p => p.usageMetric.avgRestDays !== null);
  const avgTeamRestDays = pitchersWithRestData.length > 0 ? 
    pitchersWithRestData.reduce((sum, p) => sum + p.usageMetric.avgRestDays, 0) / pitchersWithRestData.length : 
    null;
  
  return {
    allPitchers: pitcherUsageData,
    highUsagePitchers,
    lowUsagePitchers,
    avgUsagePitchers,
    averageTeamUsage: pitcherUsageData.reduce((sum, p) => sum + p.usageMetric.usageScore, 0) / pitcherUsageData.length,
    averageTeamRestDays: avgTeamRestDays
  };
};

export { calculatePitcherUsage, preparePitcherUsageChartData, calculateTeamUsageStats };