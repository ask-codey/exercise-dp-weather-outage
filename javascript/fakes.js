// Stand-ins for SkyCast, the clock and a speaker, used by the tests and the demo. You don't need to change this file.
import { SkyCastDown } from "./hub.js";

// Answers from a script: each call uses the next outcome, "sunny" or "down", and the last one repeats.
export class FakeSkyCast {
  calls = 0;
  constructor(outcomes) { this.outcomes = [...outcomes]; }

  weather() {
    const outcome = this.outcomes[Math.min(this.calls, this.outcomes.length - 1)];
    this.calls++;
    if (outcome === "down") throw new SkyCastDown();
    return "72F, sunny";
  }
}

// A clock that moves only when told to. sleep() is how the hub waits, and it never really waits.
export class FakeClock {
  time = 0;
  waits = [];
  now() { return this.time; }
  sleep(seconds) { this.waits.push(seconds); this.time += seconds; }
  // How the tests and the demo let time pass.
  advance(seconds) { this.time += seconds; }
}

// A speaker that keeps what it played, so the tests can check it.
export class FakeSpeaker {
  played = [];
  play(station) { this.played.push(station); }
  stop() { this.played.push("(stopped)"); }
}
