import { NbaPredictor } from './components/NbaPredictor';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-black text-white flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">
          PROYECTO IA
        </h1>
        <p className="text-slate-500 mt-2">Sistema de predicción deportiva</p>
      </div>

      <NbaPredictor />

      <footer className="mt-12 text-slate-600 text-xs">
        Datos generados localmente con Python
      </footer>
    </div>
  );
}

export default App;