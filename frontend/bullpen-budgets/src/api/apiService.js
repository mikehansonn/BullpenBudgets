import api from './api';

export const getTeamPlayers = async (teamName) => {
  try {
    const response = await api.get(`/api/players/team/${teamName}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching team players:', error);
    throw error;
  }
};

export const getAllTeams = () => {
  return [
    { id: 'yankees', name: 'New York Yankees', abbr: 'NYY', color: '#0C2340' },
    { id: 'red-sox', name: 'Boston Red Sox', abbr: 'BOS', color: '#BD3039' },
    { id: 'blue-jays', name: 'Toronto Blue Jays', abbr: 'TOR', color: '#134A8E' },
    { id: 'rays', name: 'Tampa Bay Rays', abbr: 'TB', color: '#092C5C' },
    { id: 'orioles', name: 'Baltimore Orioles', abbr: 'BAL', color: '#DF4601' },
    { id: 'white-sox', name: 'Chicago White Sox', abbr: 'CWS', color: '#27251F' },
    { id: 'guardians', name: 'Cleveland Guardians', abbr: 'CLE', color: '#00385D' },
    { id: 'tigers', name: 'Detroit Tigers', abbr: 'DET', color: '#0C2340' },
    { id: 'royals', name: 'Kansas City Royals', abbr: 'KC', color: '#004687' },
    { id: 'twins', name: 'Minnesota Twins', abbr: 'MIN', color: '#002B5C' },
    { id: 'astros', name: 'Houston Astros', abbr: 'HOU', color: '#EB6E1F' },
    { id: 'angels', name: 'Los Angeles Angels', abbr: 'LAA', color: '#BA0021' },
    { id: 'athletics', name: 'Oakland Athletics', abbr: 'OAK', color: '#003831' },
    { id: 'mariners', name: 'Seattle Mariners', abbr: 'SEA', color: '#0C2C56' },
    { id: 'rangers', name: 'Texas Rangers', abbr: 'TEX', color: '#003278' },
    { id: 'braves', name: 'Atlanta Braves', abbr: 'ATL', color: '#CE1141' },
    { id: 'marlins', name: 'Miami Marlins', abbr: 'MIA', color: '#00A3E0' },
    { id: 'mets', name: 'New York Mets', abbr: 'NYM', color: '#FF5910' },
    { id: 'phillies', name: 'Philadelphia Phillies', abbr: 'PHI', color: '#E81828' },
    { id: 'nationals', name: 'Washington Nationals', abbr: 'WSH', color: '#AB0003' },
    { id: 'cubs', name: 'Chicago Cubs', abbr: 'CHC', color: '#0E3386' },
    { id: 'reds', name: 'Cincinnati Reds', abbr: 'CIN', color: '#C6011F' },
    { id: 'brewers', name: 'Milwaukee Brewers', abbr: 'MIL', color: '#0A2351' },
    { id: 'pirates', name: 'Pittsburgh Pirates', abbr: 'PIT', color: '#FDB827' },
    { id: 'cardinals', name: 'St. Louis Cardinals', abbr: 'STL', color: '#C41E3A' },
    { id: 'diamondbacks', name: 'Arizona Diamondbacks', abbr: 'ARI', color: '#A71930' },
    { id: 'rockies', name: 'Colorado Rockies', abbr: 'COL', color: '#33006F' },
    { id: 'dodgers', name: 'Los Angeles Dodgers', abbr: 'LAD', color: '#005A9C' },
    { id: 'padres', name: 'San Diego Padres', abbr: 'SD', color: '#2F241D' },
    { id: 'giants', name: 'San Francisco Giants', abbr: 'SF', color: '#FD5A1E' }
  ];
};