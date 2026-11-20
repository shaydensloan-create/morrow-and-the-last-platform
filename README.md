# Morrow and the Last Light

A cozy, original browser RPG about a night courier and Morrow, a lantern moth
who keeps watch over the last underground station. Explore the station, talk to
its residents, restore a signal, and cross a moving tunnel challenge on the way
to a hand-illustrated hillside at first light.

The courier arrives at Platform 08 with a jar of dawn to deliver uphill. The
Meridian line has been closed for years, and the old maintenance gate is the
only way through. Morrow knows the signal sequence, but getting the lights on
means deciding what is worth remembering.

## Play

There is no build step, package installation, third-party asset request, or
network connection required. The game's original title art, pixel scenes, and
procedurally composed soundtrack are bundled or generated locally. A web app
manifest is included for browsers that support installing small games to a
device's home screen.
From this directory, run:

```sh
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Controls

- **Mouse / touch:** choose story responses, use the signal switches, walk with
  the on-screen directional pad, and tap **Talk / interact** near someone.
- **1–4:** choose a dialogue response.
- **Enter / Space:** finish the current typewriter line; **E / Enter** interacts
  with nearby characters and objects while exploring.
- **Arrow keys / WASD:** explore the platform and signal room, and move through
  the flooded tunnel.
- **Touch pad:** move while exploring and during the tunnel crossing.
- **P:** pause or resume during the tunnel crossing.
- **J:** open the journal.
- **Save:** save the current safe checkpoint.
- **Sound:** toggle the optional, locally synthesized scene music, footsteps,
  and interaction chimes. Audio starts only after you turn it on.

## Story and progress

- Explore Platform 08 and meet Morrow, Pip, and Vale. Pip's keepsake and the
  characters' stories are recorded in your journal.
- Returning Pip’s ticket to the story unlocks a fourth, optional ending.
- Walk up to a character or object and press **E** to interact.
- In the service room, restore the signal in order: **lamp, bell, gate**.
- Cross the flooded tunnel, avoiding signal sparks and collecting old ticket
  stubs, then reach a newly illustrated hillside at first light.
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

The tests cover save/resume, keyboard and on-screen character interactions,
the signal puzzle, tunnel survival and failure, ending unlocks, and replay.

All characters, story, and pixel art are original. The game has no external
runtime dependencies or third-party assets.
