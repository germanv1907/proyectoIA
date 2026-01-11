import { useState, useMemo } from 'react';
import myPredictions from '../data/nba_predictions.json';

// Interfaces
interface LocalData {
  player: string;
  points: number;
  real_pts: number;
  error: number;
}

interface AnalyzedBet {
  id: number;
  player: string;
  team: string; // Dato cosmético (opcional)
  prediction: number;
  line: number; // Lo que pide el casino
  error: number;
  diff: number; // Diferencia absoluta
  safetyScore: number; // Qué tan segura es la apuesta
  advice: string; // "OVER" o "UNDER"
  status: 'SAFE' | 'RISKY';
}

export function NbaPredictor() {
  // Inputs del formulario
  const [nameInput, setNameInput] = useState('');
  const [lineInput, setLineInput] = useState('');
  
  // Lista de apuestas analizadas
  const [bets, setBets] = useState<AnalyzedBet[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  // --- LÓGICA PRINCIPAL: AGREGAR JUGADOR A LA LISTA ---
  const handleAddBet = () => {
    if (!nameInput || !lineInput) return;
    setErrorMsg('');

    // 1. Buscar en el JSON Local
    const playerData = (myPredictions as LocalData[]).find(p => 
      p.player.toLowerCase().includes(nameInput.toLowerCase())
    );

    if (!playerData) {
      setErrorMsg(`No encontré a "${nameInput}" en la base de datos.`);
      return;
    }

    // 2. Calcular Lógica de Apuesta
    const line = parseFloat(lineInput);
    const pred = playerData.points;
    const diff = pred - line;
    const absDiff = Math.abs(diff);
    
    // Safety Score: Mientras más sobrepase el margen de error, más seguro es.
    // Ej: Diferencia 5, Error 1.5 -> Score 3.5 (Muy seguro)
    // Ej: Diferencia 1, Error 1.5 -> Score -0.5 (Riesgoso)
    const safetyScore = absDiff - playerData.error;

    const newBet: AnalyzedBet = {
      id: Date.now(),
      player: playerData.player,
      team: "NBA", // Podríamos buscarlo en API, pero para hacerlo rápido lo dejamos así
      prediction: pred,
      line: line,
      error: playerData.error,
      diff: parseFloat(diff.toFixed(1)),
      safetyScore: safetyScore,
      advice: diff > 0 ? "OVER ⬆️" : "UNDER ⬇️",
      status: safetyScore > 0 ? 'SAFE' : 'RISKY'
    };

    // 3. Guardar y Limpiar
    setBets([newBet, ...bets]); // Lo ponemos al principio
    setNameInput('');
    setLineInput('');
  };

  // --- TOP 3 MEJORES APUESTAS (Cálculo Automático) ---
  const topBets = useMemo(() => {
    return [...bets]
      .filter(b => b.status === 'SAFE') // Solo las seguras
      .sort((a, b) => b.safetyScore - a.safetyScore) // Las más seguras primero
      .slice(0, 3); // Solo las 3 mejores
  }, [bets]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-8">
      
      {/* 1. FORMULARIO DE INGRESO */}
      <div className="bg-slate-900 p-6 rounded-2xl shadow-xl border border-slate-800">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">📝 Agrega Jugadores a tu Cartilla</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            placeholder="Nombre (Ej: Curry)"
            className="flex-[2] bg-slate-800 text-white p-3 rounded-lg border border-slate-700 focus:border-orange-500 outline-none"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBet()}
          />
          <input
            type="number"
            placeholder="Línea Casino (Ej: 24.5)"
            className="flex-1 bg-slate-800 text-white p-3 rounded-lg border border-slate-700 focus:border-blue-500 outline-none"
            value={lineInput}
            onChange={(e) => setLineInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBet()}
          />
          <button 
            onClick={handleAddBet}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg transition-transform active:scale-95"
          >
            AGREGAR +
          </button>
        </div>
        {errorMsg && <p className="text-red-400 text-sm mt-3 text-center animate-pulse">{errorMsg}</p>}
      </div>

      {/* 2. EL PODIO: TOP 3 APUESTAS SEGURAS */}
      {topBets.length > 0 && (
        <div className="space-y-4 animate-fade-in">
          <h3 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 text-center uppercase tracking-widest">
            🏆 Top {topBets.length} Oportunidades de Hoy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topBets.map((bet, index) => (
              <div key={bet.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-yellow-600/50 p-5 rounded-xl relative overflow-hidden group hover:scale-105 transition-transform">
                <div className="absolute top-0 right-0 bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                  #{index + 1}
                </div>
                <h4 className="text-lg font-bold text-white truncate">{bet.player}</h4>
                <div className="mt-2 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-400">Tu Predicción</p>
                    <p className="text-2xl font-black text-white">{bet.prediction}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Casino</p>
                    <p className="text-xl font-bold text-slate-300">{bet.line}</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700 text-center">
                  <span className="block text-2xl font-black text-green-400 tracking-wider">
                    {bet.advice}
                  </span>
                  <span className="text-xs text-slate-500">Margen Seguridad: +{bet.safetyScore.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. LISTA COMPLETA DE ANÁLISIS */}
      {bets.length > 0 && (
        <div className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800">
          <table className="w-full text-left text-slate-300">
            <thead className="bg-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="p-4">Jugador</th>
                <th className="p-4">Predicción</th>
                <th className="p-4">Línea</th>
                <th className="p-4 text-center">Recomendación</th>
                <th className="p-4 text-right">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {bets.map((bet) => (
                <tr key={bet.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-white">{bet.player}</td>
                  <td className="p-4 text-orange-400 font-semibold">{bet.prediction}</td>
                  <td className="p-4">{bet.line}</td>
                  <td className="p-4 text-center">
                    {bet.status === 'SAFE' ? (
                      <span className="inline-block px-3 py-1 bg-green-900/50 text-green-400 border border-green-800 rounded-full text-xs font-bold">
                        ✅ {bet.advice}
                      </span>
                    ) : (
                      <span className="inline-block px-3 py-1 bg-red-900/50 text-red-400 border border-red-800 rounded-full text-xs font-bold">
                        ⛔ RIESGO
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right text-xs text-slate-500">
                    Dif: {bet.diff} | Err: {bet.error}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}