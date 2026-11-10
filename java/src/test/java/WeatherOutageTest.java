import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;

// The tests for your code. You don't need to change this file.
// Each message says what was expected, so a failing test tells you what to look at.
class WeatherOutageTest {
    private static final String SUNNY = "Weather: 72F, sunny";
    private static final String UNAVAILABLE = "Weather: unavailable";

    private final FakeSpeaker livingRoom = new FakeSpeaker();
    private final FakeSpeaker kitchen = new FakeSpeaker();

    // A house with a speaker in the living room and the kitchen, and any more rooms given.
    private MorningBriefing briefing(FakeSkyCast skyCast, FakeClock clock, Room... moreRooms) {
        List<Room> rooms = new ArrayList<>(List.of(new Room("living room", livingRoom), new Room("kitchen", kitchen)));
        rooms.addAll(List.of(moreRooms));
        return new MorningBriefing(skyCast, clock, rooms);
    }

    private static List<String> outcomes(int downs, String... then) {
        List<String> list = new ArrayList<>(Collections.nCopies(downs, "down"));
        list.addAll(List.of(then));
        return list;
    }

    // What the hub does today. These pass before you change anything: keep them passing.

    @Test
    void aSunnyMorningShowsTheWeather() {
        FakeSkyCast skyCast = new FakeSkyCast(List.of("sunny"));
        FakeClock clock = new FakeClock();
        MorningBriefing morning = briefing(skyCast, clock);
        assertEquals(SUNNY, morning.run(), "Keep this working: a sunny morning shows \"Weather: 72F, sunny\".");
        assertEquals(1, skyCast.calls, "Keep this working: when SkyCast answers, the briefing asks it once.");
        assertEquals(List.of(), clock.waits, "Keep this working: when SkyCast answers, the briefing doesn't wait.");
    }

    @Test
    void everyRoomWithASpeakerPlaysTheNews() {
        briefing(new FakeSkyCast(List.of("sunny")), new FakeClock()).run();
        assertEquals(List.of("https://tuneo.example/news"), livingRoom.played, "Keep this working: the living room speaker plays the news, once.");
        assertEquals(List.of("https://tuneo.example/news"), kitchen.played, "Keep this working: the kitchen speaker plays the news, once.");
    }

    @Test
    void whenSkyCastIsDownTheBriefingStillRuns() {
        MorningBriefing morning = briefing(new FakeSkyCast(List.of("down")), new FakeClock());
        assertEquals(UNAVAILABLE, morning.run(), "Keep this working: when SkyCast is down, the display shows \"Weather: unavailable\".");
        assertEquals(List.of("https://tuneo.example/news"), kitchen.played, "Keep this working: the news still plays when the weather is unavailable.");
    }

    // The ticket's new requirements. These fail until the work is done.

    @Test
    void oneMissedCallIsTriedAgain() {
        FakeSkyCast skyCast = new FakeSkyCast(List.of("down", "sunny"));
        FakeClock clock = new FakeClock();
        MorningBriefing morning = briefing(skyCast, clock);
        assertEquals(SUNNY, morning.run(), "Not yet: one missed call is tried again, so the morning still gets its weather.");
        assertEquals(2, skyCast.calls, "Not yet: one missed call, then one more try: 2 calls.");
        assertEquals(List.of(1), clock.waits, "Not yet: the second try comes after waiting 1 second.");
    }

    @Test
    void itGivesUpAfterThreeTriesWaitingLongerEachTime() {
        FakeSkyCast skyCast = new FakeSkyCast(List.of("down"));
        FakeClock clock = new FakeClock();
        MorningBriefing morning = briefing(skyCast, clock);
        assertEquals(UNAVAILABLE, morning.run(), "Not yet: after 3 tries, the briefing gives up and shows \"Weather: unavailable\".");
        assertEquals(3, skyCast.calls, "Not yet: when SkyCast is down, the briefing tries 3 times, then gives up.");
        assertEquals(List.of(1, 2), clock.waits, "Not yet: it waits 1 second before the second try and 2 seconds before the third.");
    }

