# Morrow and the Last Light

A complete, short browser adventure about a night courier and Morrow, a lantern
moth who keeps watch over the last underground station.

The courier arrives at Platform 08 with a jar of dawn to deliver uphill. The
Meridian line has been closed for years, and the old maintenance gate is the
only way through. Morrow knows the signal sequence, but getting the lights on
means deciding what is worth remembering.

## Play

There is no build step, package installation, or third-party asset request.
From this directory, run:

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Controls

- **Mouse / touch:** choose story responses and use the signal switches.
- **1–4:** choose a dialogue response.
- **Enter / Space:** finish the current typewriter line.
- **Arrow keys / WASD:** move through the flooded tunnel.
- **Touch pad:** move on phones and tablets.
- **P:** pause or resume during the tunnel crossing.
- **J:** open the journal.
- **Save:** save the current safe checkpoint.
- **Sound:** toggle the optional, locally generated ambient drone and chimes.

## Story and progress

- Explore Platform 08, talk with Morrow, and find the maintenance note.
- In the service room, restore the signal in order: **lamp, bell, gate**.
- Cross the flooded tunnel, avoiding signal sparks and collecting old ticket
  stubs.
- Your conversations and discoveries affect the available endings. The journal
  tracks clues, keepsakes, and endings you've found.
- Progress saves automatically at story milestones and when collecting ticket
  stubs. **Continue** resumes a safe story checkpoint. If you lose focus in the
  tunnel, **Try again** retries that section with restored focus.
- **Start a new story** confirms before replacing the current save. Discovered
  endings remain recorded in the journal.

The game stores saves only in this browser using `localStorage`; no player data
is sent anywhere. Clearing browser storage removes the save.

## Tests

With Node.js installed, run the dependency-free gameplay tests:

```sh
node --test
```

The tests cover save/resume, the signal puzzle, tunnel survival and failure,
ending unlocks, and replay.

All characters, story, and pixel art are original. The game has no external
runtime dependencies or third-party assets.
