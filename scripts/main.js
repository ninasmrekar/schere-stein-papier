import { gameService } from './model/game-service.js';

let playerHand = '';
let computerHand = '';
let gameResult = 0;
let numberOfWins = 0;
let playerName = '';
let rankings = [];

// HTML Elements
const startPage = document.querySelector('#start-page-section');
const playPage = document.querySelector('#play-page-section');
const greeting = document.querySelector('#greeting');
const computerChoice = document.querySelector('#computer-choice');
const playerNameInput = document.querySelector('#player-name-input');
const possibleHands = document.querySelectorAll('#hands-ul li');
const historyTable = document.querySelector('#history-table');
const ranking = document.querySelector('.ranking-ul');
const timer = document.querySelector('#timer');
const loader = document.querySelector('#loader');
const backButton = document.querySelector('#back-button');
const changeModeButton = document.querySelector('#change-mode-button');
const startButton = document.querySelector('#start-button');

async function updateRanking() {
    rankings = [];
    const sortedRanking = [];
    let rank = 1;

    rankings = Object.values(await gameService.getRankings(playerName, numberOfWins));
    rankings.sort((a, b) => b.win - a.win);

    rankings.forEach((entry) => {
        if (entry.win) {
            const wins = sortedRanking.filter((obj) => obj.win === entry.win);
            if (wins.length >= 1) {
                const index = sortedRanking.findIndex((obj) => obj.win === entry.win);
                sortedRanking[index].user.push(entry.user);
            } else {
                sortedRanking.push({
                    rank,
                    win: entry.win,
                    user: [entry.user],
                });
                rank++;
            }
        }
    });

    sortedRanking.forEach((rankingEntry) => {
        if (rankingEntry.rank <= 10) {
            const liRankElement = document.createElement('li');
            liRankElement.textContent = `${rankingEntry.rank} . Rang mit  ${rankingEntry.win} Siegen`;
            liRankElement.classList.add('ranking-li');
            ranking.appendChild(liRankElement);
            const liPlayersElement = document.createElement('li');
            liPlayersElement.textContent = rankingEntry.user.join(', ');
            ranking.appendChild(liPlayersElement);
        }
    });

    if (!gameService.isOnline) {
        localStorage.setItem('rankings', JSON.stringify(rankings));
    }
}

function resetRanking() {
    ranking.textContent = '';
}

function startGame() {
    if (playerNameInput.value.replaceAll(' ', '').length >= 1) {
        playerName = playerNameInput.value;
        startPage.classList.add('hidden');
        playPage.classList.remove('hidden');
        greeting.innerHTML = `<b>${playerNameInput.value}!</b> Wähle deine Hand!`;
        resetRanking();
    }
}

// Reset the game
function reset() {
    playerHand.classList.remove('won');
    playerHand.classList.remove('lost');
    playerHand.classList.remove('equal');

    computerChoice.classList.remove('won');
    computerChoice.classList.remove('lost');
    computerChoice.classList.remove('equal');

    computerChoice.textContent = '';
    computerHand = '';
    playerHand = '';
}

async function changeMode() {
    resetRanking();

    if (gameService.isOnline === false) {
        gameService.isOnline = true;
        loader.classList.remove('hidden');
        await updateRanking();
        loader.classList.add('hidden');
    } else {
        gameService.isOnline = false;
        const items = document.querySelectorAll('.ranking-li');
        for (let i = 0; i < items.length; i++) {
            items.item(i).remove();
        }
        await updateRanking();
    }
}

async function goBackToStartPage() {
    startPage.classList.remove('hidden');
    playPage.classList.add('hidden');
    playerNameInput.value = '';
    changeModeButton.disabled = true;
    resetRanking();
    loader.classList.remove('hidden');
    await updateRanking();
    loader.classList.add('hidden');
    changeModeButton.disabled = false;
    numberOfWins = 0;
}

// Timer
function runTimer(counter) {
    let currentCounter = counter;
    if (counter >= 0) {
        setTimeout(() => {
            currentCounter -= 1;
            timer.textContent = `Nächste Rounde in ${counter}`;
            runTimer(currentCounter);
        }, 1000);
    } else {
        reset();
        timer.textContent = 'VS';
        backButton.disabled = false;
    }
}

// Evaluate the game and add entry to history
async function checkWin() {
    await gameService.evaluate(playerName, playerHand.textContent).then((data) => {
        gameResult = data;
    });

    // display computer choice
    computerHand = gameService.computerChoice.charAt(0).toUpperCase() + gameService.computerChoice.slice(1);
    computerChoice.textContent = computerHand;
    // Display who won and who lost
    if (gameResult === 1) {
        numberOfWins += 1;
        playerHand.classList.add('won');
        computerChoice.classList.add('lost');
    } else if (gameResult === -1) {
        playerHand.classList.add('lost');
        computerChoice.classList.add('won');
    } else {
        playerHand.classList.add('equal');
        computerChoice.classList.add('equal');
    }

    // Add entry to history-table
    const trElement = document.createElement('tr');
    const tdResult = document.createElement('td');
    const tdPlayer = document.createElement('td');
    const tdComputer = document.createElement('td');

    trElement.appendChild(tdResult);
    trElement.appendChild(tdPlayer);
    trElement.appendChild(tdComputer);

    if (gameResult === 1) {
        tdResult.innerHTML = '<i class="fa fa-check" aria-hidden="true"></i>';
    } else if (gameResult === -1) {
        tdResult.innerHTML = '<i class="fa fa-times" aria-hidden="true"></i>';
    } else {
        tdResult.innerHTML = '<b> = </b>';
    }
    tdPlayer.textContent = playerHand.textContent;
    tdComputer.textContent = computerHand;
    historyTable.children[0].insertAdjacentElement('afterend', trElement);

    // Reset
    runTimer(2);
}

// Get the hand, that was chosen by the player
async function getPlayerHand(index) {
    if (playerHand === '') {
        playerHand = possibleHands.item(index);
        backButton.disabled = true;
        await checkWin();
    }
}

/* Event Listeners */
// Add EventListener to every possible hand
for (let i = 0; i < possibleHands.length; i++) {
    possibleHands.item(i).addEventListener('click', async () => {
        await getPlayerHand(i);
    });
}

// Add EventListener to start-button
startButton.addEventListener('click', (event) => {
    event.preventDefault();
    startGame();
});

// Add EventListener to back-button
backButton.addEventListener('click', async (event) => {
    event.preventDefault();
    await goBackToStartPage();
});

// Add EventListener to change-mode-button
changeModeButton.addEventListener('click', async (event) => {
    event.preventDefault();
    await changeMode();
    if (gameService.isOnline === true) {
        changeModeButton.textContent = 'Wechsle zu Lokal';
    } else {
        changeModeButton.textContent = 'Wechsle zu Server';
    }
});
