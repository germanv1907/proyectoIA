import { useState } from 'react';
import { searchPlayerInAPI } from '../lib/nba';
import myPredictions from '../data/nba_predictions.json';

interface LocalData {
  player: string;
  points: number;      // Predicción IA
  real_pts: number;    // Promedio Real Histórico
  error: number;       // Margen de Error del Modelo
}

export function NbaPredictor() {
  const [searchTerm, setSearchTerm] = useState('');
  const [stakeLine, setStakeLine] = useState(''); // <--- NUEVO: Para escribir lo que pide el casino
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [playerData, setPlayerData] = useState<any>(null);

  // Función para obtener el Top 5 (Lo que pidió el profe)
  const getTop5 = () => {
    const top = (myPredictions as LocalData[]).slice(0, 5);
    alert(`TOP 5 PREDICCIONES DE HOY:\n\n${top.map((p, i) => `#${i+1} ${p.player}: ${p.points} pts`).join('\n')}`);
  };

  const handleSearch = async () => {
    if (!searchTerm) return;
    setLoading(true);
    setErrorMsg('');
    setPlayerData(null);

    try {
      // 1. Buscar Jugador
      const localData = (myPredictions as LocalData[]).find(p => 
        p.player.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (!localData) {
        throw new Error(`No encontrado: "${searchTerm}"`);
      }

      // 2. Buscar Info Cosmética (API Gratis)
      let displayInfo = { team: "NBA Team", fullName: localData.player };
      try {
        const apiProfile = await searchPlayerInAPI(searchTerm);
        if (apiProfile) {
          displayInfo.team = apiProfile.team.full_name;
          displayInfo.fullName = `${apiProfile.first_name} ${apiProfile.last_name}`;
        }
      } catch (e) {}

      // 3. LÓGICA DEL PROFESOR: ¿DEBERÍA APOSTAR?
      let advice = "INGRESA LA LÍNEA DEL CASINO";
      let adviceColor = "text-slate-400";
      let diff = 0;

      if (stakeLine) {
        const line = parseFloat(stakeLine);
        diff = localData.points - line; // Diferencia entre IA y Casino
        const absDiff = Math.abs(diff);

        // Si la diferencia es MENOR al margen de error -> ES RIESGOSO
        if (absDiff <= localData.error) {
          advice = "⛔ NO APUESTES (Alto Riesgo)";
          adviceColor = "text-red-500";
        } else {
          // Si la diferencia es MAYOR al error -> ES SEGURO
          advice = diff > 0 ? "✅ APUESTA: OVER (Más de)" : "✅ APUESTA: UNDER (Menos de)";
          adviceColor = "text-green-400";
        }
      }

      setPlayerData({
        ...displayInfo,
        prediction: localData.points,
        realAvg: localData.real_pts,
        errorMargin: localData.error,
        advice,
        adviceColor,
        diff: diff.toFixed(1)
      });

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
      
      {/* HEADER */}
      <div className="p-6 bg-slate-800 border-b border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">🏀 NBA Advisor</h2>
          <button onClick={getTop5} className="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded">
            VER TOP 5
          </button>
        </div>
        
        <div className="flex flex-col gap-3">
          {/* BUSCADOR */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Jugador (Ej: Curry)"
              className="flex-1 bg-slate-900 text-white p-3 rounded-lg border border-slate-600 focus:border-orange-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* INPUT DEL CASINO (LO NUEVO) */}
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="¿Línea del Casino? (Ej: 24.5)"
              className="w-full bg-slate-900 text-white p-3 rounded-lg border border-blue-600 focus:border-blue-400 outline-none"
              value={stakeLine}
              onChange={(e) => setStakeLine(e.target.value)}
            />
            <button 
              onClick={handleSearch}
              className="bg-orange-600 hover:bg-orange-700 text-white px-6 rounded-lg font-bold"
            >
              ANALIZAR
            </button>
          </div>
        </div>
        {errorMsg && <p className="text-red-400 text-sm mt-3">{errorMsg}</p>}
      </div>

      {/* RESULTADOS */}
      {playerData && (
        <div className="p-6 animate-fade-in">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-black text-white">{playerData.fullName}</h1>
              <p className="text-slate-400">{playerData.team}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase">Predicción IA</p>
              <p className="text-4xl font-black text-white">{playerData.prediction}</p>
              <p className="text-sm text-slate-400">Margen Error: <span className="text-yellow-400">+/- {playerData.errorMargin}</span></p>
            </div>
          </div>

          {/* LA RECOMENDACIÓN DEL PROFESOR */}
          <div className="bg-slate-800 p-4 rounded-xl border border-slate-600 text-center">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-1">Recomendación del Sistema</p>
            <h3 className={`text-2xl font-black ${playerData.adviceColor}`}>
              {playerData.advice}
            </h3>
            {stakeLine && (
              <p className="text-sm text-slate-500 mt-2">
                Margen de ventaja: {playerData.diff} pts (Debe ser mayor a {playerData.errorMargin})
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}