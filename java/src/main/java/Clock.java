// The hub's clock: what time it is, and a way to wait.
interface Clock {
    int now();
    void sleep(int seconds);
}
