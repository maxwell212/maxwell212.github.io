// Game State
const gameState = {
    resources: {
        wood: 0,
        brick: 0,
        wheat: 0,
        sheep: 0,
        ore: 0
    },
    developmentCards: [],
    tiles: [],
    developmentDeck: []
};

// Resource and tile configurations
const RESOURCE_TYPES = {
    WOOD: { name: 'wood', icon: '🌲', color: '#2d5016' },
    BRICK: { name: 'brick', icon: '🧱', color: '#c1440e' },
    WHEAT: { name: 'wheat', icon: '🌾', color: '#f4c430' },
    SHEEP: { name: 'sheep', icon: '🐑', color: '#90ee90' },
    ORE: { name: 'ore', icon: '⛰️', color: '#808080' },
    DESERT: { name: 'desert', icon: '🏜️', color: '#daa520' }
};

// Development card types
const DEV_CARD_TYPES = {
    KNIGHT: { name: 'Knight', count: 14, description: 'Move the robber' },
    VICTORY_POINT: { name: 'Victory Point', count: 5, description: '+1 Victory Point' },
    ROAD_BUILDING: { name: 'Road Building', count: 2, description: 'Build 2 free roads' },
    YEAR_OF_PLENTY: { name: 'Year of Plenty', count: 2, description: 'Take 2 resources' },
    MONOPOLY: { name: 'Monopoly', count: 2, description: 'Take all of one resource' }
};

// Standard Catan board layout (19 hexes)
const BOARD_LAYOUT = [
    // Resources for each hex (classic distribution)
    { resource: RESOURCE_TYPES.WHEAT, number: 2 },
    { resource: RESOURCE_TYPES.SHEEP, number: 3 },
    { resource: RESOURCE_TYPES.WOOD, number: 3 },
    { resource: RESOURCE_TYPES.WHEAT, number: 4 },
    { resource: RESOURCE_TYPES.BRICK, number: 4 },
    { resource: RESOURCE_TYPES.SHEEP, number: 5 },
    { resource: RESOURCE_TYPES.BRICK, number: 5 },
    { resource: RESOURCE_TYPES.ORE, number: 5 },
    { resource: RESOURCE_TYPES.WOOD, number: 6 },
    { resource: RESOURCE_TYPES.WHEAT, number: 6 },
    { resource: RESOURCE_TYPES.DESERT, number: null },
    { resource: RESOURCE_TYPES.WOOD, number: 8 },
    { resource: RESOURCE_TYPES.ORE, number: 8 },
    { resource: RESOURCE_TYPES.SHEEP, number: 9 },
    { resource: RESOURCE_TYPES.WHEAT, number: 9 },
    { resource: RESOURCE_TYPES.WOOD, number: 10 },
    { resource: RESOURCE_TYPES.SHEEP, number: 10 },
    { resource: RESOURCE_TYPES.ORE, number: 11 },
    { resource: RESOURCE_TYPES.BRICK, number: 11 }
];

// Hexagonal grid positions (axial coordinates)
const HEX_POSITIONS = [
    // Center
    { q: 0, r: 0 },
    // First ring
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
    // Second ring
    { q: 2, r: 0 }, { q: 2, r: -1 }, { q: 2, r: -2 },
    { q: 1, r: -2 }, { q: 0, r: -2 }, { q: -1, r: -1 },
    { q: -2, r: 0 }, { q: -2, r: 1 }, { q: -2, r: 2 },
    { q: -1, r: 2 }, { q: 0, r: 2 }, { q: 1, r: 1 }
];

// Initialize the game
function initGame() {
    initializeDevelopmentDeck();
    createBoard();
    updateResourceDisplay();
    updateDeckCount();
    attachEventListeners();
    addLog('Game initialized! Roll the dice to start playing.');
}

// Create development card deck
function initializeDevelopmentDeck() {
    gameState.developmentDeck = [];

    Object.values(DEV_CARD_TYPES).forEach(cardType => {
        for (let i = 0; i < cardType.count; i++) {
            gameState.developmentDeck.push({
                type: cardType.name,
                description: cardType.description
            });
        }
    });

    // Shuffle deck
    shuffleArray(gameState.developmentDeck);
}

// Shuffle array helper
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Create the hexagonal board
function createBoard() {
    const boardElement = document.getElementById('gameBoard');
    boardElement.innerHTML = '';

    // Shuffle the board layout for random placement
    const shuffledLayout = [...BOARD_LAYOUT];
    shuffleArray(shuffledLayout);

    HEX_POSITIONS.forEach((pos, index) => {
        const tile = shuffledLayout[index];
        const hexElement = createHexElement(tile, pos);
        boardElement.appendChild(hexElement);

        gameState.tiles.push({
            ...tile,
            position: pos,
            element: hexElement
        });
    });
}

// Create a single hex element
function createHexElement(tile, position) {
    const hex = document.createElement('div');
    hex.className = `hex hex-${tile.resource.name}`;

    // Calculate pixel position from axial coordinates
    const size = 60; // hex size
    const x = size * (Math.sqrt(3) * position.q + Math.sqrt(3)/2 * position.r) + 300;
    const y = size * (3/2 * position.r) + 250;

    hex.style.left = `${x}px`;
    hex.style.top = `${y}px`;

    hex.innerHTML = `
        <div class="hex-inner">
            <div class="hex-shape">
                <div class="hex-icon">${tile.resource.icon}</div>
                ${tile.number ? `<div class="hex-number ${[6, 8].includes(tile.number) ? 'hot' : ''}">${tile.number}</div>` : ''}
            </div>
        </div>
    `;

    hex.addEventListener('click', () => handleHexClick(tile));

    return hex;
}

