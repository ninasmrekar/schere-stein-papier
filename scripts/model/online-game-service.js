export class OnlineGameService {
    computerHand;

    async getRankings() {
        return fetch('https://stone.sifs0005.infs.ch/ranking').then((response) => response.json());
    }

    async evaluate(playerName, playerHand) {
        let result;
        await fetch(`https://stone.sifs0005.infs.ch/play?playerName=${playerName}&playerHand=${playerHand}`)
            .then((response) => response.json())
            .then((data) => {
                this.computerHand = data.choice;
                if (data.win === true) {
                    result = 1;
                } else if (data.win === false) {
                    result = -1;
                } else {
                    result = 0;
                }
            });
        return result;
    }
}
