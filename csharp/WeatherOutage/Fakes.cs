namespace WeatherOutage;

// Stand-ins for SkyCast, the clock and a speaker, used by the tests and the demo. You don't need to change this file.

// Answers from a script: each call uses the next outcome, "sunny" or "down", and the last one repeats.
public class FakeSkyCast : ISkyCast
{
    private readonly List<string> outcomes;
    public int Calls { get; private set; }

    public FakeSkyCast(params string[] outcomes) { this.outcomes = outcomes.ToList(); }

    public string Weather()
    {
        string outcome = outcomes[Math.Min(Calls, outcomes.Count - 1)];
        Calls++;
        if (outcome == "down")
        {
            throw new SkyCastDownException();
        }
        return "72F, sunny";
    }
}

// A clock that moves only when told to. Sleep() is how the hub waits, and it never really waits.
public class FakeClock : IClock
{
    private int time;
    public List<int> Waits { get; } = new List<int>();

    public int Now() => time;

    public void Sleep(int seconds)
    {
        Waits.Add(seconds);
        time += seconds;
    }

    // How the tests and the demo let time pass.
    public void Advance(int seconds) => time += seconds;
}

// A speaker that keeps what it played, so the tests can check it.
public class FakeSpeaker : ISpeaker
{
    public List<string> Played { get; } = new List<string>();
    public void Play(string station) => Played.Add(station);
    public void Stop() => Played.Add("(stopped)");
}
