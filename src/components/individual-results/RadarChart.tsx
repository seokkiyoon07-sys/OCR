'use client';

import { useState } from 'react';

interface RadarChartProps {
  myScores: Record<string, number>;
  top10Scores?: Record<string, number>;
  averageScores?: Record<string, number>;
  previousExams?: Array<{
    id: string;
    name: string;
    scores: Record<string, number>;
  }>;
  maxScores?: Record<string, number>;
}

// Default max scores
const defaultMaxScores: Record<string, number> = {
  '국어': 100,
  '수학': 100,
  '영어': 100,
  '탐구1': 50,
  '탐구2': 50,
  '한국사': 50,
};

// Subject labels for the hexagon
const subjectLabels = ['국어', '수학', '영어', '탐구1', '탐구2', '한국사'];

export function RadarChart({ 
  myScores, 
  top10Scores, 
  averageScores, 
  previousExams = [],
  maxScores = defaultMaxScores 
}: RadarChartProps) {
  const [showTop10, setShowTop10] = useState(false);
  const [showAverage, setShowAverage] = useState(false);
  const [showPrevExam, setShowPrevExam] = useState(false);
  const [selectedPrevExam, setSelectedPrevExam] = useState<string>(previousExams[0]?.id || '');

  // Calculate points for hexagon at given scale
  const getHexagonPoints = (scale: number): { x: number; y: number }[] => {
    return [
      { x: 200, y: 200 - 150 * scale },           // 국어 (top)
      { x: 200 + 130 * scale, y: 200 - 75 * scale }, // 수학 (top-right)
      { x: 200 + 130 * scale, y: 200 + 75 * scale }, // 영어 (bottom-right)
      { x: 200, y: 200 + 150 * scale },           // 탐구1 (bottom)
      { x: 200 - 130 * scale, y: 200 + 75 * scale }, // 탐구2 (bottom-left)
      { x: 200 - 130 * scale, y: 200 - 75 * scale }, // 한국사 (top-left)
    ];
  };

  // Get data points for scores
  const getScorePoints = (scores: Record<string, number>) => {
    return subjectLabels.map((subject, idx) => {
      const score = scores[subject] ?? 0;
      const max = maxScores[subject] || 100;
      const ratio = score / max;
      const basePoints = getHexagonPoints(1);
      const center = { x: 200, y: 200 };
      
      return {
        x: center.x + (basePoints[idx].x - center.x) * ratio,
        y: center.y + (basePoints[idx].y - center.y) * ratio,
      };
    });
  };

  const myPoints = getScorePoints(myScores);
  const top10Points = top10Scores ? getScorePoints(top10Scores) : null;
  const avgPoints = averageScores ? getScorePoints(averageScores) : null;
  const prevExamData = previousExams.find(e => e.id === selectedPrevExam);
  const prevPoints = prevExamData ? getScorePoints(prevExamData.scores) : null;

  return (
    <div className="rounded-2xl border bg-white">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold">과목별 성적 분포</h3>
        <p className="text-sm text-neutral-600 mt-1">
          국어, 수학, 영어는 100점 만점 / 탐구, 한국사는 50점 만점
        </p>
      </div>
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Radar Chart SVG */}
          <div className="flex-1 flex justify-center">
            <svg viewBox="0 0 400 400" className="w-full max-w-[400px]">
              {/* Background hexagon grid */}
              {[1, 0.8, 0.6, 0.4, 0.2].map((scale, idx) => {
                const points = getHexagonPoints(scale);
                return (
                  <polygon
                    key={idx}
                    points={points.map(p => `${p.x},${p.y}`).join(' ')}
                    fill="none"
                    stroke="#e5e5e5"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Axis lines */}
              {getHexagonPoints(1).map((point, idx) => (
                <line
                  key={idx}
                  x1="200"
                  y1="200"
                  x2={point.x}
                  y2={point.y}
                  stroke="#e5e5e5"
                  strokeWidth="1"
                />
              ))}

              {/* Top 10% area */}
              {showTop10 && top10Points && (
                <polygon
                  points={top10Points.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(34, 197, 94, 0.1)"
                  stroke="#22c55e"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}

              {/* Average area */}
              {showAverage && avgPoints && (
                <polygon
                  points={avgPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(234, 179, 8, 0.1)"
                  stroke="#eab308"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}

              {/* Previous exam area */}
              {showPrevExam && prevPoints && (
                <polygon
                  points={prevPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="rgba(168, 85, 247, 0.1)"
                  stroke="#a855f7"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              )}

              {/* My scores area */}
              <polygon
                points={myPoints.map(p => `${p.x},${p.y}`).join(' ')}
                fill="rgba(59, 130, 246, 0.2)"
                stroke="#3b82f6"
                strokeWidth="2"
              />
              {myPoints.map((p, idx) => (
                <circle key={idx} cx={p.x} cy={p.y} r="5" fill="#3b82f6" />
              ))}

              {/* Subject labels */}
              <text x="200" y="30" textAnchor="middle" className="text-sm font-medium fill-neutral-700">국어 (100)</text>
              <text x="350" y="115" textAnchor="start" className="text-sm font-medium fill-neutral-700">수학 (100)</text>
              <text x="350" y="295" textAnchor="start" className="text-sm font-medium fill-neutral-700">영어 (100)</text>
              <text x="200" y="380" textAnchor="middle" className="text-sm font-medium fill-neutral-700">탐구1 (50)</text>
              <text x="50" y="295" textAnchor="end" className="text-sm font-medium fill-neutral-700">탐구2 (50)</text>
              <text x="50" y="115" textAnchor="end" className="text-sm font-medium fill-neutral-700">한국사 (50)</text>

              {/* Score values */}
              {subjectLabels.map((subject, idx) => {
                const score = myScores[subject] ?? 0;
                const positions = [
                  { x: 200, y: 68, anchor: 'middle' },
                  { x: 318, y: 133, anchor: 'start' },
                  { x: 318, y: 277, anchor: 'start' },
                  { x: 200, y: 342, anchor: 'middle' },
                  { x: 82, y: 277, anchor: 'end' },
                  { x: 82, y: 133, anchor: 'end' },
                ];
                const pos = positions[idx];
                return (
                  <text 
                    key={subject}
                    x={pos.x} 
                    y={pos.y} 
                    textAnchor={pos.anchor as 'middle' | 'start' | 'end'} 
                    className="text-xs font-bold fill-blue-600"
                  >
                    {score}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* Options and Legend */}
          <div className="lg:w-64 space-y-4">
            {/* Comparison Options */}
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-sm font-medium text-neutral-700 mb-3">비교 옵션</div>
              <div className="space-y-3">
                {top10Scores && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showTop10}
                      onChange={(e) => setShowTop10(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-green-500"></span>
                      상위 10%
                    </span>
                  </label>
                )}
                {averageScores && (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAverage}
                      onChange={(e) => setShowAverage(e.target.checked)}
                      className="w-4 h-4 rounded border-neutral-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      전체 평균
                    </span>
                  </label>
                )}
                {previousExams.length > 0 && (
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showPrevExam}
                        onChange={(e) => {
                          setShowPrevExam(e.target.checked);
                          if (e.target.checked && !selectedPrevExam) {
                            setSelectedPrevExam(previousExams[0]?.id || '');
                          }
                        }}
                        className="w-4 h-4 rounded border-neutral-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="flex items-center gap-2 text-sm">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        지난 시험
                      </span>
                    </label>
                    {showPrevExam && (
                      <div className="pl-7">
                        <select
                          value={selectedPrevExam}
                          onChange={(e) => setSelectedPrevExam(e.target.value)}
                          className="w-full text-xs px-2 py-1.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          {previousExams.map((exam) => (
                            <option key={exam.id} value={exam.id}>{exam.name}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="text-sm font-medium text-neutral-700 mb-3">범례</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-neutral-600">내 점수</span>
                </div>
                {showTop10 && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-neutral-600">상위 10%</span>
                  </div>
                )}
                {showAverage && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="text-neutral-600">전체 평균</span>
                  </div>
                )}
                {showPrevExam && prevExamData && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                    <span className="text-neutral-600">{prevExamData.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Score Summary */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-sm font-medium text-blue-700 mb-2">내 점수 요약</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {subjectLabels.map(subject => (
                  <div key={subject} className="flex justify-between">
                    <span className="text-neutral-600">{subject}</span>
                    <span className="font-medium">
                      {myScores[subject] ?? '-'}/{maxScores[subject] || 100}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
