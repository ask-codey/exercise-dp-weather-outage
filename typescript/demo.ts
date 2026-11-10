// A demo: a week of mornings at Maya's house, with stand-ins for SkyCast and the clock. You don't need to change it.
import { FakeClock, FakeSkyCast, FakeSpeaker } from "./fakes.ts";
import { MorningBriefing, Room } from "./hub.ts";

const clock = new FakeClock();
const skyCast = new FakeSkyCast(["down", "sunny", ...Array<string>(9).fill("down"), "sunny"]);
const kitchen = new FakeSpeaker();
const house = [new Room("living room", new FakeSpeaker()), new Room("kitchen", kitchen)];
const morning = new MorningBriefing(skyCast, clock, house);

function show(label: string, briefing: MorningBriefing): void {
  const calls = skyCast.calls;
  const started = clock.now();
  const line = briefing.run();
  console.log(`${label}: ${line} (SkyCast calls: ${skyCast.calls - calls}, waited ${clock.now() - started} s)`);
}

show("A hiccup", morning);
for (let i = 0; i < 4; i++) show("SkyCast down", morning);
clock.advance(30);
show("30 s later", morning);
show("With the bedroom", new MorningBriefing(skyCast, clock, [...house, new Room("bedroom")]));
console.log(`The news played ${kitchen.played.length} times in the kitchen`);
