// HomeBase's morning briefing. Read the ticket in README.md first.

// The hub's own promises: every speaker, SkyCast and the hub's clock keep these.
export interface Speaker {
  play(station: string): void;
  stop(): void;
}

export interface SkyCast {
  weather(): string;
}

export interface Clock {
  now(): number;
  sleep(seconds: number): void;
}

// SkyCast didn't answer.
export class SkyCastDown extends Error {}

export class Room {
  name: string;
  speaker: Speaker | null; // null when the room has no speaker yet

  constructor(name: string, speaker: Speaker | null = null) {
    this.name = name;
    this.speaker = speaker;
  }
}

// At 7:00 the hub shows the weather on the kitchen display and plays the news in every room.
export class MorningBriefing {
  skyCast: SkyCast;
  clock: Clock; // the hub's clock. The briefing doesn't use it yet.
  rooms: Room[];

  constructor(skyCast: SkyCast, clock: Clock, rooms: Room[]) {
    this.skyCast = skyCast;
    this.clock = clock;
    this.rooms = rooms;
  }

  run(): string {
    let line: string;
    try {
      line = "Weather: " + this.skyCast.weather();
    } catch (error) {
      if (!(error instanceof SkyCastDown)) throw error;
      line = "Weather: unavailable";
    }
    for (const room of this.rooms) {
      room.speaker!.play("https://tuneo.example/news"); // every room has a speaker... doesn't it?
    }
    return line;
  }
}
