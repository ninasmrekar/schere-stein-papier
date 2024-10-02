export class OfflineGameService {
    computerHand;

    constructor() {
        this.possibleHands = Object.keys(this.#resultLookup);
    }

    // Can be used to check if the selected hand wins/loses
    #resultLookup = {
        schere: {
            schere: 0,
            stein: -1,
            papier: 1,
            brunnen: -1,
            streichholz: 1,
        },
        stein: {
            schere: 1,
            stein: 0,
            papier: -1,
            brunnen: -1,
            streichholz: 1,
        },
        papier: {
            schere: -1,
            stein: 1,
            papier: 0,
            brunnen: 1,
            streichholz: -1,
        },
        brunnen: {
            schere: 1,
            stein: 1,
            papier: -1,
            brunnen: 0,
            streichholz: -1,
        },
        streichholz: {
            schere: -1,
            stein: -1,
            papier: 1,
            brunnen: 1,
            streichholz: 0,
        },
    };

    async getRankings(playerName, numberOfWins) {
        const rankings = JSON.parse(localStorage.getItem('rankings')) || [];
        const playerExists = rankings.find((entry) => entry.user === playerName);

        if (playerExists) {
            playerExists.win += numberOfWins;
        } else {
            rankings.push({
                user: playerName,
                win: numberOfWins,
            });
        }
        return rankings;
    }

    async evaluate(playerName, playerHand) {
        const randomNumber = Math.floor(Math.random() * this.possibleHands.length);
        this.computerHand = this.possibleHands[randomNumber];
        return this.#resultLookup[playerHand.toLowerCase()][this.computerHand];
    }
}
