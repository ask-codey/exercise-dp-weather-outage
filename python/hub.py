"""HomeBase's morning briefing. Read the ticket in README.md first."""


class SkyCastDown(Exception):
    """SkyCast didn't answer."""


class Room:
    def __init__(self, name, speaker=None):
        self.name = name
        self.speaker = speaker  # None when the room has no speaker yet


class MorningBriefing:
    """At 7:00 the hub shows the weather on the kitchen display and plays the news in every room."""

    def __init__(self, skycast, clock, rooms):
        self.skycast = skycast
        self.clock = clock  # the hub's clock: now() and sleep(seconds). The briefing doesn't use it yet.
        self.rooms = rooms

    def run(self):
        try:
            line = "Weather: " + self.skycast.weather()
        except SkyCastDown:
            line = "Weather: unavailable"
        for room in self.rooms:
            room.speaker.play("https://tuneo.example/news")
        return line