    @Test
    void afterThreeFailedBriefingsSkyCastIsLeftAlone() {
        FakeSkyCast skyCast = new FakeSkyCast(List.of("down"));
        FakeClock clock = new FakeClock();
        MorningBriefing morning = briefing(skyCast, clock);
        for (int i = 0; i < 3; i++) {
            morning.run();
        }
        assertEquals(9, skyCast.calls, "Not yet: three failed briefings make 3 tries each: 9 calls.");
        int waitsSoFar = clock.waits.size();
        assertEquals(UNAVAILABLE, morning.run(), "Not yet: while SkyCast is left alone, the display shows \"Weather: unavailable\" at once.");
        assertEquals(9, skyCast.calls, "Not yet: after 3 failed briefings in a row, the 4th doesn't call SkyCast at all.");
        assertEquals(waitsSoFar, clock.waits.size(), "Not yet: while SkyCast is left alone, the briefing doesn't wait.");
    }

    @Test
    void failuresCountOnlyInARow() {
        FakeSkyCast skyCast = new FakeSkyCast(outcomes(6, "sunny", "down"));
        MorningBriefing morning = briefing(skyCast, new FakeClock());
        for (int i = 0; i < 6; i++) {
            morning.run();
        }
        assertEquals(16, skyCast.calls, "Not yet: a sunny morning starts the count again, so 2 failed briefings, a sunny one and 3 more failed ones still call SkyCast every time: 16 calls.");
    }

    @Test
    void thirtySecondsLaterOneBriefingTriesAgain() {
        FakeSkyCast skyCast = new FakeSkyCast(outcomes(9, "sunny"));
        FakeClock clock = new FakeClock();
        MorningBriefing morning = briefing(skyCast, clock);
        for (int i = 0; i < 3; i++) {
            morning.run();
        }
        clock.advance(30);
        assertEquals(SUNNY, morning.run(), "Not yet: 30 seconds after SkyCast was left alone, one briefing tries it again, and it's back.");
        assertEquals(10, skyCast.calls, "Not yet: the trial briefing's first call works: 10 calls.");
        morning.run();
        assertEquals(11, skyCast.calls, "Not yet: once SkyCast answers again, every briefing calls it as usual.");
    }

    @Test
    void aFailedTrialLeavesSkyCastAloneAgain() {
        FakeSkyCast skyCast = new FakeSkyCast(List.of("down"));
        FakeClock clock = new FakeClock();
        MorningBriefing morning = briefing(skyCast, clock);
        for (int i = 0; i < 3; i++) {
            morning.run();
        }
        clock.advance(30);
        morning.run();
        int afterTrial = skyCast.calls;
        assertTrue(afterTrial > 9, "Not yet: 30 seconds later, one briefing tries SkyCast again.");
        morning.run();
        assertEquals(afterTrial, skyCast.calls, "Not yet: when the trial fails, SkyCast is left alone for another 30 seconds.");
        clock.advance(30);
        morning.run();
        assertTrue(skyCast.calls > afterTrial, "Not yet: 30 seconds after a failed trial, the next briefing tries again.");
    }

    @Test
    void aRoomWithNoSpeakerHasASpeakerThatIsSafeToCall() {
        Room bedroom = new Room("bedroom");
        assertDoesNotThrow(() -> {
            bedroom.speaker.play("https://tuneo.example/news");
            bedroom.speaker.stop();
        }, "Not yet: other teams' routines call room.speaker on every room, so a room with no speaker needs one that's safe to call.");
    }

    @Test
    void aRoomWithNoSpeakerDoesntStopTheBriefing() {
        MorningBriefing morning = briefing(new FakeSkyCast(List.of("sunny")), new FakeClock(), new Room("bedroom"));
        String line = assertDoesNotThrow(() -> morning.run(), "Not yet: the new bedroom has no speaker yet, and that mustn't stop the briefing.");
        assertEquals(SUNNY, line, "Not yet: with the bedroom added, the display still shows the weather.");
        assertEquals(List.of("https://tuneo.example/news"), livingRoom.played, "Not yet: with the bedroom added, the living room still plays the news.");
        assertEquals(List.of("https://tuneo.example/news"), kitchen.played, "Not yet: with the bedroom added, the kitchen still plays the news.");
    }
}
