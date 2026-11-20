const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'game.js'), 'utf8');

function createGame(storage = new Map(), random = () => 0.5) {
    const elements = new Map();
    const documentEvents = new Map();
    const timers = [];
    const frames = new Map();
    const context = new Proxy({}, {
        get: (_, property) => typeof property === 'string'
            ? property === 'createLinearGradient' || property === 'createRadialGradient'
                ? () => ({ addColorStop() {} })
                : () => {}
            : undefined,
        set: () => true
    });
    let frameId = 0;
    let now = 0;

    function element(id, dataset = {}) {
        const node = {
            id,
            dataset,
            hidden: false,
            disabled: false,
            open: false,
            textContent: '',
            innerHTML: '',
            className: '',
            children: [],
            handlers: {},
            classes: new Set(),
            classList: {
                toggle(name, enabled) {
                    if (enabled) node.classes.add(name);
                    else node.classes.delete(name);
                }
            },
            addEventListener(type, handler) {
                this.handlers[type] = handler;
            },
            replaceChildren() {
                this.children = [];
            },
            append(child) {
                this.children.push(child);
            },
            querySelectorAll() {
                return this.children;
            },
            setAttribute() {},
            blur() {},
            focus() {},
            setPointerCapture() {},
            showModal() {
                this.open = true;
            },
            close() {
                this.open = false;
            },
            getContext() {
                return context;
            }
        };
        elements.set(id, node);
        return node;
    }

    [
        'scene', 'title-screen', 'game-screen', 'scene-name', 'chapter-label',
        'dialogue', 'choice-list', 'puzzle-panel', 'puzzle-hint', 'runner-hud',
        'pause-curtain', 'ending-card', 'gameover-card', 'focus', 'trust', 'stubs',
        'runner-time', 'sound-toggle', 'journal-dialog', 'save-status',
        'save-feedback', 'start-game', 'continue-game', 'new-game', 'new-game-dialog',
        'cancel-new-game', 'confirm-new-game', 'resume-game', 'pause-button',
        'retry-game', 'play-again', 'runner-message', 'ending-title', 'ending-copy',
        'journal-button', 'save-button', 'close-journal', 'journal-objective',
        'journal-inventory', 'journal-memories', 'journal-endings', 'speaker',
        'speaker-role', 'speaker-avatar', 'turn-hint', 'game-over-copy',
        'action-feedback', 'attack-title', 'attack-clock',
        'explore-hud', 'explore-prompt', 'interact-button', 'party-members'
    ].forEach((id) => element(id));
    elements.get('scene').width = 768;
    elements.get('scene').height = 432;

    const lights = [0, 1, 2].map((index) => element(`light-${index}`));
    const switches = ['lamp', 'bell', 'gate'].map((name, index) => element(`switch-${index}`, { switch: name }));
    const directions = ['up', 'down', 'left', 'right'].map((name, index) => element(`direction-${index}`, { direction: name }));

    const document = {
        hidden: false,
        getElementById: (id) => elements.get(id),
        createElement: (tag) => element(`created-${tag}-${Math.random()}`),
        querySelectorAll(selector) {
            if (selector === '#puzzle-lights span') return lights;
            if (selector === '[data-switch]') return switches;
            if (selector === '.touch-pad button') return directions;
            return [];
        },
        addEventListener(type, handler) {
            documentEvents.set(type, handler);
        }
    };

    const window = {
        localStorage: {
            getItem(key) {
                return storage.has(key) ? storage.get(key) : null;
            },
            setItem(key, value) {
                storage.set(key, value);
            }
        },
        requestAnimationFrame(callback) {
            const id = ++frameId;
            frames.set(id, callback);
            return id;
        },
        cancelAnimationFrame(id) {
            frames.delete(id);
        },
        setTimeout(callback) {
            timers.push(callback);
            return timers.length;
        },
        setInterval() {
            return 1;
        },
        clearTimeout() {
            timers.length = 0;
        }
    };
    const math = Object.create(Math);
    math.random = random;

    vm.runInNewContext(source, {
        document,
        window,
        Math: math,
        performance: { now: () => now },
        console
    });

    function flushTypewriter() {
        while (timers.length) timers.shift()();
    }

    function click(node) {
        assert.equal(typeof node.handlers.click, 'function', `no click handler for ${node.id}`);
        node.handlers.click();
        flushTypewriter();
    }

    function choose(index) {
        const choice = elements.get('choice-list').children[index];
        assert.ok(choice, `choice ${index + 1} is not available`);
        click(choice);
    }

    function key(type, value) {
        documentEvents.get(type)({ key: value, preventDefault() {} });
        flushTypewriter();
    }

    function advance(seconds) {
        const end = now + seconds * 1000;
        while (now < end && frames.size) {
            now = Math.min(now + 40, end);
            const callbacks = [...frames.values()];
            frames.clear();
            callbacks.forEach((callback) => callback(now));
        }
        flushTypewriter();
    }

    return {
        elements,
        lights,
        switches,
        click,
        choose,
        key,
        advance,
        storage
    };
}