// Handle hex click
function handleHexClick(tile) {
    if (tile.resource.name === 'desert') {
        addLog('Desert tiles produce no resources.');
        return;
    }

    addLog(`Clicked ${tile.resource.name} tile${tile.number ? ` with number ${tile.number}` : ''}`);
}

// Roll dice
function rollDice() {
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const total = dice1 + dice2;

    // Update dice display
    document.getElementById('dice1').textContent = dice1;
    document.getElementById('dice2').textContent = dice2;
    document.getElementById('diceTotal').textContent = `Total: ${total}`;

    // Distribute resources based on dice roll
    distributeResources(total);

    addLog(`Rolled ${dice1} + ${dice2} = ${total}`, true);
}

// Distribute resources based on dice roll
function distributeResources(diceTotal) {
    if (diceTotal === 7) {
        addLog('Rolled a 7! Robber activates (not implemented in basic version)');
        return;
    }

    let resourcesGained = false;

    gameState.tiles.forEach(tile => {
        if (tile.number === diceTotal && tile.resource.name !== 'desert') {
            // In a real game, this would check for settlements/cities
            // For this basic version, give 1 resource per matching tile
            gameState.resources[tile.resource.name]++;
            addLog(`Gained 1 ${tile.resource.name} from tile ${tile.number}`);
            resourcesGained = true;
        }
    });

    if (!resourcesGained) {
        addLog('No resources gained this turn.');
    }

    updateResourceDisplay();
}

// Buy development card
function buyDevelopmentCard() {
    // Check if player has resources
    if (gameState.resources.ore < 1 ||
        gameState.resources.wheat < 1 ||
        gameState.resources.sheep < 1) {
        addLog('Not enough resources! Need 1 Ore, 1 Wheat, 1 Sheep.');
        return;
    }

    // Check if deck has cards
    if (gameState.developmentDeck.length === 0) {
        addLog('No more development cards in the deck!');
        return;
    }

    // Deduct resources
    gameState.resources.ore--;
    gameState.resources.wheat--;
    gameState.resources.sheep--;

    // Draw card
    const card = gameState.developmentDeck.pop();
    gameState.developmentCards.push(card);

    addLog(`Bought development card: ${card.type}`, true);

    updateResourceDisplay();
    updateDevelopmentCardsDisplay();
    updateDeckCount();
}

// Play development card
function playDevelopmentCard(index) {
    const card = gameState.developmentCards[index];

    addLog(`Played ${card.type}: ${card.description}`, true);

    // Remove card from hand
    gameState.developmentCards.splice(index, 1);

    // Implement card effects
    switch(card.type) {
        case 'Knight':
            addLog('Knight played! (Robber movement not implemented in basic version)');
            break;
        case 'Victory Point':
            addLog('Victory Point revealed! +1 VP');
            break;
        case 'Road Building':
            addLog('Road Building played! (Building not implemented in basic version)');
            break;
        case 'Year of Plenty':
            // Give 2 random resources
            const resources = Object.keys(gameState.resources);
            const res1 = resources[Math.floor(Math.random() * resources.length)];
            const res2 = resources[Math.floor(Math.random() * resources.length)];
            gameState.resources[res1]++;
            gameState.resources[res2]++;
            addLog(`Received ${res1} and ${res2} from Year of Plenty!`);
            updateResourceDisplay();
            break;
        case 'Monopoly':
            addLog('Monopoly played! (Player interaction not implemented in basic version)');
            break;
    }

    updateDevelopmentCardsDisplay();
}

// Update resource display
function updateResourceDisplay() {
    Object.keys(gameState.resources).forEach(resource => {
        const element = document.getElementById(`${resource}-count`);
        if (element) {
            element.textContent = gameState.resources[resource];
        }
    });
}

// Update development cards display
function updateDevelopmentCardsDisplay() {
    const listElement = document.getElementById('devCardsList');
    listElement.innerHTML = '';

    gameState.developmentCards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'dev-card';
        cardElement.innerHTML = `
            <div>
                <div class="dev-card-name">${card.type}</div>
                <div style="font-size: 11px; opacity: 0.9;">${card.description}</div>
            </div>
            <button onclick="playDevelopmentCard(${index})">Play</button>
        `;
        listElement.appendChild(cardElement);
    });
}

// Update deck count
function updateDeckCount() {
    document.getElementById('deckCount').textContent = gameState.developmentDeck.length;
}

// Add log entry
function addLog(message, highlight = false) {
    const logElement = document.getElementById('gameLog');
    const entry = document.createElement('div');
    entry.className = `log-entry ${highlight ? 'highlight' : ''}`;

    const time = new Date().toLocaleTimeString();
    entry.textContent = `[${time}] ${message}`;

    logElement.insertBefore(entry, logElement.firstChild);

    // Keep only last 20 entries
    while (logElement.children.length > 20) {
        logElement.removeChild(logElement.lastChild);
    }
}

// Attach event listeners
function attachEventListeners() {
    document.getElementById('rollDice').addEventListener('click', rollDice);
    document.getElementById('buyDevCard').addEventListener('click', buyDevelopmentCard);
}

// Make functions available globally
window.playDevelopmentCard = playDevelopmentCard;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
