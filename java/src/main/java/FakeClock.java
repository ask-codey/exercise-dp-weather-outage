import java.util.ArrayList;
import java.util.List;

// A stand-in for the hub's clock, used by the tests and the demo. You don't need to change this file.
// It moves only when told to. sleep() is how the hub waits, and it never really waits.
class FakeClock implements Clock {
    private int time = 0;
    final List<Integer> waits = new ArrayList<>();

    public int now() {
        return time;
    }

    public void sleep(int seconds) {
        waits.add(seconds);
        time += seconds;
    }

    // How the tests and the demo let time pass.
    void advance(int seconds) {
        time += seconds;
    }
}