function progressToSignal(game, explore = false) {
    game.click(game.elements.get('start-game'));
    interactMorrow(game);
    if (explore) {
        game.choose(0);
        game.choose(0);
        interactMorrow(game);
        game.choose(0);
        game.choose(0);
        interactMorrow(game);
        game.choose(0);
        game.choose(0);
        interactMorrow(game);
        game.choose(0);
    } else {
        game.choose(3);
    }
    interactBoard(game);
}

function interactMorrow(game) {
    game.key('keydown', 'e');
    game.key('keyup', 'e');
    if (game.elements.get('choice-list').children.length) return;
    game.key('keydown', 'ArrowRight');
    game.advance(0.35);
    game.key('keyup', 'ArrowRight');
    game.key('keydown', 'e');
    game.key('keyup', 'e');
}

function interactPip(game) {
    game.key('keydown', 'ArrowLeft');
    game.advance(0.85);
    game.key('keyup', 'ArrowLeft');
    game.key('keydown', 'e');
    game.key('keyup', 'e');
}

function interactPipWithButton(game) {
    game.key('keydown', 'ArrowLeft');
    game.advance(0.85);
    game.key('keyup', 'ArrowLeft');
    assert.equal(game.elements.get('interact-button').disabled, false);
    game.click(game.elements.get('interact-button'));
}

function interactBoard(game) {
    game.key('keydown', 'ArrowRight');
    game.advance(0.7);
    game.key('keyup', 'ArrowRight');
    game.key('keydown', 'ArrowUp');
    game.advance(0.2);
    game.key('keyup', 'ArrowUp');
    game.key('keydown', 'e');
    game.key('keyup', 'e');
}

function solveSignal(game) {
    game.click(game.switches[0]);
    game.click(game.switches[1]);
    game.click(game.switches[2]);
    game.choose(0);
}

test('story saves, resumes from a checkpoint, and journals discovered details', () => {
    const storage = new Map();
    let game = createGame(storage);
    game.click(game.elements.get('start-game'));
    game.key('keydown', 'Enter');
    assert.equal(game.elements.get('choice-list').hidden, true);
    assert.match(game.elements.get('dialogue').textContent, /Morrow tends the lantern/);
    interactMorrow(game);
    game.choose(0);
    game.choose(0);
    game.click(game.elements.get('save-button'));

    game = createGame(storage);
    assert.equal(game.elements.get('continue-game').hidden, false);
    game.click(game.elements.get('continue-game'));
    assert.match(game.elements.get('trust').textContent, /◆/);
    assert.equal(game.elements.get('scene-name').textContent, 'PLATFORM 08');

    game.click(game.elements.get('journal-button'));
    assert.equal(game.elements.get('journal-dialog').open, true);
    assert.match(game.elements.get('journal-memories').children.map((item) => item.textContent).join(' '), /way home/);
    game.click(game.elements.get('close-journal'));
    assert.equal(game.elements.get('journal-dialog').open, false);
});

test('new-story confirmation can be cancelled without replacing the save', () => {
    const storage = new Map();
    let game = createGame(storage);
    game.click(game.elements.get('start-game'));
    game.key('keydown', 'Enter');
    interactMorrow(game);
    game.choose(0);
    game.click(game.elements.get('save-button'));
    const saved = storage.get('morrow-last-light-save-v1');

    game = createGame(storage);
    game.click(game.elements.get('new-game'));
    assert.equal(game.elements.get('new-game-dialog').open, true);
    game.click(game.elements.get('cancel-new-game'));
    assert.equal(game.elements.get('new-game-dialog').open, false);
    assert.equal(storage.get('morrow-last-light-save-v1'), saved);
});

