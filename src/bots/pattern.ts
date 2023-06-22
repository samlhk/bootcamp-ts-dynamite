import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    count: number;

    constructor() {
        this.count = 0;
    }

    makeMove(gamestate: Gamestate): BotSelection {
        this.count++;
        if (this.count % 3 === 0) {
            return 'R';
        }
        else if (this.count % 3 === 1) {
            return 'P';
        }
        else {
            return 'S';
        }
        
    }
}

export = new Bot();