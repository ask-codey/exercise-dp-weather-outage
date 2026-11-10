// A room of Maya's house. Read the ticket in README.md first.
class Room {
    final String name;
    final Speaker speaker; // null when the room has no speaker yet

    Room(String name, Speaker speaker) {
        this.name = name;
        this.speaker = speaker;
    }

    Room(String name) {
        this(name, null);
    }
}
