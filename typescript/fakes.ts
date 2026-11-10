// Stand-ins for SkyCast, the clock and a speaker, used by the tests and the demo. You don't need to change this file.
import { SkyCastDown, type Clock, type SkyCast, type Speaker } from "./hub.ts";

// Answers from a script: each call uses the next outcome, "sunny" or "down", and the last one repeats.
export class FakeSkyCast implements SkyCast {
  outcomes: string[];
  calls = 0;
  constructor(outcomes: string[]) { this.outcomes = [...outcomes]; }

  weather(): string {
    const outcome = this.outcomes[Math.min(this.calls, this.outcomes.length - 1)];
    this.calls++;
    if (outcome === "down") throw new SkyCastDown();
    return "72F, sunny";
  }
}

// A clock that moves only when told to. sleep() is how the hub waits, and it never really waits.
export class FakeClock implements Clock {
  time = 0;
  waits: number[] = [];
  now(): number { return this.time; }
  sleep(seconds: number): void { this.waits.push(seconds); this.time += seconds; }
  // How the tests and the demo let time pass.
  advance(seconds: number): void { this.time += seconds; }
}

// A speaker that keeps what it played, so the tests can check it.
export class FakeSpeaker implements Speaker {
  played: string[] = [];
  play(station: string): void { this.played.push(station); }
  stop(): void { this.played.push("(stopped)"); }
}
