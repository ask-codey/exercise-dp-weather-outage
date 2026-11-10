"""A demo: a week of mornings at Maya's house, with stand-ins for SkyCast and the clock. You don't need to change it."""
from fakes import FakeClock, FakeSkyCast, FakeSpeaker
from hub import MorningBriefing, Room

clock = FakeClock()
skycast = FakeSkyCast(["down", "sunny"] + ["down"] * 9 + ["sunny"])
kitchen = FakeSpeaker()
house = [Room("living room", FakeSpeaker()), Room("kitchen", kitchen)]
morning = MorningBriefing(skycast, clock, house)


def show(label, briefing):
    calls, started = skycast.calls, clock.now()
    line = briefing.run()
    print(f"{label}: {line} (SkyCast calls: {skycast.calls - calls}, waited {clock.now() - started} s)")


show("A hiccup", morning)
for _ in range(4):
    show("SkyCast down", morning)
clock.advance(30)
show("30 s later", morning)
show("With the bedroom", MorningBriefing(skycast, clock, house + [Room("bedroom")]))
print(f"The news played {len(kitchen.played)} times in the kitchen")
