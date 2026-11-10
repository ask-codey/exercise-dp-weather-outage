namespace WeatherOutage;

// HomeBase's morning briefing. Read the ticket in README.md first.

// The hub's own promises: every speaker, SkyCast and the hub's clock keep these.
public interface ISpeaker
{
    void Play(string station);
    void Stop();
}

public interface ISkyCast
{
    string Weather();
}

public interface IClock
{
    int Now();
    void Sleep(int seconds);
}

// SkyCast didn't answer.
public class SkyCastDownException : Exception { }

public class Room
{
    public string Name { get; }
    public ISpeaker? Speaker { get; } // null when the room has no speaker yet

    public Room(string name, ISpeaker? speaker = null)
    {
        Name = name;
        Speaker = speaker;
    }
}

// At 7:00 the hub shows the weather on the kitchen display and plays the news in every room.
public class MorningBriefing
{
    private readonly ISkyCast skyCast;
    private readonly IClock clock; // the hub's clock. The briefing doesn't use it yet.
    private readonly List<Room> rooms;

    public MorningBriefing(ISkyCast skyCast, IClock clock, List<Room> rooms)
    {
        this.skyCast = skyCast;
        this.clock = clock;
        this.rooms = rooms;
    }

    public string Run()
    {
        string line;
        try
        {
            line = "Weather: " + skyCast.Weather();
        }
        catch (SkyCastDownException)
        {
            line = "Weather: unavailable";
        }
        foreach (Room room in rooms)
        {
            room.Speaker!.Play("https://tuneo.example/news"); // every room has a speaker... doesn't it?
        }
        return line;
    }
}
