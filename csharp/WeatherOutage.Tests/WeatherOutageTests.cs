using WeatherOutage;

namespace WeatherOutage.Tests;

// The tests for your code. You don't need to change this file.
// Each message says what was expected, so a failing test tells you what to look at.

[TestClass]
public class WeatherOutageTests
{
    private const string Sunny = "Weather: 72F, sunny";
    private const string Unavailable = "Weather: unavailable";

    // A house with a speaker in the living room and the kitchen, and any more rooms given.
    private static (MorningBriefing Morning, FakeSpeaker LivingRoom, FakeSpeaker Kitchen) Briefing(FakeSkyCast skyCast, FakeClock clock, params Room[] moreRooms)
    {
        FakeSpeaker livingRoom = new FakeSpeaker();
        FakeSpeaker kitchen = new FakeSpeaker();
        List<Room> rooms = new List<Room> { new Room("living room", livingRoom), new Room("kitchen", kitchen) };
        rooms.AddRange(moreRooms);
        return (new MorningBriefing(skyCast, clock, rooms), livingRoom, kitchen);
    }

    private static string[] Repeat(string outcome, int times) => Enumerable.Repeat(outcome, times).ToArray();

    // What the hub does today. These pass before you change anything: keep them passing.

    [TestMethod]
    public void ASunnyMorningShowsTheWeather()
    {
        FakeSkyCast skyCast = new FakeSkyCast("sunny");
        FakeClock clock = new FakeClock();
        MorningBriefing morning = Briefing(skyCast, clock).Morning;
        Assert.AreEqual(Sunny, morning.Run(), "Keep this working: a sunny morning shows \"Weather: 72F, sunny\".");
        Assert.AreEqual(1, skyCast.Calls, "Keep this working: when SkyCast answers, the briefing asks it once.");
        Assert.AreEqual(0, clock.Waits.Count, "Keep this working: when SkyCast answers, the briefing doesn't wait.");
    }

    [TestMethod]
    public void EveryRoomWithASpeakerPlaysTheNews()
    {
        var (morning, livingRoom, kitchen) = Briefing(new FakeSkyCast("sunny"), new FakeClock());
        morning.Run();
        CollectionAssert.AreEqual(new List<string> { "https://tuneo.example/news" }, livingRoom.Played, "Keep this working: the living room speaker plays the news, once.");
        CollectionAssert.AreEqual(new List<string> { "https://tuneo.example/news" }, kitchen.Played, "Keep this working: the kitchen speaker plays the news, once.");
    }

    [TestMethod]
    public void WhenSkyCastIsDownTheBriefingStillRuns()
    {
        var (morning, _, kitchen) = Briefing(new FakeSkyCast("down"), new FakeClock());
        Assert.AreEqual(Unavailable, morning.Run(), "Keep this working: when SkyCast is down, the display shows \"Weather: unavailable\".");
        CollectionAssert.AreEqual(new List<string> { "https://tuneo.example/news" }, kitchen.Played, "Keep this working: the news still plays when the weather is unavailable.");
    }

    // The ticket's new requirements. These fail until the work is done.

    [TestMethod]
    public void OneMissedCallIsTriedAgain()
    {
        FakeSkyCast skyCast = new FakeSkyCast("down", "sunny");
        FakeClock clock = new FakeClock();
        MorningBriefing morning = Briefing(skyCast, clock).Morning;
        Assert.AreEqual(Sunny, morning.Run(), "Not yet: one missed call is tried again, so the morning still gets its weather.");
        Assert.AreEqual(2, skyCast.Calls, "Not yet: one missed call, then one more try: 2 calls.");
        CollectionAssert.AreEqual(new List<int> { 1 }, clock.Waits, "Not yet: the second try comes after waiting 1 second.");
    }

    [TestMethod]
    public void ItGivesUpAfterThreeTriesWaitingLongerEachTime()
    {
        FakeSkyCast skyCast = new FakeSkyCast("down");
        FakeClock clock = new FakeClock();
        MorningBriefing morning = Briefing(skyCast, clock).Morning;
        Assert.AreEqual(Unavailable, morning.Run(), "Not yet: after 3 tries, the briefing gives up and shows \"Weather: unavailable\".");
        Assert.AreEqual(3, skyCast.Calls, "Not yet: when SkyCast is down, the briefing tries 3 times, then gives up.");
        CollectionAssert.AreEqual(new List<int> { 1, 2 }, clock.Waits, "Not yet: it waits 1 second before the second try and 2 seconds before the third.");
    }

