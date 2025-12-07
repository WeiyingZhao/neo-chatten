import { useEffect, useState } from 'react';
import { Gauge, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { qScoreService, marketService } from '../services';
import type { QScoreResult, AIModel } from '../types';

function QScoreGauge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-primary';
    if (score >= 50) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            className="stroke-muted"
            strokeWidth="10"
            fill="none"
            r="40"
            cx="50"
            cy="50"
          />
          <circle
            className={`${getColor()} transition-all duration-500`}
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            r="40"
            cx="50"
            cy="50"
            style={{
              strokeDasharray: `${(score / 100) * 251.2} 251.2`,
              stroke: 'currentColor',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${getColor()}`}>{score.toFixed(0)}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">Q-Score</p>
    </div>
  );
}

function ScoreBar({ label, score, max = 25 }: { label: string; score: number; max?: number }) {
  const percentage = (score / max) * 100;
  const getColor = () => {
    if (percentage >= 80) return 'bg-success';
    if (percentage >= 60) return 'bg-primary';
    if (percentage >= 40) return 'bg-warning';
    return 'bg-destructive';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{score.toFixed(1)} / {max}</span>
      </div>
      <Progress value={percentage} indicatorClassName={getColor()} />
    </div>
  );
}

export function QScore() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [qScores, setQScores] = useState<QScoreResult[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [selectedQScore, setSelectedQScore] = useState<QScoreResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [modelsData, scoresData] = await Promise.all([
          marketService.getModels(),
          qScoreService.getAllQScores(),
        ]);
        setModels(modelsData);
        setQScores(scoresData);
        if (scoresData.length > 0) {
          setSelectedModel(scoresData[0].model_id);
          setSelectedQScore(scoresData[0]);
        }
      } catch (error) {
        console.error('Failed to load Q-Score data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function analyzeModel(modelId: string) {
    setAnalyzing(true);
    try {
      const result = await qScoreService.calculateQScore(modelId);
      setSelectedQScore(result);
      setSelectedModel(modelId);
    } catch (error) {
      console.error('Failed to analyze model:', error);
    } finally {
      setAnalyzing(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Model to Analyze</CardTitle>
          <CardDescription>Choose an AI model to view its Q-Score breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {models.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? 'default' : 'outline'}
                onClick={() => analyzeModel(model.id)}
                disabled={analyzing}
              >
                {model.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {selectedQScore && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Q-Score Overview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Q-Score Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {analyzing ? (
                <div className="h-32 w-32 flex items-center justify-center">
                  <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <QScoreGauge score={selectedQScore.q_score} />
              )}

              <div className="flex items-center gap-2">
                {selectedQScore.mint_eligible ? (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Mint Eligible
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3 w-3" />
                    Not Eligible
                  </Badge>
                )}
              </div>

              <div className="w-full pt-4 border-t border-border">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Model</p>
                    <p className="font-medium">{selectedQScore.model_id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium capitalize">
                      {selectedQScore.category.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Score Breakdown */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Breakdown</CardTitle>
              <CardDescription>Component scores (25 points max each)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ScoreBar label="Latency" score={selectedQScore.latency_score} />
              <ScoreBar label="Throughput" score={selectedQScore.throughput_score} />
              <ScoreBar label="Quality" score={selectedQScore.quality_score} />
              <ScoreBar label="Reliability" score={selectedQScore.reliability_score} />
            </CardContent>
          </Card>

          {/* Performance Metrics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Avg Latency</p>
                  <p className="text-xl font-bold">
                    {selectedQScore.metrics.avg_latency_ms.toFixed(1)} ms
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">P95 Latency</p>
                  <p className="text-xl font-bold">
                    {selectedQScore.metrics.p95_latency_ms.toFixed(1)} ms
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Tokens/sec</p>
                  <p className="text-xl font-bold">
                    {selectedQScore.metrics.tokens_per_second.toFixed(0)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Accuracy</p>
                  <p className="text-xl font-bold">
                    {(selectedQScore.metrics.accuracy_score * 100).toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Uptime</p>
                  <p className="text-xl font-bold">
                    {selectedQScore.metrics.uptime_percentage.toFixed(2)}%
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm text-muted-foreground">Error Rate</p>
                  <p className="text-xl font-bold">
                    {(selectedQScore.metrics.error_rate * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {selectedQScore.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {/* All Models Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>All Models Q-Score Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {qScores.map((qScore) => {
              const model = models.find((m) => m.id === qScore.model_id);
              return (
                <div
                  key={qScore.model_id}
                  className={`flex items-center justify-between rounded-lg border p-4 cursor-pointer transition-colors ${
                    selectedModel === qScore.model_id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-background-elevated'
                  }`}
                  onClick={() => {
                    setSelectedModel(qScore.model_id);
                    setSelectedQScore(qScore);
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        qScore.q_score >= 80
                          ? 'bg-success/10 text-success'
                          : qScore.q_score >= 60
                          ? 'bg-primary/10 text-primary'
                          : qScore.q_score >= 50
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      <span className="font-bold">{qScore.q_score.toFixed(0)}</span>
                    </div>
                    <div>
                      <p className="font-medium">{model?.name || qScore.model_id}</p>
                      <p className="text-sm text-muted-foreground capitalize">
                        {qScore.category.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {qScore.mint_eligible ? (
                      <Badge variant="success">Eligible</Badge>
                    ) : (
                      <Badge variant="outline">Not Eligible</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
