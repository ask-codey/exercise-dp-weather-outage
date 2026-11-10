# Exercise: When the Weather Service Is Down

Exercise code for the lesson **Exercise: When the Weather Service Is Down** in the course *Design Patterns, Demystified* on [ask-codey.com](https://www.ask-codey.com).

## The ticket

> **From:** Maya, who owns the house (and the HomeBase hub)
>
> Last Tuesday SkyCast, our weather service, was down for an hour, and the hub had a bad morning. Three things to fix in the morning briefing, the routine that shows the weather on the kitchen display at 7:00 and plays the news in every room:
>
> 1. **One missed call shouldn't cost the morning its weather.** SkyCast misses a call now and then, and a second try a moment later works. Try up to **3 times**, waiting **1 second** before the second try and **2 seconds** before the third. Then give up and show `Weather: unavailable`, as today. Wait with the hub's clock (`clock.sleep(seconds)`), never a real pause: the tests hand in a fake clock.
> 2. **When SkyCast is really down, leave it alone for a while.** After **3 briefings in a row** that couldn't get the weather (each after its 3 tries), don't call SkyCast at all for **30 seconds**: show `Weather: unavailable` straight away, without waiting. After 30 seconds, let the next briefing try again, with its usual tries. If that works, carry on as normal; if it doesn't, leave SkyCast alone for another 30 seconds. A briefing that gets the weather starts the count of failures again.
> 3. **The new bedroom has no speaker yet.** The installer added it with `Room("bedroom")`, and the briefing crashed. Other teams' routines (bedtime, dinner music) call `room.speaker.play(...)` and `room.speaker.stop()` on every room, and they won't be adding checks, so a room with no speaker needs a speaker that's safe to call and does nothing.
>
> Everything that works today has to keep working.

The hub already hands the briefing its clock, with `now()` (the time, in seconds) and `sleep(seconds)`, but the briefing doesn't use it yet.

## Pick your language

The same exercise is here in five languages. Work in the folder for the language you set up; you only need one.

| Folder | The hub's code | The tests |
|---|---|---|
| `csharp/` | `WeatherOutage/Hub.cs` | `WeatherOutage.Tests/WeatherOutageTests.cs` |
| `java/` | `src/main/java/` (`MorningBriefing.java`, `Room.java` and the rest) | `src/test/java/WeatherOutageTest.java` |
| `python/` | `hub.py` | `test_hub.py` |
| `javascript/` | `hub.js` | `hub.test.js` |
| `typescript/` | `hub.ts` | `hub.test.ts` |

The names follow each language's style: `Run`, `Speaker`, `Now` and `Sleep` in C#, and `run`, `speaker`, `now` and `sleep` in the others.

Every folder also has **the fakes** (`Fakes.cs`, the `Fake….java` files, `fakes.py`, `fakes.js`, `fakes.ts`): stand-ins for SkyCast, the clock and a speaker. `FakeSkyCast` answers from a script of `"sunny"` and `"down"` and counts its calls; `FakeClock` keeps a list of every wait and never really waits; `FakeSpeaker` keeps what it played. The tests and the demo use them. You don't need to change the fakes, the tests or the demo.

## Run it and check your work

Open your language's folder in VS Code (**File > Open Folder**), then open its terminal (**Terminal > New Terminal**) and run these commands there.

**C#**

```bash
dotnet run --project WeatherOutage
dotnet test
```

**Java** (the Maven Wrapper downloads Maven the first time, so the first run takes a minute)

```bash
java src/main/java/Demo.java
./mvnw test
```

On Windows in PowerShell, write `.\mvnw test` instead of `./mvnw test`.

**Python** (once: make a virtual environment and install pytest into it)

```bash
python -m venv .venv
```

Then turn it on: `.venv\Scripts\Activate.ps1` in PowerShell on Windows, or `source .venv/bin/activate` on macOS (where the command is `python3`, not `python`). Then:

```bash
pip install -r requirements.txt
python demo.py
python -m pytest
```

**JavaScript**

```bash
node demo.js
npm test
```

**TypeScript** (once: `npm install`, which installs TypeScript)

```bash
node demo.ts
npm test
```

At first, 3 tests pass and 8 fail. The 3 that pass are what the hub does today: keep them green the whole time, and run the tests after every small change. The 8 that fail are the ticket. A failing test's message starts with **Not yet:** (or **Keep this working:** if you broke something that worked) and says what it expected. The starter's demo stops with an error when it reaches the bedroom: that's part of the ticket too.

## When you're done

All 11 tests are green, and the demo prints:

```text
A hiccup: Weather: 72F, sunny (SkyCast calls: 2, waited 1 s)
SkyCast down: Weather: unavailable (SkyCast calls: 3, waited 3 s)
SkyCast down: Weather: unavailable (SkyCast calls: 3, waited 3 s)
SkyCast down: Weather: unavailable (SkyCast calls: 3, waited 3 s)
SkyCast down: Weather: unavailable (SkyCast calls: 0, waited 0 s)
30 s later: Weather: 72F, sunny (SkyCast calls: 1, waited 0 s)
With the bedroom: Weather: 72F, sunny (SkyCast calls: 1, waited 0 s)
The news played 7 times in the kitchen
```

<details>
<summary>Stuck?</summary>

- **For the missed call:** the briefing treats one failure as final. Wrap the call to SkyCast in a few tries that wait longer each time, with the clock's `sleep`, and retry only SkyCast's own "didn't answer" error (the **Retry** pattern, with backoff). A small function that's handed the call to make keeps it reusable. (*Retry: Try Again, a Little Later*.)
- **For the outage:** nothing remembers that the last briefings failed. Give the briefing a circuit breaker that counts failed briefings in a row and has three states: closed (call as usual), open (answer "unavailable" at once, using the clock's `now()` to tell when 30 seconds have passed) and half-open (let one briefing through as a trial). Put the retry *inside* the breaker, so the breaker counts a briefing as failed only after its tries gave up (the **Circuit Breaker** pattern). (*Circuit Breaker: Stop Calling a Broken Service*.)
- **For the bedroom:** "no speaker" is stored as null, so every caller has to check. Give a room that has no speaker a speaker that keeps the same promise and does nothing (the **Null Object** pattern). (*Null Object: A Safe Stand-In for Nothing*.)

</details>

## Hand it in

When it works, push your solution to a public repo of your own on GitHub, then paste that repo's address into **Submit your exercise** on the lesson page at [ask-codey.com](https://www.ask-codey.com). That's what completes the lesson. The lesson page shows the Git commands, step by step.
