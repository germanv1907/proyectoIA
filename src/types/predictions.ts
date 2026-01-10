export interface PlayerPrediction {
  id: string;
  team: string;
  teamLogo: string;
  player: string;
  predictedPoints: number;
  betRecommendation: 'Over' | 'Under' | 'No apostar';
  confidence: number;
  line?: number;
}
