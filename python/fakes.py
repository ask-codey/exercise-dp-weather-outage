"""Stand-ins for SkyCast, the clock and a speaker, used by the tests and the demo. You don't need to change this file."""
from hub import SkyCastDown


class FakeSkyCast:
    """Answers from a script: each call uses the next outcome, "sunny" or "down", and the last one repeats."""

    def __init__(self, outcomes):
        self.outcomes = list(outcomes)
        self.calls = 0

    def weather(self):
        outcome = self.outcomes[min(self.calls, len(self.outcomes) - 1)]
        self.calls += 1
        if outcome == "down":
            raise SkyCastDown()
        return "72F, sunny"


class FakeClock:
    """A clock that moves only when told to. sleep() is how the hub waits, and it never really waits."""

    def __init__(self):
        self.time = 0
        self.waits = []

    def now(self):
        return self.time

    def sleep(self, seconds):
        self.waits.append(seconds)
        self.time += seconds

    def advance(self, seconds):
        """How the tests and the demo let time pass."""
        self.time += seconds


class FakeSpeaker:
    """A speaker that keeps what it played, so the tests can check it."""

    def __init__(self):
        self.played = []

    def play(self, station):
        self.played.append(station)

    def stop(self):
        self.played.append("(stopped)")
