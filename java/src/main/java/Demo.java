import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

// A demo: a week of mornings at Maya's house, with stand-ins for SkyCast and the clock. You don't need to change it.
// Run it with: java src/main/java/Demo.java
public class Demo {
    static FakeClock clock = new FakeClock();
    static FakeSkyCast skyCast;

    static void show(String label, MorningBriefing briefing) {
        int calls = skyCast.calls;
        int started = clock.now();
        String line = briefing.run();
        System.out.println(label + ": " + line + " (SkyCast calls: " + (skyCast.calls - calls) + ", waited " + (clock.now() - started) + " s)");
    }

    public static void main(String[] args) {
        List<String> outcomes = new ArrayList<>(List.of("down", "sunny"));
        outcomes.addAll(Collections.nCopies(9, "down"));
        outcomes.add("sunny");
        skyCast = new FakeSkyCast(outcomes);
        FakeSpeaker kitchen = new FakeSpeaker();
        List<Room> house = new ArrayList<>(List.of(new Room("living room", new FakeSpeaker()), new Room("kitchen", kitchen)));
        MorningBriefing morning = new MorningBriefing(skyCast, clock, house);

        show("A hiccup", morning);
        for (int i = 0; i < 4; i++) {
            show("SkyCast down", morning);
        }
        clock.advance(30);
        show("30 s later", morning);
        List<Room> withBedroom = new ArrayList<>(house);
        withBedroom.add(new Room("bedroom"));
        show("With the bedroom", new MorningBriefing(skyCast, clock, withBedroom));
        System.out.println("The news played " + kitchen.played.size() + " times in the kitchen");
    }
}
