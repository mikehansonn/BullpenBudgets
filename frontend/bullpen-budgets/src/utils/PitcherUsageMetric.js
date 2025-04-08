const calculatePitcherUsage = (player, allTeamPitchers, timeframeDays = 365) => {
  if (!player || !player.outings || player.outings.length === 0) return null;
  
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - timeframeDays);
  
  const recentOutings = player.outings.filter(outing => {
    const outingDate = new Date(outing.date);
    return outingDate >= pastDate && outingDate <= today;
  });
  
  if (recentOutings.length === 0) return null;
  
  const sortedOutings = [...recentOutings].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let totalRestDays = 0;
  let restDaysCounts = [];
  
  for (let i = 1; i < sortedOutings.length; i++) {
    const currentDate = new Date(sortedOutings[i].date);
    const previousDate = new Date(sortedOutings[i-1].date);
    
    const diffTime = Math.abs(currentDate - previousDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    
    totalRestDays += diffDays;
    restDaysCounts.push(diffDays);
  }
  
  const avgRestDays = sortedOutings.length > 1 ? totalRestDays / (sortedOutings.length - 1) : 0;
  
  // Convert IP to outs, then sum them properly
  const totalOuts = sortedOutings.reduce((sum, o) => {
    if (!o.IP) return sum;
    const ipString = o.IP.toString();
    const parts = ipString.split('.');
    const fullInnings = parseInt(parts[0] || 0);
    const partialInnings = parts.length > 1 ? parseInt(parts[1] || 0) : 0;
    return sum + (fullInnings * 3) + partialInnings;
  }, 0);
  
  // Convert outs back to baseball IP notation
  const totalIP = Math.floor(totalOuts / 3) + (totalOuts % 3) / 10;
  
  const totalAppearances = sortedOutings.length;
  const totalPitches = sortedOutings.reduce((sum, o) => sum + parseInt(o.P || 0), 0);
  
  let teamOuts = 0;
  let teamAppearancesAvg = 0;
  let teamPitchesAvg = 0;
  let teamAvgRestDays = 0;
  let pitchersWithData = 0;
  
  allTeamPitchers.forEach(pitcher => {
    const recentPitcherOutings = pitcher.outings?.filter(outing => {
      const outingDate = new Date(outing.date);
      return outingDate >= pastDate && outingDate <= today;
    }) || [];
    
    if (recentPitcherOutings.length > 1) {
      const sortedPitcherOutings = [...recentPitcherOutings].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      let pitcherTotalRestDays = 0;
      for (let i = 1; i < sortedPitcherOutings.length; i++) {
        const currentDate = new Date(sortedPitcherOutings[i].date);
        const previousDate = new Date(sortedPitcherOutings[i-1].date);
        
        const diffTime = Math.abs(currentDate - previousDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
        
        pitcherTotalRestDays += diffDays;
      }
      
      const pitcherAvgRestDays = pitcherTotalRestDays / (sortedPitcherOutings.length - 1);
      
      // Calculate outs for this pitcher
      const pitcherOuts = recentPitcherOutings.reduce((sum, o) => {
        if (!o.IP) return sum;
        const ipString = o.IP.toString();
        const parts = ipString.split('.');
        const fullInnings = parseInt(parts[0] || 0);
        const partialInnings = parts.length > 1 ? parseInt(parts[1] || 0) : 0;
        return sum + (fullInnings * 3) + partialInnings;
      }, 0);
      
      teamOuts += pitcherOuts;
      teamAppearancesAvg += recentPitcherOutings.length;
      teamPitchesAvg += recentPitcherOutings.reduce((sum, o) => sum + parseInt(o.P || 0), 0);
      teamAvgRestDays += pitcherAvgRestDays;
      pitchersWithData++;
    } else if (recentPitcherOutings.length === 1) {
      // Calculate outs for this pitcher with single appearance
      const pitcherOuts = recentPitcherOutings.reduce((sum, o) => {
        if (!o.IP) return sum;
        const ipString = o.IP.toString();
        const parts = ipString.split('.');
        const fullInnings = parseInt(parts[0] || 0);
        const partialInnings = parts.length > 1 ? parseInt(parts[1] || 0) : 0;
        return sum + (fullInnings * 3) + partialInnings;
      }, 0);
      
      teamOuts += pitcherOuts;
      teamAppearancesAvg += recentPitcherOutings.length;
      teamPitchesAvg += recentPitcherOutings.reduce((sum, o) => sum + parseInt(o.P || 0), 0);
    }
  });
  
  let teamIPAvg = 0;
  if (pitchersWithData > 0) {
    // Convert team outs to innings pitched notation
    teamIPAvg = Math.floor(teamOuts / pitchersWithData / 3) + 
               ((teamOuts / pitchersWithData) % 3) / 10;
    teamAppearancesAvg /= pitchersWithData;
    teamPitchesAvg /= pitchersWithData;
    teamAvgRestDays /= pitchersWithData;
  }
  
  const ipRatio = teamIPAvg > 0 ? totalIP / teamIPAvg : 1;
  const appearancesRatio = teamAppearancesAvg > 0 ? totalAppearances / teamAppearancesAvg : 1;
  const pitchesRatio = teamPitchesAvg > 0 ? totalPitches / teamPitchesAvg : 1;
  const avgPitchesPerOuting = totalPitches / totalAppearances;
  let recommendedRest = 0;
  
  if (avgPitchesPerOuting <= 20) recommendedRest = 2;
  else if (avgPitchesPerOuting <= 35) recommendedRest = 3;
  else if (avgPitchesPerOuting <= 50) recommendedRest = 4; 
  else recommendedRest = 5;
  
  if (sortedOutings.length <= 1 || !teamAvgRestDays) {
    const usageRatio = (pitchesRatio * 0.5) + (ipRatio * 0.3) + (appearancesRatio * 0.2);
    const usageScore = Math.round(100 / usageRatio);
    
    // Calculate proper innings pitched metrics with baseball notation
    const outsPitched = totalOuts;
    const ipPerAppearance = Math.floor(outsPitched / totalAppearances / 3) + 
                           ((outsPitched / totalAppearances) % 3) / 10;
    const pitchesPerInning = totalPitches / (outsPitched / 3);
    
    return {
      usageScore,
      totalIP,
      totalAppearances,
      totalPitches,
      ipPerAppearance,
      pitchesPerAppearance: totalPitches / totalAppearances,
      pitchesPerInning,
      recentOutings: sortedOutings,
      isHighUsage: usageScore < 85,
      isLowUsage: usageScore > 115,
      avgRestDays: null,
      teamAvgRestDays: null,
      recommendedRest: recommendedRest,
      restAdequacy: null,
      restDaysCounts: []
    };
  }

  const restAdequacy = avgRestDays / recommendedRest;

  const usageRatio = (
    (pitchesRatio * 0.35) +         // 35% weight on pitches
    (ipRatio * 0) +                 // 0% weight on innings pitched
    (appearancesRatio * 0.05) +     // 5% weight on appearances
    (1/restAdequacy * 0.6)          // 60% weight on rest adequacy (inverted)
  );
  
  const usageScore = Math.round(100 / usageRatio);
  
  // Calculate proper innings pitched metrics with baseball notation
  const outsPitched = totalOuts;
  const ipPerAppearance = Math.floor(outsPitched / totalAppearances / 3) + 
                         ((outsPitched / totalAppearances) % 3) / 10;
  const pitchesPerInning = totalPitches / (outsPitched / 3);
  
  return {
    usageScore,
    totalIP,
    totalAppearances,
    totalPitches,
    avgRestDays,
    teamAvgRestDays,
    recommendedRest,
    restAdequacy,
    ipPerAppearance,
    pitchesPerAppearance: totalPitches / totalAppearances,
    pitchesPerInning,
    recentOutings: sortedOutings,
    restDaysCounts,
    isHighUsage: usageScore < 85,  // 15% more usage than average
    isLowUsage: usageScore > 115,  // 15% less usage than average
  };
};

const preparePitcherUsageChartData = (player, allTeamPitchers) => {
if (!player || !player.outings || player.outings.length <= 1) return [];

const sortedOutings = [...player.outings].sort((a, b) => new Date(a.date) - new Date(b.date));
const chartData = [];

sortedOutings.forEach((currentOuting, index) => {
  if (index === 0) return;
  
  const temporaryPlayer = {
    ...player,
    outings: sortedOutings.filter((outing, i) => i <= index)
  };
  
  const usageMetric = calculatePitcherUsage(temporaryPlayer, allTeamPitchers, 365);
  
  if (usageMetric) {
    // Convert string IP to proper baseball notation if needed
    let ip = currentOuting.IP;
    if (typeof ip === 'string') {
      const parts = ip.split('.');
      const fullInnings = parseInt(parts[0] || 0);
      const partialInnings = parts.length > 1 ? parseInt(parts[1] || 0) : 0;
      // Ensure partial innings are only 0, 1, or 2 (representing outs)
      if (partialInnings > 2) {
        const additionalFullInnings = Math.floor(partialInnings / 3);
        const remainingOuts = partialInnings % 3;
        ip = (fullInnings + additionalFullInnings) + (remainingOuts / 10);
      } else {
        ip = parseFloat(ip);
      }
    }
    
    chartData.push({
      date: currentOuting.date,
      usageScore: usageMetric.usageScore,
      IP: ip,
      pitches: parseInt(currentOuting.P || 0),
      restDays: index > 0 ? usageMetric.restDaysCounts[usageMetric.restDaysCounts.length - 1] : null,
      avgRestDays: usageMetric.avgRestDays,
      restAdequacy: usageMetric.restAdequacy
    });
  }
});

return chartData;
};

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

pitcherUsageData.sort((a, b) => a.usageMetric.usageScore - b.usageMetric.usageScore);

const highUsagePitchers = pitcherUsageData.filter(p => p.usageMetric.isHighUsage);
const lowUsagePitchers = pitcherUsageData.filter(p => p.usageMetric.isLowUsage);
const avgUsagePitchers = pitcherUsageData.filter(p => 
  !p.usageMetric.isHighUsage && !p.usageMetric.isLowUsage
);

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