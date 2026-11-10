import java.util.List;

// A stand-in for SkyCast, used by the tests and the demo. You don't need to change this file.
// It answers from a script: each call uses the next outcome, "sunny" or "down", and the last one repeats.
class FakeSkyCast implements SkyCast {
    private final List<String> outcomes;
    int calls = 0;

    FakeSkyCast(List<String> outcomes) {
        this.outcomes = outcomes;
    }

    public String weather() {
        String outcome = outcomes.get(Math.min(calls, outcomes.size() - 1));
        calls++;
        if (outcome.equals("down")) {
            throw new SkyCastDown();
        }
        return "72F, sunny";
    }
}
