export interface PatternObstacle {
  laneIndex: 0 | 1 | 2;
  timeOffsetSeconds: number;
}

export interface ObstaclePattern {
  readonly id: string;
  readonly durationSeconds: number;
  readonly obstacles: readonly PatternObstacle[];
}

export class PatternManager {
  private readonly patterns: ObstaclePattern[] = [
    {
      id: 'single-center',
      durationSeconds: 1.1,
      obstacles: [{ laneIndex: 1, timeOffsetSeconds: 0.0 }]
    },
    {
      id: 'single-left-then-right',
      durationSeconds: 1.6,
      obstacles: [
        { laneIndex: 0, timeOffsetSeconds: 0.0 },
        { laneIndex: 2, timeOffsetSeconds: 0.65 }
      ]
    },
    {
      id: 'double-outside',
      durationSeconds: 1.4,
      obstacles: [
        { laneIndex: 0, timeOffsetSeconds: 0.0 },
        { laneIndex: 2, timeOffsetSeconds: 0.0 }
      ]
    },
    {
      id: 'center-then-side',
      durationSeconds: 1.7,
      obstacles: [
        { laneIndex: 1, timeOffsetSeconds: 0.0 },
        { laneIndex: 0, timeOffsetSeconds: 0.7 }
      ]
    },
    {
      id: 'staggered-zig',
      durationSeconds: 1.9,
      obstacles: [
        { laneIndex: 2, timeOffsetSeconds: 0.0 },
        { laneIndex: 1, timeOffsetSeconds: 0.65 },
        { laneIndex: 0, timeOffsetSeconds: 1.2 }
      ]
    },
    {
      id: 'double-left-center',
      durationSeconds: 1.5,
      obstacles: [
        { laneIndex: 0, timeOffsetSeconds: 0.0 },
        { laneIndex: 1, timeOffsetSeconds: 0.6 }
      ]
    }
  ];

  private lastPatternId: string | null = null;

  pickPattern(): ObstaclePattern {
    const candidates = this.patterns.filter((pattern) => pattern.id !== this.lastPatternId);
    const pool = candidates.length > 0 ? candidates : this.patterns;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    this.lastPatternId = selected.id;
    return selected;
  }
}
