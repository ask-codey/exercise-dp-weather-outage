"""The tests for your code. You don't need to change this file.
Each message says what was expected, so a failing test tells you what to look at."""
from fakes import FakeClock, FakeSkyCast, FakeSpeaker
from hub import MorningBriefing, Room

SUNNY = "Weather: 72F, sunny"
UNAVAILABLE = "Weather: unavailable"


def briefing(skycast, clock, *more_rooms):
    """A house with a speaker in the living room and the kitchen, and any more rooms given."""
    living_room, kitchen = FakeSpeaker(), FakeSpeaker()
    rooms = [Room("living room", living_room), Room("kitchen", kitchen), *more_rooms]
    return MorningBriefing(skycast, clock, rooms), living_room, kitchen


# What the hub does today. These pass before you change anything: keep them passing.

def test_a_sunny_morning_shows_the_weather():
    skycast, clock = FakeSkyCast(["sunny"]), FakeClock()
    morning, _, _ = briefing(skycast, clock)
    assert morning.run() == SUNNY, 'Keep this working: a sunny morning shows "Weather: 72F, sunny".'
    assert skycast.calls == 1, "Keep this working: when SkyCast answers, the briefing asks it once."
    assert clock.waits == [], "Keep this working: when SkyCast answers, the briefing doesn't wait."


def test_every_room_with_a_speaker_plays_the_news():
    morning, living_room, kitchen = briefing(FakeSkyCast(["sunny"]), FakeClock())
    morning.run()
    assert living_room.played == ["https://tuneo.example/news"], "Keep this working: the living room speaker plays the news, once."
    assert kitchen.played == ["https://tuneo.example/news"], "Keep this working: the kitchen speaker plays the news, once."


def test_when_skycast_is_down_the_briefing_still_runs():
    morning, _, kitchen = briefing(FakeSkyCast(["down"]), FakeClock())
    assert morning.run() == UNAVAILABLE, 'Keep this working: when SkyCast is down, the display shows "Weather: unavailable".'
    assert kitchen.played == ["https://tuneo.example/news"], "Keep this working: the news still plays when the weather is unavailable."


# The ticket's new requirements. These fail until the work is done.

def test_one_missed_call_is_tried_again():
    skycast, clock = FakeSkyCast(["down", "sunny"]), FakeClock()
    morning, _, _ = briefing(skycast, clock)
    assert morning.run() == SUNNY, "Not yet: one missed call is tried again, so the morning still gets its weather."
    assert skycast.calls == 2, "Not yet: one missed call, then one more try: 2 calls."
    assert clock.waits == [1], "Not yet: the second try comes after waiting 1 second."


def test_it_gives_up_after_three_tries_waiting_longer_each_time():
    skycast, clock = FakeSkyCast(["down"]), FakeClock()
    morning, _, _ = briefing(skycast, clock)
    assert morning.run() == UNAVAILABLE, 'Not yet: after 3 tries, the briefing gives up and shows "Weather: unavailable".'
    assert skycast.calls == 3, "Not yet: when SkyCast is down, the briefing tries 3 times, then gives up."
    assert clock.waits == [1, 2], "Not yet: it waits 1 second before the second try and 2 seconds before the third."


def test_after_three_failed_briefings_skycast_is_left_alone():
    skycast, clock = FakeSkyCast(["down"]), FakeClock()
    morning, _, _ = briefing(skycast, clock)
    for _ in range(3):
        morning.run()
    assert skycast.calls == 9, "Not yet: three failed briefings make 3 tries each: 9 calls."
    waits_so_far = len(clock.waits)
    assert morning.run() == UNAVAILABLE, 'Not yet: while SkyCast is left alone, the display shows "Weather: unavailable" at once.'
    assert skycast.calls == 9, "Not yet: after 3 failed briefings in a row, the 4th doesn't call SkyCast at all."
    assert len(clock.waits) == waits_so_far, "Not yet: while SkyCast is left alone, the briefing doesn't wait."


def test_failures_count_only_in_a_row():
    skycast = FakeSkyCast(["down"] * 6 + ["sunny"] + ["down"])
    morning, _, _ = briefing(skycast, FakeClock())
    for _ in range(6):
        morning.run()
    assert skycast.calls == 16, ("Not yet: a sunny morning starts the count again, so 2 failed briefings, "
                                 "a sunny one and 3 more failed ones still call SkyCast every time: 16 calls.")


def test_thirty_seconds_later_one_briefing_tries_again():
    skycast, clock = FakeSkyCast(["down"] * 9 + ["sunny"]), FakeClock()
    morning, _, _ = briefing(skycast, clock)
    for _ in range(3):
        morning.run()
    clock.advance(30)
    assert morning.run() == SUNNY, "Not yet: 30 seconds after SkyCast was left alone, one briefing tries it again, and it's back."
    assert skycast.calls == 10, "Not yet: the trial briefing's first call works: 10 calls."
    morning.run()
    assert skycast.calls == 11, "Not yet: once SkyCast answers again, every briefing calls it as usual."


def test_a_failed_trial_leaves_skycast_alone_again():
    skycast, clock = FakeSkyCast(["down"]), FakeClock()
    morning, _, _ = briefing(skycast, clock)
    for _ in range(3):
        morning.run()
    clock.advance(30)
    morning.run()
    after_trial = skycast.calls
    assert after_trial > 9, "Not yet: 30 seconds later, one briefing tries SkyCast again."
    morning.run()
    assert skycast.calls == after_trial, "Not yet: when the trial fails, SkyCast is left alone for another 30 seconds."
    clock.advance(30)
    morning.run()
    assert skycast.calls > after_trial, "Not yet: 30 seconds after a failed trial, the next briefing tries again."


def test_a_room_with_no_speaker_has_a_speaker_that_is_safe_to_call():
    bedroom = Room("bedroom")
    try:
        bedroom.speaker.play("https://tuneo.example/news")
        bedroom.speaker.stop()
    except Exception:
        assert False, "Not yet: other teams' routines call room.speaker on every room, so a room with no speaker needs one that's safe to call."


def test_a_room_with_no_speaker_doesnt_stop_the_briefing():
    morning, living_room, kitchen = briefing(FakeSkyCast(["sunny"]), FakeClock(), Room("bedroom"))
    try:
        line = morning.run()
    except Exception:
        assert False, "Not yet: the new bedroom has no speaker yet, and that mustn't stop the briefing."
    assert line == SUNNY, "Not yet: with the bedroom added, the display still shows the weather."
    assert living_room.played == ["https://tuneo.example/news"], "Not yet: with the bedroom added, the living room still plays the news."
    assert kitchen.played == ["https://tuneo.example/news"], "Not yet: with the bedroom added, the kitchen still plays the news."
