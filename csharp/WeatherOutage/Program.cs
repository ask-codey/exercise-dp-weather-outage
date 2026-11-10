using WeatherOutage;

// A demo: a week of mornings at Maya's house, with stand-ins for SkyCast and the clock. You don't need to change it.
FakeClock clock = new FakeClock();
FakeSkyCast skyCast = new FakeSkyCast(new[] { "down", "sunny" }.Concat(Enumerable.Repeat("down", 9)).Append("sunny").ToArray());
FakeSpeaker kitchen = new FakeSpeaker();
List<Room> house = new List<Room> { new Room("living room", new FakeSpeaker()), new Room("kitchen", kitchen) };
MorningBriefing morning = new MorningBriefing(skyCast, clock, house);

void Show(string label, MorningBriefing briefing)
{
    int calls = skyCast.Calls;
    int started = clock.Now();
    string line = briefing.Run();
    Console.WriteLine($"{label}: {line} (SkyCast calls: {skyCast.Calls - calls}, waited {clock.Now() - started} s)");
}

Show("A hiccup", morning);
for (int i = 0; i < 4; i++)
{
    Show("SkyCast down", morning);
}
clock.Advance(30);
Show("30 s later", morning);
Show("With the bedroom", new MorningBriefing(skyCast, clock, house.Append(new Room("bedroom")).ToList()));
Console.WriteLine($"The news played {kitchen.Played.Count} times in the kitchen");
