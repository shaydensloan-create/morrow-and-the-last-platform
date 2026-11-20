(() => {
    'use strict';

    const canvas = document.getElementById('scene');
    const ctx = canvas.getContext('2d');
    const titleScreen = document.getElementById('title-screen');
    const gameScreen = document.getElementById('game-screen');
    const sceneName = document.getElementById('scene-name');
    const chapterLabel = document.getElementById('chapter-label');
    const dialogue = document.getElementById('dialogue');
    const choiceList = document.getElementById('choice-list');
    const puzzlePanel = document.getElementById('puzzle-panel');
    const puzzleHint = document.getElementById('puzzle-hint');
    const puzzleLights = [...document.querySelectorAll('#puzzle-lights span')];
    const runnerHud = document.getElementById('runner-hud');
    const pauseCurtain = document.getElementById('pause-curtain');
    const endingCard = document.getElementById('ending-card');
    const gameoverCard = document.getElementById('gameover-card');
    const focusDisplay = document.getElementById('focus');
    const trustDisplay = document.getElementById('trust');
    const stubsDisplay = document.getElementById('stubs');
    const runnerTime = document.getElementById('runner-time');
    const soundToggle = document.getElementById('sound-toggle');
    const exploreHud = document.getElementById('explore-hud');
    const explorePrompt = document.getElementById('explore-prompt');
    const journalDialog = document.getElementById('journal-dialog');
    const saveStatus = document.getElementById('save-status');
    const saveFeedback = document.getElementById('save-feedback');
    const keys = new Set();
    const hazards = [];
    const ticketStubs = [];
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const runBounds = { left: 76, right: 692, top: 92, bottom: 408 };
    const courier = { x: 384, y: 380, radius: 9, speed: 218 };
    const hero = { x: 352, y: 244, facing: 'right', walking: false, speed: 148 };
    const characters = {
        pip: { x: 211, y: 238, sprite: ['...ppp...', '..ppppp..', '.ppppppp.', '.pppeppp.', '.ppppppp.', '..ppppp..', '...ppp...', '...ppp...'], colors: { p: '#b98367', e: '#fff2d6' } },
        vale: { x: 562, y: 231, sprite: ['...vvvv...', '..vvvvvv..', '.vvvvvvvv.', '.vveevvvv.', '.vvvvvvvv.', '..vvvvvv..', '...vvvv...', '..bbbbbb..', '.bbbbbbbb.', '.bbbyybbb.', '..bbbbbb..'], colors: { v: '#879dc1', e: '#fff7de', b: '#4c687f', y: '#e9c579' } }
    };
    const switchSequence = ['lamp', 'bell', 'gate'];
    const musicThemes = {
        platform: [392, 0, 523.25, 0, 587.33, 523.25, 392, 0, 329.63, 0, 392, 0, 523.25, 392, 293.66, 0],
        bell: [293.66, 349.23, 392, 0, 440, 392, 349.23, 0, 293.66, 0, 349.23, 392, 440, 0, 392, 0],
        tunnel: [261.63, 0, 311.13, 0, 349.23, 311.13, 261.63, 0, 233.08, 0, 261.63, 0, 311.13, 0, 349.23, 0],
        exit: [392, 523.25, 587.33, 0, 659.25, 587.33, 523.25, 0, 440, 523.25, 587.33, 0, 523.25, 440, 392, 0]
    };
    const bassThemes = {
        platform: [130.81, 146.83, 110, 98],
        bell: [146.83, 174.61, 130.81, 116.54],
        tunnel: [116.54, 130.81, 103.83, 98],
        exit: [196, 146.83, 174.61, 130.81]
    };
    const saveKey = 'morrow-last-light-save-v1';
    const morrowSprite = [
        '.......wwww.......',
        '......wwggww......',
        '.....wwggggww.....',
        '....wwggggggww....',
        '....wgggggggggw...',
        '.....gggddggg......',
        '......gdeedg.......',
        '.......gggg........',
        '.....bbbbbbbb......',
        '....bbbyyybbb.......',
        '...bbbbyyybbbb......',
        '...bbbbbbbbbbb......',
        '....bbbbbbbbbb......',
        '.....bb....bb.......',
        '....bb......bb......',
        '...bb........bb.....'
    ];
    const courierSprite = [
        '....hhhh....',
        '...hhhhhh...',
        '...hssss h..',
        '...hsssssh..',
        '....ssess...',
        '.....sss....',
        '....ccccc...',
        '...ccccccc..',
        '..cccyccccc.',
        '..cccyccccc.',
        '...ccccccc..',
        '....cc.cc...',
        '...cc...cc..',
        '..cc.....cc.'
    ];
    const colors = {
        w: '#9ad9c8',
        g: '#f5c66f',
        d: '#293547',
        e: '#fffdf5',
        b: '#4c6275',
        y: '#ffe28a'
    };
    const courierColors = {
        h: '#6f8da0',
        s: '#eac99b',
        e: '#fff3d4',
        c: '#577c84',
        y: '#e7bd72'
    };

    let scene = 'platform';
    let mode = 'title';
    let focus = 4;
    let trust = 0;
    let stubsFound = 0;
    let platformClue = false;
    let bellFixed = false;
    let puzzleProgress = 0;
    let runnerTimeLeft = 14;
    let runnerElapsed = 0;
    let hazardTimer = 0;
    let stubTimer = 0;
    let invulnerable = 0;
    let frameId = 0;
    let lastFrame = 0;
    let typeTimer = 0;
    let typeToken = 0;
    let questionAsked = false;
    let destinationShared = false;
    let pipMet = false;
    let pipTicket = false;
    let valeMet = false;
    let animationClock = 0;
    let stepClock = 0;
    let musicStep = 0;
    let nextMusicBeat = 0;
    let musicScene = '';
    let wispCalm = 0;
    let audioContext = null;
    let ambienceGain = null;
    let soundOn = false;
    let checkpoint = 'platform';
    let endingHistory = [];
    let lastEnding = '';
    let typing = false;
    let skipTyping = () => {};

    function resetGame() {
        window.cancelAnimationFrame(frameId);
        window.clearTimeout(typeTimer);
        scene = 'platform';
        mode = 'story';
        focus = 4;
        trust = 0;
        stubsFound = 0;
        platformClue = false;
        bellFixed = false;
        puzzleProgress = 0;
        runnerTimeLeft = 14;
        runnerElapsed = 0;
        hazardTimer = 0;
        stubTimer = 0;
        invulnerable = 0;
        questionAsked = false;
        destinationShared = false;
        pipMet = false;
        pipTicket = false;
        valeMet = false;
        lastEnding = '';
        checkpoint = 'platform';
        wispCalm = 0;
        hero.x = 352;
        hero.y = 244;
        hero.facing = 'right';
        hero.walking = false;
        hazards.length = 0;
        ticketStubs.length = 0;
        keys.clear();
        choiceList.replaceChildren();
        choiceList.hidden = false;
        exploreHud.hidden = true;
        puzzlePanel.hidden = true;
        runnerHud.hidden = true;
        pauseCurtain.hidden = true;
        endingCard.hidden = true;
        gameoverCard.hidden = true;
        document.getElementById('start-game').blur();
        updateStatus();
    }

    function startGame() {
        startNewStory();
    }

    function setScene(nextScene) {
        scene = nextScene;
        const labels = {
            platform: ['PLATFORM 08', 'THE MERIDIAN LINE'],
            bell: ['SIGNAL ROOM', 'THE SERVICE LEVEL'],
            tunnel: ['FLOODED TUNNEL', 'BELOW THE CITY'],
            exit: ['THE OLD GATE', 'A WAY THROUGH']
        };
        sceneName.textContent = labels[scene][0];
        chapterLabel.textContent = labels[scene][1];
        setMusicScene();
        drawScene();
    }

    function setSpeaker(name, role, mark) {
        document.getElementById('speaker').textContent = name;
        document.getElementById('speaker-role').textContent = role;
        document.getElementById('speaker-avatar').textContent = mark;
    }

    function speak(text, choices, speaker = 'MORROW') {
        const speakerInfo = {
            STORY: ['THE NIGHT COURIER', 'ON A DELIVERY', '✦'],
            PIP: ['PIP', 'STATION KEEPER OF LOST THINGS', 'P'],
            VALE: ['VALE', 'CARTOGRAPHER, SERVICE LEVEL', 'V'],
            MORROW: ['MORROW', 'LIGHTKEEPER, PLATFORM 08', 'M']
        }[speaker] || ['THE SIGNAL', 'A VOICE IN THE WIRES', '≈'];
        setSpeaker(...speakerInfo);
        choiceList.replaceChildren();
        choiceList.hidden = true;
        const token = ++typeToken;
        window.clearTimeout(typeTimer);
        dialogue.textContent = '';
        typing = true;
        let index = 0;
        const typeNext = () => {
            if (token !== typeToken) return;
            if (index >= text.length) {
                typing = false;
                skipTyping = () => {};
                showChoices(choices);
                return;
            }
            dialogue.textContent += text[index];
            index += 1;
            typeTimer = window.setTimeout(typeNext, 13);
        };
        skipTyping = () => {
            if (!typing || token !== typeToken) return;
            window.clearTimeout(typeTimer);
            dialogue.textContent = text;
            typing = false;
            skipTyping = () => {};
            showChoices(choices);
        };
        typeNext();
    }

    function showChoices(choices) {
        choiceList.replaceChildren();
        choiceList.hidden = choices.length === 0;
        choices.forEach((choice, index) => {
            const button = document.createElement('button');
            button.className = 'button choice-button';
            button.type = 'button';
            button.innerHTML = `<span class="choice-number">${index + 1}</span><span>${choice.label}</span>`;
            button.addEventListener('click', choice.action);
            choiceList.append(button);
        });
    }

    function updateStatus() {
        focusDisplay.textContent = `${'● '.repeat(focus)}${'○ '.repeat(4 - focus)}`.trim();
        trustDisplay.textContent = `${'◆ '.repeat(Math.min(trust, 3))}${'◇ '.repeat(Math.max(0, 3 - trust))}`.trim();
        stubsDisplay.textContent = `${stubsFound} / 3`;
        const party = ['COURIER', 'MORROW'];
        if (pipMet) party.push('PIP');
        if (valeMet) party.push('VALE');
        document.getElementById('party-members').textContent = party.join(' · ');
    }

    function addTrust(value = 1) {
        trust = Math.min(3, trust + value);
        updateStatus();
    }

    function currentSave() {
        return {
            version: 1,
            checkpoint,
            focus,
            trust,
            stubsFound,
            platformClue,
            bellFixed,
            puzzleProgress,
            questionAsked,
            destinationShared,
            pipMet,
            pipTicket,
            valeMet,
            lastEnding,
            endingHistory,
            savedAt: new Date().toISOString()
        };
    }

    function saveProgress(nextCheckpoint = checkpoint) {
        checkpoint = nextCheckpoint;
        try {
            window.localStorage.setItem(saveKey, JSON.stringify(currentSave()));
            const text = `Saved · ${new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
            saveStatus.textContent = text;
            saveFeedback.textContent = 'Progress saved.';
            return true;
        } catch (error) {
            saveStatus.textContent = 'Save unavailable in this browser.';
            saveFeedback.textContent = 'Could not save. Keep this tab open to protect your progress.';
            console.error('Unable to save the story to this browser.', error);
            return false;
        }
    }

    function readSave() {
        let raw;
        try {
            raw = window.localStorage.getItem(saveKey);
        } catch (error) {
            saveStatus.textContent = 'Browser storage is unavailable; progress will not persist.';
            console.error('Unable to read the story save from this browser.', error);
            return null;
        }
        if (!raw) return null;

        try {
            const data = JSON.parse(raw);
            if (data.version !== 1 || typeof data.checkpoint !== 'string') {
                throw new Error('Unsupported or invalid save version.');
            }
            return data;
        } catch (error) {
            saveStatus.textContent = 'The saved story could not be read. Start a new night to continue.';
            console.error('The saved story is invalid.', error);
            return null;
        }
    }

    function applySave(data) {
        if (!data) return;
        focus = Number.isInteger(data.focus) ? Math.max(1, Math.min(4, data.focus)) : 4;
        trust = Number.isInteger(data.trust) ? Math.max(0, Math.min(3, data.trust)) : 0;
        stubsFound = Number.isInteger(data.stubsFound) ? Math.max(0, Math.min(3, data.stubsFound)) : 0;
        platformClue = data.platformClue === true;
        bellFixed = data.bellFixed === true;
        puzzleProgress = Number.isInteger(data.puzzleProgress) ? Math.max(0, Math.min(2, data.puzzleProgress)) : 0;
        questionAsked = data.questionAsked === true;
        destinationShared = data.destinationShared === true;
        pipMet = data.pipMet === true;
        pipTicket = data.pipTicket === true;
        valeMet = data.valeMet === true;
        checkpoint = ['platform', 'signal', 'tunnel', 'ending'].includes(data.checkpoint)
            ? data.checkpoint
            : 'platform';
        lastEnding = ['guide', 'stay', 'note'].includes(data.lastEnding) ? data.lastEnding : '';
        endingHistory = Array.isArray(data.endingHistory)
            ? [...new Set(data.endingHistory.filter((ending) => ['guide', 'stay', 'note'].includes(ending)))]
            : [];
        updateStatus();
    }

    function continueGame() {
        const saved = readSave();
        if (!saved) return;
        resetGame();
        applySave(saved);
        titleScreen.hidden = true;
        gameScreen.hidden = false;
        document.getElementById('journal-button').hidden = false;
        document.getElementById('save-button').hidden = false;
        saveFeedback.textContent = 'Story continued.';

        if (checkpoint === 'ending' && lastEnding) {
            setScene('exit');
            displayEnding(lastEnding);
        } else if (checkpoint === 'tunnel' && bellFixed) {
            setScene('tunnel');
            enterTunnel();
            saveFeedback.textContent = 'Tunnel checkpoint restored. Your focus is refreshed.';
        } else if (checkpoint === 'signal' || bellFixed) {
            setScene('bell');
            signalRoomChoices();
        } else {
            setScene('platform');
            platformChoices();
        }
    }

    function startNewStory() {
        let history = endingHistory;
        const saved = readSave();
        if (saved && Array.isArray(saved.endingHistory)) {
            history = [...new Set(saved.endingHistory.filter((ending) => ['guide', 'stay', 'note'].includes(ending)))];
        }
        resetGame();
        endingHistory = history;
        titleScreen.hidden = true;
        gameScreen.hidden = false;
        document.getElementById('journal-button').hidden = false;
        document.getElementById('save-button').hidden = false;
        setScene('platform');
        mode = 'walk';
        exploreHud.hidden = false;
        saveProgress('platform');
        speak(
            'At the bottom of the city, the Meridian station keeps a sky of its own. Morrow tends the lantern. Pip keeps the lost things. Walk around and say hello.',
            [],
            'STORY'
        );
        startFrameLoop();
    }

    function updateJournal() {
        const objective = checkpoint === 'ending'
            ? 'The night is complete. You can take another route from the title.'
            : checkpoint === 'tunnel'
                ? 'Cross the flooded tunnel. Follow the lantern and watch the signal sparks.'
                : bellFixed
                    ? 'The signal is fixed. Morrow can lead you through the tunnel.'
                    : checkpoint === 'signal'
                        ? 'Restore the platform signal in the service room.'
                        : 'Find a way through the maintenance gate with Morrow.';
        document.getElementById('journal-objective').textContent = objective;

        const inventory = ['A sealed jar of dawn — the courier’s delivery.'];
        if (platformClue) inventory.push('A maintenance note — “Wake the lamp. Give the bell a voice. Unlatch the way.”');
        if (bellFixed) inventory.push('A brass signal key — warm from the bell mechanism.');
        if (pipTicket) inventory.push('Pip’s return ticket — softened by years in a little wooden box.');
        for (let index = 0; index < stubsFound; index += 1) {
            inventory.push([
                'Ticket stub — Platform 08.',
                'Ticket stub — One passenger.',
                'Ticket stub — Return journey.'
            ][index]);
        }
        fillJournalList('journal-inventory', inventory);

        const memories = [];
        if (questionAsked) memories.push('Morrow keeps the lamp lit in case someone needs the way home.');
        if (destinationShared) memories.push('The jar holds a small piece of morning.');
        if (pipMet) memories.push('Pip keeps the station’s lost things company until their people return.');
        if (valeMet) memories.push('Vale remembers the old railway signal sequence.');
        if (platformClue) memories.push('The signal runs in a three-step sequence.');
        if (bellFixed) memories.push('The old gate still opens when the signal is restored.');
        if (memories.length === 0) memories.push('Your night is just beginning.');
        fillJournalList('journal-memories', memories);

        const endingLabels = {
            guide: 'Two lights on the road',
            stay: 'A station for whoever comes',
            note: 'A message under the bell'
        };
        fillJournalList('journal-endings', ['guide', 'stay', 'note'].map((ending) => (
            endingHistory.includes(ending) ? endingLabels[ending] : '??? — not yet discovered'
        )));
    }

    function fillJournalList(id, entries) {
        const list = document.getElementById(id);
        list.replaceChildren();
        entries.forEach((entry) => {
            const item = document.createElement('li');
            item.textContent = entry;
            list.append(item);
        });
    }

    function openJournal() {
        updateJournal();
        if (!journalDialog.open) journalDialog.showModal();
    }

    function signalRoomChoices() {
        mode = 'walk';
        exploreHud.hidden = false;
        hero.x = bellFixed ? 306 : 276;
        hero.y = 233;
        hero.facing = 'right';
        explorePrompt.textContent = bellFixed
            ? 'The gate is open. Talk to Vale or approach the tunnel door.'
            : 'Walk to Vale or the signal board. Press E to interact.';
        speak(
            bellFixed
                ? 'The signal lamp holds steady. Vale waits by the old gate.'
                : 'Three switches wait beneath the maintenance note. Vale, the cartographer, is sketching the wiring.',
            [],
            'STORY'
        );
        startFrameLoop();
    }

    function meetMorrow() {
        speak(
            'Morrow cups the lantern. “You are the first person to come down here on purpose in a long while. Are you lost, or just taking the scenic route?”',
            [
                { label: 'Ask who Morrow is waiting for', action: askAboutWaiting },
                { label: 'Tell Morrow about your delivery', action: shareDestination },
                { label: 'Read the old timetable', action: readTimetable },
                { label: 'Go to the signal room', action: enterBellRoom }
            ]
        );
    }

    function platformChoices() {
        mode = 'walk';
        exploreHud.hidden = false;
        explorePrompt.textContent = 'Walk around with arrows / WASD. Press E near someone to talk.';
        speak('The station clock has stopped between two minutes. Pip sorts lost things. Morrow waits beneath the only working lamp.', [], 'STORY');
        startFrameLoop();
    }

    function askAboutWaiting() {
        questionAsked = true;
        addTrust();
        saveProgress();
        speak(
            '“My sister used to ride the last train,” Morrow says. “She moved uphill when the line closed. I keep this light on in case someone else needs the way home.”',
            [
                { label: 'Thank Morrow for telling you', action: platformChoices },
                { label: 'Head for the signal room', action: enterBellRoom }
            ]
        );
    }

    function shareDestination() {
        destinationShared = true;
        addTrust();
        saveProgress();
        speak(
            'You show the sealed jar in your satchel. A small piece of morning glows inside. “A sunrise delivery,” Morrow whispers. “I did not know mornings could fit in a jar.”',
            [
                { label: 'Ask Morrow about the tunnel', action: platformChoices },
                { label: 'Head for the signal room', action: enterBellRoom }
            ],
            'THE NIGHT COURIER'
        );
    }

    function readTimetable() {
        platformClue = true;
        saveProgress();
        speak(
            'A maintenance note is pinned beneath the cancelled schedule: “Wake the lamp. Give the bell a voice. Unlatch the way.” Someone has circled PLATFORM 08 in gold ink.',
            [
                { label: 'Keep the note in mind', action: platformChoices },
                { label: 'Head for the signal room', action: enterBellRoom }
            ],
            'STORY'
        );
    }

    function enterBellRoom() {
        saveProgress('signal');
        setScene('bell');
        puzzlePanel.hidden = true;
        mode = 'walk';
        exploreHud.hidden = false;
        hero.x = 280;
        hero.y = 230;
        hero.facing = 'right';
        explorePrompt.textContent = 'Walk to Vale or the signal board. Press E to interact.';
        speak(
            'The signal room is small enough to warm with one breath. Vale is mapping the old switches while Morrow brushes dust from the lamp.',
            [],
            'STORY'
        );
        startFrameLoop();
    }

    function returnToPlatform() {
        saveProgress('platform');
        setScene('platform');
        platformChoices();
    }

    function beginPuzzle() {
        mode = 'story';
        exploreHud.hidden = true;
        choiceList.hidden = true;
        puzzlePanel.hidden = false;
        updatePuzzleLights();
        puzzleHint.textContent = platformClue
            ? 'The note is clear: wake the lamp, give the bell a voice, then unlatch the way.'
            : 'A scratched note says: wake the lamp, give the bell a voice, then unlatch the way.';
        saveProgress('signal');
        speak('The switches are labeled LAMP, BELL, and GATE. Morrow watches your hand.', []);
        puzzlePanel.hidden = false;
    }

    function resumeSignalExplore() {
        mode = 'walk';
        exploreHud.hidden = false;
        explorePrompt.textContent = 'Walk to Vale, the signal board, or the platform stairs.';
        speak(bellFixed
            ? 'The gate is open. Vale waits beside the tunnel entrance.'
            : 'Vale returns to the map. The signal board waits in the center of the room.', [], 'STORY');
        startFrameLoop();
    }

    function talkToPip() {
        mode = 'story';
        exploreHud.hidden = true;
        playChime(440);
        speak(
            pipMet
                ? 'Pip pats the little ticket box. “It is less lonely when someone knows what the things are for.”'
                : 'Pip, a small station mouse with an enormous keyring, is sorting the things travelers left behind. “I keep the lost things company until their people come back.”',
            [
                ...(!pipTicket ? [{ label: 'Ask about the ticket marked RETURN', action: givePipTicket }] : []),
                { label: 'Ask about the station', action: pipStationStory },
                { label: 'Let Pip get back to work', action: platformChoices }
            ],
            'PIP'
        );
        pipMet = true;
        updateStatus();
        saveProgress();
    }

    function givePipTicket() {
        pipTicket = true;
        stubsFound = Math.min(3, stubsFound + 1);
        addTrust();
        saveProgress();
        updateJournal();
        speak(
            '“This one has been waiting longer than I have,” Pip says, placing the stub in your hand. “Maybe it is waiting for the person, not the train.”',
            [{ label: 'Keep the ticket safe', action: platformChoices }],
            'PIP'
        );
    }

    function pipStationStory() {
        speak(
            '“The trains stopped before I was born,” Pip says. “But people still leave things here. I think the station is good at keeping promises.”',
            [{ label: 'Thank Pip', action: platformChoices }],
            'PIP'
        );
    }

    function talkToVale() {
        mode = 'story';
        exploreHud.hidden = true;
        playChime(392);
        speak(
            valeMet
                ? 'Vale traces the rail line on a paper map. “The old route still exists, even if nobody is running it.”'
                : 'Vale, a retired cartographer, has drawn the station from memory. “The map is not wrong,” they say. “The city just grew around it.”',
            [
                { label: valeMet ? 'Ask Vale to check the signal' : 'Ask about the closed line', action: hearValeStory },
                { label: 'Try the signal board', action: beginPuzzle },
                { label: 'Return to the platform stairs', action: returnToPlatform }
            ],
            'VALE'
        );
    }

    function hearValeStory() {
        if (!valeMet) {
            valeMet = true;
            addTrust();
            saveProgress('signal');
        }
        speak(
            'Vale unfolds the map. “The bell used to call the last train home. Wake the lamp first, ring the bell second, then open the gate. That order is older than the station.”',
            [
                { label: 'Try the signal board', action: beginPuzzle },
                { label: 'Thank Vale and look around', action: resumeSignalExplore }
            ],
            'VALE'
        );
    }

    function interactNearest() {
        if (mode !== 'walk') return;
        let targets = [];
        if (scene === 'platform') {
            targets = [
                { x: characters.pip.x, y: characters.pip.y, action: talkToPip, label: 'Pip' },
                { x: 452, y: 242, action: meetMorrow, label: 'Morrow' }
            ];
        } else if (scene === 'bell') {
            targets = [
                { x: characters.vale.x, y: characters.vale.y, action: talkToVale, label: 'Vale' },
                { x: 384, y: 198, action: beginPuzzle, label: 'the signal board' },
                { x: 111, y: 226, action: returnToPlatform, label: 'the platform stairs' },
                ...(bellFixed ? [{ x: 659, y: 226, action: enterTunnel, label: 'the tunnel gate' }] : [])
            ];
        }

        const nearest = targets
            .map((target) => ({ ...target, distance: Math.hypot(target.x - hero.x, target.y - hero.y) }))
            .sort((a, b) => a.distance - b.distance)[0];
        if (!nearest || nearest.distance > 58) {
            playChime(196);
            explorePrompt.textContent = 'No one is close enough to hear you. Walk nearer and try E again.';
            return;
        }
        mode = 'story';
        exploreHud.hidden = true;
        keys.clear();
        nearest.action();
    }

    function startFrameLoop() {
        if (frameId) window.cancelAnimationFrame(frameId);
        lastFrame = performance.now();
        frameId = window.requestAnimationFrame(frame);
    }

    function updatePuzzleLights() {
        puzzleLights.forEach((light, index) => {
            light.classList.toggle('lit', index < puzzleProgress);
        });
    }

    function pressSwitch(name) {
        if (mode !== 'story' || bellFixed) return;
        if (name !== switchSequence[puzzleProgress]) {
            puzzleProgress = 0;
            updatePuzzleLights();
            puzzleHint.textContent = 'The switches click back to rest. Try the sequence again: lamp, bell, gate.';
            saveProgress('signal');
            playChime(196);
            return;
        }

        puzzleProgress += 1;
        updatePuzzleLights();
        saveProgress('signal');
        playChime([293.66, 369.99, 440][puzzleProgress - 1]);
        if (puzzleProgress === switchSequence.length) {
            bellFixed = true;
            addTrust();
            stubsFound = Math.min(3, stubsFound + 1);
            saveProgress('tunnel');
            updateStatus();
            puzzlePanel.hidden = true;
            speak(
                'The lamp warms. The bell rings once, then again, and the gate unlocks. A ticket slips from the switchboard: one passenger, return journey.',
                [{ label: 'Open the flooded tunnel', action: enterTunnel }],
                'STORY'
            );
        }
    }

    function enterTunnel() {
        setScene('tunnel');
        mode = 'runner';
        exploreHud.hidden = true;
        runnerTimeLeft = 14;
        runnerElapsed = 0;
        hazardTimer = 0.35;
        stubTimer = 1.4;
        invulnerable = 0;
        focus = Math.max(focus, 2);
        updateStatus();
        saveProgress('tunnel');
        courier.x = canvasWidth / 2;
        courier.y = runBounds.bottom - 22;
        hazards.length = 0;
        ticketStubs.length = 0;
        keys.clear();
        choiceList.hidden = true;
        puzzlePanel.hidden = true;
        runnerHud.hidden = false;
        document.getElementById('runner-message').textContent = 'Keep moving. Catch the gold ticket stubs.';
        document.getElementById('pause-button').textContent = 'Pause';
        speak('The tunnel is flooded to the ankles. Morrow stays close, lantern held high. The old signal begins to flicker.', []);
        lastFrame = performance.now();
        frameId = window.requestAnimationFrame(frame);
        drawScene();
    }

    function spawnHazard() {
        const lane = 98 + Math.random() * (canvasWidth - 196);
        hazards.push({
            x: lane,
            y: runBounds.top - 8,
            vx: (Math.random() - 0.5) * 55,
            vy: 118 + Math.min(runnerElapsed * 3, 55),
            size: 8 + Math.random() * 5,
            angle: Math.random() * Math.PI
        });
    }

    function spawnTicket() {
        ticketStubs.push({
            x: runBounds.left + 28 + Math.random() * (runBounds.right - runBounds.left - 56),
            y: runBounds.top + 34 + Math.random() * (runBounds.bottom - runBounds.top - 68),
            vx: (Math.random() - 0.5) * 18,
            vy: (Math.random() - 0.5) * 18,
            angle: Math.random() * Math.PI
        });
    }

    function moveCourier(delta) {
        const horizontal = Number(keys.has('ArrowRight') || keys.has('d'))
            - Number(keys.has('ArrowLeft') || keys.has('a'));
        const vertical = Number(keys.has('ArrowDown') || keys.has('s'))
            - Number(keys.has('ArrowUp') || keys.has('w'));
        const magnitude = Math.hypot(horizontal, vertical) || 1;
        courier.x += horizontal / magnitude * courier.speed * delta;
        courier.y += vertical / magnitude * courier.speed * delta;
        courier.x = Math.max(runBounds.left + 12, Math.min(runBounds.right - 12, courier.x));
        courier.y = Math.max(runBounds.top + 12, Math.min(runBounds.bottom - 12, courier.y));
    }

    function updateRunner(delta) {
        runnerElapsed += delta;
        runnerTimeLeft = Math.max(0, 14 - runnerElapsed);
        hazardTimer -= delta;
        stubTimer -= delta;
        invulnerable = Math.max(0, invulnerable - delta);
        if (hazardTimer <= 0) {
            spawnHazard();
            hazardTimer = 0.62;
        }
        if (stubTimer <= 0 && stubsFound < 3) {
            spawnTicket();
            stubTimer = 3.2;
        }
        moveCourier(delta);

        for (let index = hazards.length - 1; index >= 0; index -= 1) {
            const hazard = hazards[index];
            hazard.x += hazard.vx * delta;
            hazard.y += hazard.vy * delta;
            hazard.angle += delta * 2;
            if (hazard.y > runBounds.bottom + 14) {
                hazards.splice(index, 1);
                continue;
            }
            if (invulnerable <= 0 && Math.hypot(hazard.x - courier.x, hazard.y - courier.y) < hazard.size / 2 + courier.radius) {
                hazards.splice(index, 1);
                focus = Math.max(0, focus - 1);
                invulnerable = 1;
                updateStatus();
                saveProgress('tunnel');
                document.getElementById('runner-message').textContent = focus > 0
                    ? 'A static spark catches your sleeve. Keep your footing.'
                    : 'The lantern light flickers out of reach.';
                playChime(138);
                if (focus === 0) {
                    loseTunnel();
                    return;
                }
            }
        }

        for (let index = ticketStubs.length - 1; index >= 0; index -= 1) {
            const ticket = ticketStubs[index];
            ticket.x += ticket.vx * delta;
            ticket.y += ticket.vy * delta;
            ticket.angle += delta;
            if (Math.hypot(ticket.x - courier.x, ticket.y - courier.y) < 17) {
                ticketStubs.splice(index, 1);
                stubsFound = Math.min(3, stubsFound + 1);
                updateStatus();
                saveProgress('tunnel');
                document.getElementById('runner-message').textContent = [
                    'Stub found: PLATFORM 08.',
                    'Stub found: ONE PASSENGER.',
                    'Stub found: RETURN JOURNEY.'
                ][stubsFound - 1];
                playChime(523.25);
            }
        }

        runnerTime.textContent = String(Math.ceil(runnerTimeLeft));
        if (runnerElapsed >= 14) finishTunnel();
    }

    function frame(timestamp) {
        if (mode !== 'runner' && mode !== 'walk') return;
        const delta = Math.min((timestamp - lastFrame) / 1000, 0.05);
        lastFrame = timestamp;
        if (mode === 'runner') updateRunner(delta);
        else updateWalk(delta);
        animationClock += delta;
        drawScene();
        if (mode === 'runner' || mode === 'walk') frameId = window.requestAnimationFrame(frame);
    }

    function updateWalk(delta) {
        const horizontal = Number(keys.has('ArrowRight') || keys.has('d'))
            - Number(keys.has('ArrowLeft') || keys.has('a'));
        const vertical = Number(keys.has('ArrowDown') || keys.has('s'))
            - Number(keys.has('ArrowUp') || keys.has('w'));
        const moving = horizontal !== 0 || vertical !== 0;
        hero.walking = moving;
        if (moving) {
            const magnitude = Math.hypot(horizontal, vertical);
            hero.x += horizontal / magnitude * hero.speed * delta;
            hero.y += vertical / magnitude * hero.speed * delta;
            hero.facing = Math.abs(horizontal) > Math.abs(vertical)
                ? (horizontal > 0 ? 'right' : 'left')
                : (vertical > 0 ? 'down' : 'up');
            const bounds = scene === 'bell'
                ? { left: 103, right: 666, top: 126, bottom: 258 }
                : { left: 76, right: 692, top: 150, bottom: 259 };
            hero.x = Math.max(bounds.left, Math.min(bounds.right, hero.x));
            hero.y = Math.max(bounds.top, Math.min(bounds.bottom, hero.y));
            stepClock -= delta;
            if (stepClock <= 0) {
                playChime(168);
                stepClock = 0.32;
            }
        } else {
            stepClock = 0;
        }

        const targets = scene === 'platform'
            ? [
                { x: characters.pip.x, y: characters.pip.y, label: 'Pip' },
                { x: 452, y: 242, label: 'Morrow' }
            ]
            : [
                { x: characters.vale.x, y: characters.vale.y, label: 'Vale' },
                { x: 384, y: 198, label: 'the signal board' },
                { x: 111, y: 226, label: 'the platform stairs' },
                ...(bellFixed ? [{ x: 659, y: 226, label: 'the tunnel gate' }] : [])
            ];
        const near = targets
            .map((target) => ({ ...target, distance: Math.hypot(target.x - hero.x, target.y - hero.y) }))
            .sort((a, b) => a.distance - b.distance)[0];
        explorePrompt.textContent = near && near.distance < 58
            ? `Press E to interact with ${near.label}.`
            : 'Walk with arrows / WASD. Press E near a person or object.';
    }

    function finishTunnel() {
        window.cancelAnimationFrame(frameId);
        mode = 'story';
        runnerHud.hidden = true;
        keys.clear();
        setScene('exit');
        const found = stubsFound >= 3
            ? 'The three recovered tickets list one passenger, one lantern, and one return journey. Morrow reads the last line without speaking.'
            : 'The tunnel gate opens onto the hillside road. Morrow’s lantern turns the black water gold.';
        saveProgress('tunnel');
        speak(found, [
            { label: 'Ask Morrow to come uphill with you', action: () => endStory('guide') },
            ...(trust >= 2 ? [{ label: 'Stay and relight the platform together', action: () => endStory('stay') }] : []),
            { label: 'Leave a note for the next traveler', action: () => endStory('note') }
        ], 'STORY');
        drawScene();
    }

    function endStory(ending) {
        mode = 'ending';
        lastEnding = ending;
        if (!endingHistory.includes(ending)) endingHistory.push(ending);
        saveProgress('ending');
        displayEnding(ending);
    }

    function displayEnding(ending) {
        mode = 'ending';
        choiceList.hidden = true;
        endingCard.hidden = false;
        const endings = {
            guide: {
                title: 'Two lights on the road',
                copy: 'Morrow tucks the lantern under one arm and follows your steps uphill. Your jar of dawn reaches the town before sunrise. For once, the light is going somewhere.'
            },
            stay: {
                title: 'A station for whoever comes',
                copy: stubsFound >= 3
                    ? 'You and Morrow relight every platform lamp. The three old tickets go beneath the timetable, ready for whoever needs a way home.'
                    : 'You and Morrow relight the lamps one at a time. No train arrives, but the platform is no longer waiting in the dark.'
            },
            note: {
                title: 'A message under the bell',
                copy: 'You leave a note beneath the signal bell: “Someone came through. The light helped.” Morrow reads it twice and pins it beside the old timetable.'
            }
        };
        document.getElementById('ending-title').textContent = endings[ending].title;
        document.getElementById('ending-copy').textContent = endings[ending].copy;
        speak(
            ending === 'guide'
                ? 'Morrow: “I know a dry path. It is not the shortest, but it has very good stars.”'
                : ending === 'stay'
                    ? 'Morrow: “I thought keeping watch was a one-moth job.”'
                    : 'Morrow: “I will keep it safe. Someone always comes back for a note.”',
            [],
            'MORROW'
        );
    }

    function loseTunnel() {
        window.cancelAnimationFrame(frameId);
        mode = 'gameover';
        runnerHud.hidden = true;
        gameoverCard.hidden = false;
        keys.clear();
    }

    function pauseRunner() {
        if (mode === 'runner') {
            mode = 'paused';
            keys.clear();
            window.cancelAnimationFrame(frameId);
            pauseCurtain.hidden = false;
            document.getElementById('pause-button').textContent = 'Resume';
        } else if (mode === 'paused') {
            mode = 'runner';
            pauseCurtain.hidden = true;
            document.getElementById('pause-button').textContent = 'Pause';
            lastFrame = performance.now();
            frameId = window.requestAnimationFrame(frame);
        }
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        if (scene === 'bell') drawSignalRoom();
        else if (scene === 'tunnel') drawTunnel();
        else drawPlatform();
        drawMorrow();
        if (scene === 'platform') drawPip();
        if (scene === 'bell') drawVale();
        if (mode === 'walk') drawHero();
        if (mode === 'runner' || mode === 'paused' || mode === 'gameover') drawRunnerScene();
    }

    function drawPlatform() {
        ctx.fillStyle = '#12202c';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        drawWindows('#1c3041', 18, 30);
        ctx.fillStyle = '#26394a';
        ctx.fillRect(0, 267, canvasWidth, 32);
        ctx.fillStyle = '#b5965f';
        ctx.fillRect(0, 265, canvasWidth, 3);
        ctx.fillStyle = '#384857';
        ctx.fillRect(0, 299, canvasWidth, 59);
        ctx.fillStyle = '#101923';
        ctx.fillRect(0, 358, canvasWidth, 74);
        ctx.fillStyle = '#283b49';
        ctx.fillRect(0, 370, canvasWidth, 4);
        for (let x = 14; x < canvasWidth; x += 42) {
            ctx.fillStyle = '#465969';
            ctx.fillRect(x, 386, 24, 3);
        }
        ctx.fillStyle = '#e2bc70';
        ctx.fillRect(620, 123, 5, 147);
        ctx.fillStyle = '#f2d594';
        ctx.fillRect(605, 113, 35, 38);
        ctx.fillStyle = '#9bdae2';
        ctx.fillRect(612, 120, 21, 22);
        ctx.fillStyle = '#263545';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('08', 622, 136);
        ctx.fillStyle = '#182a3a';
        ctx.fillRect(73, 48, 132, 66);
        ctx.strokeStyle = '#d1bc8a';
        ctx.strokeRect(73, 48, 132, 66);
        ctx.fillStyle = '#f0d99f';
        ctx.font = '9px monospace';
        ctx.textAlign = 'left';
        ctx.fillText('MERIDIAN', 85, 68);
        ctx.fillText('LAST TRAIN', 85, 86);
        ctx.fillStyle = '#e28879';
        ctx.fillText('CANCELLED', 85, 101);
    }

    function drawWindows(color, top, height) {
        for (let x = 20; x < canvasWidth; x += 76) {
            ctx.fillStyle = color;
            ctx.fillRect(x, top, 48, height);
            ctx.fillStyle = '#314253';
            ctx.fillRect(x + 21, top, 3, height);
            ctx.fillRect(x, top + Math.floor(height / 2), 48, 3);
            ctx.fillStyle = '#f4ce81';
            ctx.fillRect(x + 9, top + 8, 3, 3);
        }
    }

    function drawSignalRoom() {
        ctx.fillStyle = '#192632';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#344553';
        ctx.fillRect(0, 0, canvasWidth, 31);
        ctx.fillStyle = '#293c4b';
        ctx.fillRect(0, 264, canvasWidth, 168);
        for (let x = 0; x < canvasWidth; x += 48) {
            ctx.fillStyle = x % 96 === 0 ? '#3d5260' : '#263946';
            ctx.fillRect(x, 31, 4, 233);
        }
        ctx.fillStyle = '#0d1822';
        ctx.fillRect(125, 64, 518, 171);
        ctx.strokeStyle = '#738390';
        ctx.strokeRect(125, 64, 518, 171);
        ctx.fillStyle = '#e2c47f';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SIGNAL SEQUENCE', 384, 93);
        ['LAMP', 'BELL', 'GATE'].forEach((label, index) => {
            const x = 226 + index * 159;
            ctx.fillStyle = bellFixed ? '#91d8c6' : '#425462';
            ctx.fillRect(x, 140, 62, 53);
            ctx.fillStyle = '#dfe2d7';
            ctx.font = '9px monospace';
            ctx.fillText(label, x + 31, 212);
        });
        ctx.fillStyle = '#70808a';
        ctx.fillRect(163, 300, 439, 10);
    }

    function drawTunnel() {
        ctx.fillStyle = '#0e2029';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
        ctx.fillStyle = '#1a3740';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(170, 55);
        ctx.lineTo(170, 432);
        ctx.lineTo(0, 432);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(canvasWidth, 0);
        ctx.lineTo(598, 55);
        ctx.lineTo(598, 432);
        ctx.lineTo(canvasWidth, 432);
        ctx.fill();
        ctx.fillStyle = '#183d45';
        ctx.fillRect(165, 55, 438, 377);
        ctx.fillStyle = '#315f62';
        ctx.fillRect(165, 319, 438, 113);
        ctx.fillStyle = '#91d8c6';
        ctx.globalAlpha = .4;
        for (let y = 333; y < 425; y += 24) {
            const offset = Math.sin(runnerElapsed * 1.4 + y) * 12;
            ctx.fillRect(184 + offset, y, 122, 2);
            ctx.fillRect(387 - offset, y + 10, 156, 2);
        }
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#d7bd7d';
        ctx.fillRect(374, 28, 20, 7);
        ctx.fillStyle = '#f2d594';
        ctx.fillRect(379, 34, 10, 21);
    }

    function drawMorrow() {
        const size = 6;
        const startX = scene === 'bell' ? 510 : scene === 'tunnel' ? 267 : 398;
        const startY = scene === 'tunnel' ? 12 : 120;
        const float = Math.sin(animationClock * 3.2) * 1.8;
        const glow = .08 + (Math.sin(animationClock * 2.4) + 1) * .045;
        ctx.fillStyle = `rgba(242, 205, 132, ${glow})`;
        ctx.beginPath();
        ctx.ellipse(startX + 54, startY + 68 + float, 60, 68, 0, 0, Math.PI * 2);
        ctx.fill();
        morrowSprite.forEach((row, y) => {
            [...row].forEach((pixel, x) => {
                if (colors[pixel]) {
                    ctx.fillStyle = colors[pixel];
                    ctx.fillRect(startX + x * size, Math.round(startY + y * size + float), size, size);
                }
            });
        });
        ctx.fillStyle = '#f2d594';
        ctx.fillRect(startX + 52, startY + 107, 17, 4);
        ctx.fillStyle = '#9ad9c8';
        ctx.fillRect(startX + 56, startY + 111, 9, 14);
        ctx.fillStyle = '#fff3cc';
        ctx.fillRect(startX + 59, startY + 115, 3, 6);
        const wing = Math.sin(animationClock * 12) > .25 ? 5 : 2;
        ctx.fillStyle = '#a4dcca';
        ctx.globalAlpha = .58;
        ctx.fillRect(startX + 11, startY + 20 + float, wing, 15);
        ctx.fillRect(startX + 112, startY + 20 + float, wing, 15);
        ctx.globalAlpha = 1;
    }

    function drawPixelSprite(sprite, palette, centerX, footY, cell, float = 0, facing = 'right') {
        const columns = Math.max(...sprite.map((row) => row.length));
        const startX = Math.round(centerX - columns * cell / 2);
        const startY = Math.round(footY - sprite.length * cell + float);
        ctx.save();
        if (facing === 'left') {
            ctx.translate(centerX * 2, 0);
            ctx.scale(-1, 1);
        }
        sprite.forEach((row, y) => {
            [...row].forEach((pixel, x) => {
                if (palette[pixel]) {
                    ctx.fillStyle = palette[pixel];
                    ctx.fillRect(startX + x * cell, startY + y * cell, cell, cell);
                }
            });
        });
        ctx.restore();
    }

    function drawPip() {
        const bob = Math.sin(animationClock * 2.4 + 1) * 1.5;
        drawPixelSprite(characters.pip.sprite, characters.pip.colors, characters.pip.x, characters.pip.y, 5, bob);
        ctx.fillStyle = '#e5cda9';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PIP', characters.pip.x, characters.pip.y + 13);
        ctx.textAlign = 'start';
    }

    function drawVale() {
        const bob = Math.sin(animationClock * 1.7 + 2) * 1.2;
        drawPixelSprite(characters.vale.sprite, characters.vale.colors, characters.vale.x, characters.vale.y, 5, bob);
        ctx.fillStyle = '#d7e0e3';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('VALE', characters.vale.x, characters.vale.y + 13);
        ctx.textAlign = 'start';
    }

    function drawHero() {
        const walkBob = hero.walking ? Math.sin(animationClock * 18) * 2 : Math.sin(animationClock * 2) * .8;
        const armSwing = hero.walking && Math.floor(animationClock * 9) % 2 === 0;
        const sprite = armSwing
            ? [...courierSprite.slice(0, 10), '...ccycc....', '....cc.cc...', '...cc...cc..', '..cc.....cc.']
            : courierSprite;
        drawPixelSprite(sprite, courierColors, hero.x, hero.y, 5, walkBob, hero.facing);
        ctx.fillStyle = '#d9e2dd';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('YOU', hero.x, hero.y + 14);
        ctx.textAlign = 'start';
    }

    function drawRunnerScene() {
        ctx.strokeStyle = '#9ad9c8';
        ctx.lineWidth = 2;
        ctx.strokeRect(runBounds.left, runBounds.top, runBounds.right - runBounds.left, runBounds.bottom - runBounds.top);
        ctx.fillStyle = '#0b1821';
        ctx.fillRect(runBounds.left + 2, runBounds.top + 2, runBounds.right - runBounds.left - 4, runBounds.bottom - runBounds.top - 4);
        ctx.strokeStyle = '#1d333e';
        ctx.lineWidth = 1;
        for (let x = runBounds.left + 28; x < runBounds.right; x += 56) {
            ctx.beginPath();
            ctx.moveTo(x, runBounds.top);
            ctx.lineTo(x, runBounds.bottom);
            ctx.stroke();
        }
        hazards.forEach((hazard) => {
            ctx.save();
            ctx.translate(hazard.x, hazard.y);
            ctx.rotate(hazard.angle);
            ctx.fillStyle = '#f5e6c6';
            ctx.fillRect(-hazard.size / 2, -hazard.size / 2, hazard.size, hazard.size);
            ctx.restore();
        });
        ticketStubs.forEach((ticket) => {
            ctx.save();
            ctx.translate(ticket.x, ticket.y);
            ctx.rotate(ticket.angle);
            ctx.fillStyle = '#f1c878';
            ctx.fillRect(-6, -4, 12, 8);
            ctx.fillStyle = '#9f7842';
            ctx.fillRect(-1, -3, 2, 6);
            ctx.restore();
        });
        if (mode === 'runner' || mode === 'paused' || mode === 'gameover') drawCourier();
        ctx.strokeStyle = '#9ad9c8';
        ctx.lineWidth = 2;
        ctx.strokeRect(runBounds.left, runBounds.top, runBounds.right - runBounds.left, runBounds.bottom - runBounds.top);
    }

    function drawCourier() {
        if (invulnerable > 0 && Math.floor(invulnerable * 12) % 2 === 0) return;
        ctx.fillStyle = '#91d8c6';
        ctx.shadowColor = '#91d8c6';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(courier.x, courier.y - 9);
        ctx.lineTo(courier.x + 8, courier.y);
        ctx.lineTo(courier.x, courier.y + 9);
        ctx.lineTo(courier.x - 8, courier.y);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#10212b';
        ctx.fillRect(courier.x - 1, courier.y - 1, 2, 2);
    }

    function playChime(frequency) {
        if (!audioContext || !soundOn) return;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = 'triangle';
        oscillator.frequency.value = frequency;
        gain.gain.setValueAtTime(.0001, audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(.035, audioContext.currentTime + .018);
        gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .24);
        oscillator.connect(gain);
        gain.connect(ambienceGain);
        oscillator.start();
        oscillator.stop(audioContext.currentTime + .26);
    }

    function scheduleTone(frequency, start, duration, waveform, volume) {
        if (!frequency) return;
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = waveform;
        oscillator.frequency.setValueAtTime(frequency, start);
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + .025);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        oscillator.connect(gain);
        gain.connect(ambienceGain);
        oscillator.start(start);
        oscillator.stop(start + duration + .02);
    }

    function scheduleMusic() {
        if (!audioContext || !soundOn) return;
        const melody = musicThemes[musicScene] || musicThemes.platform;
        const bass = bassThemes[musicScene] || bassThemes.platform;
        while (nextMusicBeat < audioContext.currentTime + .16) {
            const step = musicStep % melody.length;
            scheduleTone(melody[step], nextMusicBeat, .19, 'square', .012);
            if (step % 4 === 0) {
                scheduleTone(bass[Math.floor(step / 4) % bass.length], nextMusicBeat, .42, 'triangle', .018);
            }
            musicStep += 1;
            nextMusicBeat += .24;
        }
    }

    function setMusicScene() {
        if (musicScene === scene) return;
        musicScene = scene;
        musicStep = 0;
        if (audioContext) nextMusicBeat = audioContext.currentTime + .04;
    }

    function toggleSound() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) {
            soundToggle.textContent = 'Sound unavailable';
            soundToggle.disabled = true;
            return;
        }
        if (!audioContext) {
            audioContext = new AudioContext();
            ambienceGain = audioContext.createGain();
            ambienceGain.gain.value = 0;
            ambienceGain.connect(audioContext.destination);
            nextMusicBeat = audioContext.currentTime + .04;
            window.setInterval(scheduleMusic, 40);
        }
        soundOn = !soundOn;
        if (audioContext.state === 'suspended' && soundOn) audioContext.resume();
        ambienceGain.gain.setTargetAtTime(soundOn ? .72 : 0, audioContext.currentTime, .12);
        if (soundOn) scheduleMusic();
        soundToggle.textContent = `Sound: ${soundOn ? 'on' : 'off'}`;
        soundToggle.setAttribute('aria-pressed', String(soundOn));
    }

    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('continue-game').addEventListener('click', continueGame);
    document.getElementById('new-game').addEventListener('click', () => {
        document.getElementById('new-game-dialog').showModal();
    });
    document.getElementById('cancel-new-game').addEventListener('click', () => {
        document.getElementById('new-game-dialog').close();
    });
    document.getElementById('confirm-new-game').addEventListener('click', () => {
        document.getElementById('new-game-dialog').close();
        startNewStory();
    });
    document.getElementById('resume-game').addEventListener('click', pauseRunner);
    document.getElementById('pause-button').addEventListener('click', pauseRunner);
    document.getElementById('retry-game').addEventListener('click', () => {
        focus = 4;
        enterTunnel();
    });
    document.getElementById('play-again').addEventListener('click', startGame);
    soundToggle.addEventListener('click', toggleSound);
    document.getElementById('journal-button').addEventListener('click', openJournal);
    document.getElementById('close-journal').addEventListener('click', () => journalDialog.close());
    document.getElementById('save-button').addEventListener('click', () => saveProgress());

    document.querySelectorAll('[data-switch]').forEach((button) => {
        button.addEventListener('click', () => pressSwitch(button.dataset.switch));
    });

    document.querySelectorAll('.touch-pad button').forEach((button) => {
        const direction = button.dataset.direction;
        const directionKeys = {
            up: 'ArrowUp',
            down: 'ArrowDown',
            left: 'ArrowLeft',
            right: 'ArrowRight'
        };
        button.addEventListener('pointerdown', (event) => {
            event.preventDefault();
            button.setPointerCapture(event.pointerId);
            keys.add(directionKeys[direction]);
        });
        for (const eventName of ['pointerup', 'pointercancel', 'lostpointercapture']) {
            button.addEventListener(eventName, () => keys.delete(directionKeys[direction]));
        }
    });

    document.addEventListener('keydown', (event) => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        if ((mode === 'story' || mode === 'walk') && typing && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            skipTyping();
            return;
        }
        if (mode === 'walk' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
        if (mode === 'walk' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
            keys.add(key);
        }
        if (mode === 'walk' && (key === 'e' || key === 'Enter' || event.key === ' ')) {
            if (!event.repeat) interactNearest();
            return;
        }
        if (mode === 'runner' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
        if (mode === 'runner' && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(key)) {
            keys.add(key);
        }
        if (mode === 'runner' && key === 'p') pauseRunner();
        if (mode === 'story' && key === 'j' && !journalDialog.open) openJournal();
        if (mode === 'story' && /^[1-4]$/.test(key)) {
            const choice = choiceList.querySelectorAll('button')[Number(key) - 1];
            if (choice) choice.click();
        }
    });
    document.addEventListener('keyup', (event) => {
        const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
        keys.delete(key);
    });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && mode === 'runner') pauseRunner();
    });

    updateStatus();
    const savedGame = readSave();
    if (savedGame) {
        applySave(savedGame);
        document.getElementById('start-game').hidden = true;
        document.getElementById('continue-game').hidden = false;
        document.getElementById('new-game').hidden = false;
        saveStatus.textContent = savedGame.savedAt
            ? `Last played ${new Date(savedGame.savedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}`
            : 'A saved night is waiting.';
    } else {
        document.getElementById('continue-game').hidden = true;
        document.getElementById('new-game').hidden = true;
        document.getElementById('start-game').hidden = false;
    }
})();