    [TestMethod]
    public void AfterThreeFailedBriefingsSkyCastIsLeftAlone()
    {
        FakeSkyCast skyCast = new FakeSkyCast("down");
        FakeClock clock = new FakeClock();
        MorningBriefing morning = Briefing(skyCast, clock).Morning;
        for (int i = 0; i < 3; i++)
        {
            morning.Run();
        }
        Assert.AreEqual(9, skyCast.Calls, "Not yet: three failed briefings make 3 tries each: 9 calls.");
        int waitsSoFar = clock.Waits.Count;
        Assert.AreEqual(Unavailable, morning.Run(), "Not yet: while SkyCast is left alone, the display shows \"Weather: unavailable\" at once.");
        Assert.AreEqual(9, skyCast.Calls, "Not yet: after 3 failed briefings in a row, the 4th doesn't call SkyCast at all.");
        Assert.AreEqual(waitsSoFar, clock.Waits.Count, "Not yet: while SkyCast is left alone, the briefing doesn't wait.");
    }

    [TestMethod]
    public void FailuresCountOnlyInARow()
    {
        FakeSkyCast skyCast = new FakeSkyCast(Repeat("down", 6).Append("sunny").Append("down").ToArray());
        MorningBriefing morning = Briefing(skyCast, new FakeClock()).Morning;
        for (int i = 0; i < 6; i++)
        {
            morning.Run();
        }
        Assert.AreEqual(16, skyCast.Calls, "Not yet: a sunny morning starts the count again, so 2 failed briefings, a sunny one and 3 more failed ones still call SkyCast every time: 16 calls.");
    }

    [TestMethod]
    public void ThirtySecondsLaterOneBriefingTriesAgain()
    {
        FakeSkyCast skyCast = new FakeSkyCast(Repeat("down", 9).Append("sunny").ToArray());
        FakeClock clock = new FakeClock();
        MorningBriefing morning = Briefing(skyCast, clock).Morning;
        for (int i = 0; i < 3; i++)
        {
            morning.Run();
        }
        clock.Advance(30);
        Assert.AreEqual(Sunny, morning.Run(), "Not yet: 30 seconds after SkyCast was left alone, one briefing tries it again, and it's back.");
        Assert.AreEqual(10, skyCast.Calls, "Not yet: the trial briefing's first call works: 10 calls.");
        morning.Run();
        Assert.AreEqual(11, skyCast.Calls, "Not yet: once SkyCast answers again, every briefing calls it as usual.");
    }

    [TestMethod]
    public void AFailedTrialLeavesSkyCastAloneAgain()
    {
        FakeSkyCast skyCast = new FakeSkyCast("down");
        FakeClock clock = new FakeClock();
        MorningBriefing morning = Briefing(skyCast, clock).Morning;
        for (int i = 0; i < 3; i++)
        {
            morning.Run();
        }
        clock.Advance(30);
        morning.Run();
        int afterTrial = skyCast.Calls;
        Assert.IsTrue(afterTrial > 9, "Not yet: 30 seconds later, one briefing tries SkyCast again.");
        morning.Run();
        Assert.AreEqual(afterTrial, skyCast.Calls, "Not yet: when the trial fails, SkyCast is left alone for another 30 seconds.");
        clock.Advance(30);
        morning.Run();
        Assert.IsTrue(skyCast.Calls > afterTrial, "Not yet: 30 seconds after a failed trial, the next briefing tries again.");
    }

    [TestMethod]
    public void ARoomWithNoSpeakerHasASpeakerThatIsSafeToCall()
    {
        Room bedroom = new Room("bedroom");
        try
        {
            bedroom.Speaker!.Play("https://tuneo.example/news");
            bedroom.Speaker!.Stop();
        }
        catch (Exception)
        {
            Assert.Fail("Not yet: other teams' routines call room.Speaker on every room, so a room with no speaker needs one that's safe to call.");
        }
    }

    [TestMethod]
    public void ARoomWithNoSpeakerDoesntStopTheBriefing()
    {
        var (morning, livingRoom, kitchen) = Briefing(new FakeSkyCast("sunny"), new FakeClock(), new Room("bedroom"));
        string line = "";
        try
        {
            line = morning.Run();
        }
        catch (Exception)
        {
            Assert.Fail("Not yet: the new bedroom has no speaker yet, and that mustn't stop the briefing.");
        }
        Assert.AreEqual(Sunny, line, "Not yet: with the bedroom added, the display still shows the weather.");
        CollectionAssert.AreEqual(new List<string> { "https://tuneo.example/news" }, livingRoom.Played, "Not yet: with the bedroom added, the living room still plays the news.");
        CollectionAssert.AreEqual(new List<string> { "https://tuneo.example/news" }, kitchen.Played, "Not yet: with the bedroom added, the kitchen still plays the news.");
    }
}
