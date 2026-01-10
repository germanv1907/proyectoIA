const API_URL = 'https://api.balldontlie.io/v1';
const API_KEY = import.meta.env.VITE_BALLDONTLIE_API_KEY;
console.log("MI CLAVE ES:", API_KEY);

const headers = {
  'Authorization': API_KEY,
  'Content-Type': 'application/json'
};

// --- INTERFACES (Tipos de datos) ---
export interface PlayerProfile {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height: string;
  weight: string;
  jersey_number: string;
  team: {
    full_name: string;
    abbreviation: string;
    city: string;
  };
}

export interface SeasonStats {
  pts: number;
  reb: number;
  ast: number;
  games_played: number;
  min: string;
}

// --- FUNCIONES (Las que busca tu componente) ---

// 1. Buscar al Jugador
export async function searchPlayerInAPI(name: string): Promise<PlayerProfile | null> {
  try {
    const response = await fetch(`${API_URL}/players?search=${name}`, { headers });
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0];
    }
    return null;
  } catch (error) {
    console.error("Error buscando jugador:", error);
    return null;
  }
}

// 2. Obtener Estadísticas (ESTA ES LA QUE TE FALTABA)
export async function getSeasonAverages(playerId: number): Promise<SeasonStats | null> {
  try {
    const response = await fetch(`${API_URL}/season_averages?season=2024&player_ids[]=${playerId}`, { headers });
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0];
    }
    return null;
  } catch (error) {
    console.error("Error buscando stats:", error);
    return null;
  }
}

// 3. Obtener Foto (Opcional, pero útil para que no de error si la llamas)
export function getPlayerImageUrl(playerId: number): string {
    return `https://ak-static.cms.nba.com/wp-content/uploads/headshots/nba/latest/260x190/${playerId}.png`;
}