test('Pip can be met on the platform and joins the journal with a ticket', () => {
    const storage = new Map();
    let game = createGame(storage);
    game.click(game.elements.get('start-game'));
    interactPip(game);
    assert.equal(game.elements.get('speaker').textContent, 'PIP');
    game.choose(0);
    assert.match(game.elements.get('party-members').textContent, /PIP/);
    assert.match(game.elements.get('stubs').textContent, /1/);

    game.click(game.elements.get('save-button'));
    game = createGame(storage);
    game.click(game.elements.get('continue-game'));
    assert.match(game.elements.get('party-members').textContent, /PIP/);
    game.click(game.elements.get('journal-button'));
    assert.match(game.elements.get('journal-inventory').children.map((item) => item.textContent).join(' '), /Pip’s return ticket/);
});

test('nearby characters can be interacted with using the on-screen action button', () => {
    const game = createGame();
    game.click(game.elements.get('start-game'));
    interactPipWithButton(game);
    assert.equal(game.elements.get('speaker').textContent, 'PIP');
    assert.equal(game.elements.get('interact-button').disabled, true);
});

test('Vale offers a second character route through the signal room', () => {
    const game = createGame();
    game.click(game.elements.get('start-game'));
    interactMorrow(game);
    game.choose(3);
    game.key('keydown', 'ArrowRight');
    game.advance(1.7);
    game.key('keyup', 'ArrowRight');
    game.key('keydown', 'e');
    game.key('keyup', 'e');
    assert.equal(game.elements.get('speaker').textContent, 'VALE');
    game.choose(0);
    assert.match(game.elements.get('trust').textContent, /◆/);
    game.choose(1);
    assert.match(game.elements.get('party-members').textContent, /VALE/);
});

test('Pip’s return ticket unlocks an ending that survives continue', () => {
    const storage = new Map();
    let game = createGame(storage);
    game.click(game.elements.get('start-game'));
    interactPip(game);
    game.choose(0);
    game.choose(0);

    game.key('keydown', 'ArrowRight');
    game.advance(1.5);
    game.key('keyup', 'ArrowRight');
    game.key('keydown', 'e');
    game.key('keyup', 'e');
    assert.equal(game.elements.get('speaker').textContent, 'MORROW');
    game.choose(0);
    game.choose(1);
    interactBoard(game);
    solveSignal(game);
    game.key('keydown', 'ArrowRight');
    game.advance(14.5);
    game.key('keyup', 'ArrowRight');
    game.choose(3);
    assert.equal(game.elements.get('ending-title').textContent, 'A ticket home');

    game = createGame(storage);
    game.click(game.elements.get('continue-game'));
    assert.equal(game.elements.get('ending-title').textContent, 'A ticket home');
    game.click(game.elements.get('journal-button'));
    assert.match(game.elements.get('journal-endings').children.map((item) => item.textContent).join(' '), /A ticket home/);
});

test('switch sequence gates the tunnel and a discovered ending survives replay', () => {
    const game = createGame();
    progressToSignal(game, true);
    game.click(game.switches[1]);
    assert.match(game.elements.get('puzzle-hint').textContent, /sequence again/);
    game.click(game.switches[0]);
    game.click(game.elements.get('save-button'));

    const restored = createGame(game.storage);
    restored.click(restored.elements.get('continue-game'));
    interactBoard(restored);
    assert.equal(restored.lights[0].classes.has('lit'), true);
    restored.click(restored.switches[1]);
    restored.click(restored.switches[2]);
    restored.choose(0);
    restored.click(restored.elements.get('pause-button'));
    assert.equal(restored.elements.get('pause-curtain').hidden, false);
    restored.click(restored.elements.get('resume-game'));
    restored.key('keydown', 'ArrowRight');
    restored.advance(14.5);
    restored.key('keyup', 'ArrowRight');
    assert.equal(restored.elements.get('scene-name').textContent, 'THE HILLSIDE ROAD');
    restored.choose(1);
    assert.equal(restored.elements.get('ending-title').textContent, 'A station for whoever comes');

    restored.click(restored.elements.get('play-again'));
    assert.match(restored.elements.get('ending-title').textContent, /A station for whoever comes/);
    restored.click(restored.elements.get('journal-button'));
    assert.match(restored.elements.get('journal-endings').children.map((item) => item.textContent).join(' '), /A station for whoever comes/);
});

test('tunnel failure offers a checkpoint retry with restored focus', () => {
    const game = createGame();
    progressToSignal(game);
    solveSignal(game);
    game.advance(14.5);
    assert.equal(game.elements.get('gameover-card').hidden, false);
    game.click(game.elements.get('retry-game'));
    assert.equal(game.elements.get('runner-hud').hidden, false);
    assert.match(game.elements.get('focus').textContent, /● ● ● ●/);
});
