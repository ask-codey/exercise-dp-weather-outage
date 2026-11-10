// The tests for your code. You don't need to change this file.
// Each message says what was expected, so a failing test tells you what to look at.
import assert from "node:assert/strict";
import { test } from "node:test";
import { FakeClock, FakeSkyCast, FakeSpeaker } from "./fakes.ts";
import { MorningBriefing, Room } from "./hub.ts";

const SUNNY = "Weather: 72F, sunny";
const UNAVAILABLE = "Weather: unavailable";

// A house with a speaker in the living room and the kitchen, and any more rooms given.
function briefing(skyCast: FakeSkyCast, clock: FakeClock, ...moreRooms: Room[]) {
  const livingRoom = new FakeSpeaker();
  const kitchen = new FakeSpeaker();
  const rooms = [new Room("living room", livingRoom), new Room("kitchen", kitchen), ...moreRooms];
  return { morning: new MorningBriefing(skyCast, clock, rooms), livingRoom, kitchen };
}

function repeat(outcome: string, times: number): string[] {
  return Array(times).fill(outcome);
}

// What the hub does today. These pass before you change anything: keep them passing.

test("a sunny morning shows the weather", () => {
  const skyCast = new FakeSkyCast(["sunny"]);
  const clock = new FakeClock();
  const { morning } = briefing(skyCast, clock);
  assert.equal(morning.run(), SUNNY, 'Keep this working: a sunny morning shows "Weather: 72F, sunny".');
  assert.equal(skyCast.calls, 1, "Keep this working: when SkyCast answers, the briefing asks it once.");
  assert.deepEqual(clock.waits, [], "Keep this working: when SkyCast answers, the briefing doesn't wait.");
});

test("every room with a speaker plays the news", () => {
  const { morning, livingRoom, kitchen } = briefing(new FakeSkyCast(["sunny"]), new FakeClock());
  morning.run();
  assert.deepEqual(livingRoom.played, ["https://tuneo.example/news"], "Keep this working: the living room speaker plays the news, once.");
  assert.deepEqual(kitchen.played, ["https://tuneo.example/news"], "Keep this working: the kitchen speaker plays the news, once.");
});

test("when SkyCast is down, the briefing still runs", () => {
  const { morning, kitchen } = briefing(new FakeSkyCast(["down"]), new FakeClock());
  assert.equal(morning.run(), UNAVAILABLE, 'Keep this working: when SkyCast is down, the display shows "Weather: unavailable".');
  assert.deepEqual(kitchen.played, ["https://tuneo.example/news"], "Keep this working: the news still plays when the weather is unavailable.");
});

// The ticket's new requirements. These fail until the work is done.

test("one missed call is tried again", () => {
  const skyCast = new FakeSkyCast(["down", "sunny"]);
  const clock = new FakeClock();
  const { morning } = briefing(skyCast, clock);
  assert.equal(morning.run(), SUNNY, "Not yet: one missed call is tried again, so the morning still gets its weather.");
  assert.equal(skyCast.calls, 2, "Not yet: one missed call, then one more try: 2 calls.");
  assert.deepEqual(clock.waits, [1], "Not yet: the second try comes after waiting 1 second.");
});

test("it gives up after three tries, waiting longer each time", () => {
  const skyCast = new FakeSkyCast(["down"]);
  const clock = new FakeClock();
  const { morning } = briefing(skyCast, clock);
  assert.equal(morning.run(), UNAVAILABLE, 'Not yet: after 3 tries, the briefing gives up and shows "Weather: unavailable".');
  assert.equal(skyCast.calls, 3, "Not yet: when SkyCast is down, the briefing tries 3 times, then gives up.");
  assert.deepEqual(clock.waits, [1, 2], "Not yet: it waits 1 second before the second try and 2 seconds before the third.");
});

test("after three failed briefings, SkyCast is left alone", () => {
  const skyCast = new FakeSkyCast(["down"]);
  const clock = new FakeClock();
  const { morning } = briefing(skyCast, clock);
  for (let i = 0; i < 3; i++) morning.run();
  assert.equal(skyCast.calls, 9, "Not yet: three failed briefings make 3 tries each: 9 calls.");
  const waitsSoFar = clock.waits.length;
  assert.equal(morning.run(), UNAVAILABLE, 'Not yet: while SkyCast is left alone, the display shows "Weather: unavailable" at once.');
  assert.equal(skyCast.calls, 9, "Not yet: after 3 failed briefings in a row, the 4th doesn't call SkyCast at all.");
  assert.equal(clock.waits.length, waitsSoFar, "Not yet: while SkyCast is left alone, the briefing doesn't wait.");
});

test("failures count only in a row", () => {
  const skyCast = new FakeSkyCast([...repeat("down", 6), "sunny", "down"]);
  const { morning } = briefing(skyCast, new FakeClock());
  for (let i = 0; i < 6; i++) morning.run();
  assert.equal(skyCast.calls, 16, "Not yet: a sunny morning starts the count again, so 2 failed briefings, a sunny one and 3 more failed ones still call SkyCast every time: 16 calls.");
});

test("thirty seconds later, one briefing tries again", () => {
  const skyCast = new FakeSkyCast([...repeat("down", 9), "sunny"]);
  const clock = new FakeClock();
  const { morning } = briefing(skyCast, clock);
  for (let i = 0; i < 3; i++) morning.run();
  clock.advance(30);
  assert.equal(morning.run(), SUNNY, "Not yet: 30 seconds after SkyCast was left alone, one briefing tries it again, and it's back.");
  assert.equal(skyCast.calls, 10, "Not yet: the trial briefing's first call works: 10 calls.");
  morning.run();
  assert.equal(skyCast.calls, 11, "Not yet: once SkyCast answers again, every briefing calls it as usual.");
});

test("a failed trial leaves SkyCast alone again", () => {
  const skyCast = new FakeSkyCast(["down"]);
  const clock = new FakeClock();
  const { morning } = briefing(skyCast, clock);
  for (let i = 0; i < 3; i++) morning.run();
  clock.advance(30);
  morning.run();
  const afterTrial = skyCast.calls;
  assert.ok(afterTrial > 9, "Not yet: 30 seconds later, one briefing tries SkyCast again.");
  morning.run();
  assert.equal(skyCast.calls, afterTrial, "Not yet: when the trial fails, SkyCast is left alone for another 30 seconds.");
  clock.advance(30);
  morning.run();
  assert.ok(skyCast.calls > afterTrial, "Not yet: 30 seconds after a failed trial, the next briefing tries again.");
});

test("a room with no speaker has a speaker that's safe to call", () => {
  const bedroom = new Room("bedroom");
  assert.doesNotThrow(() => {
    bedroom.speaker!.play("https://tuneo.example/news");
    bedroom.speaker!.stop();
  }, "Not yet: other teams' routines call room.speaker on every room, so a room with no speaker needs one that's safe to call.");
});

test("a room with no speaker doesn't stop the briefing", () => {
  const { morning, livingRoom, kitchen } = briefing(new FakeSkyCast(["sunny"]), new FakeClock(), new Room("bedroom"));
  let line = "";
  assert.doesNotThrow(() => { line = morning.run(); }, "Not yet: the new bedroom has no speaker yet, and that mustn't stop the briefing.");
  assert.equal(line, SUNNY, "Not yet: with the bedroom added, the display still shows the weather.");
  assert.deepEqual(livingRoom.played, ["https://tuneo.example/news"], "Not yet: with the bedroom added, the living room still plays the news.");
  assert.deepEqual(kitchen.played, ["https://tuneo.example/news"], "Not yet: with the bedroom added, the kitchen still plays the news.");
});
