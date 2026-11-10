// HomeBase's morning briefing. Read the ticket in README.md first.

// SkyCast didn't answer.
export class SkyCastDown extends Error {}

export class Room {
  constructor(name, speaker = null) {
    this.name = name;
    this.speaker = speaker; // null when the room has no speaker yet
  }
}

// At 7:00 the hub shows the weather on the kitchen display and plays the news in every room.
export class MorningBriefing {
  constructor(skyCast, clock, rooms) {
    this.skyCast = skyCast;
    this.clock = clock; // the hub's clock: now() and sleep(seconds). The briefing doesn't use it yet.
    this.rooms = rooms;
  }

  run() {
    let line;
    try {
      line = "Weather: " + this.skyCast.weather();
    } catch (error) {
      if (!(error instanceof SkyCastDown)) throw error;
      line = "Weather: unavailable";
    }
    for (const room of this.rooms) {
      room.speaker.play("https://tuneo.example/news");
    }
    return line;
  }
}
