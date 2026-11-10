import java.util.List;

// At 7:00 the hub shows the weather on the kitchen display and plays the news in every room.
// Read the ticket in README.md first.
class MorningBriefing {
    private final SkyCast skyCast;
    private final Clock clock; // the hub's clock. The briefing doesn't use it yet.
    private final List<Room> rooms;

    MorningBriefing(SkyCast skyCast, Clock clock, List<Room> rooms) {
        this.skyCast = skyCast;
        this.clock = clock;
        this.rooms = rooms;
    }

    String run() {
        String line;
        try {
            line = "Weather: " + skyCast.weather();
        } catch (SkyCastDown down) {
            line = "Weather: unavailable";
        }
        for (Room room : rooms) {
            room.speaker.play("https://tuneo.example/news");
        }
        return line;
    }
}
