import java.util.ArrayList;
import java.util.List;

// A stand-in speaker, used by the tests and the demo. You don't need to change this file.
// It keeps what it played, so the tests can check it.
class FakeSpeaker implements Speaker {
    final List<String> played = new ArrayList<>();

    public void play(String station) {
        played.add(station);
    }

    public void stop() {
        played.add("(stopped)");
    }
}
