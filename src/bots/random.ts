import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    homeDynamiteCount: number;
    awayDynamiteCount: number;
    loSelect: number;
    hiSelect: number;
    move: BotSelection;

    constructor() {
        this.homeDynamiteCount = 0;
        this.awayDynamiteCount = 0;
        this.loSelect = 0;
        this.hiSelect = 5;
    }

    makeMove(gamestate: Gamestate): BotSelection {
        const rounds = gamestate.rounds;
        const moves: BotSelection[] = ['D', 'R', 'P', 'S', 'W'];

        if (rounds.length >= 1) {
            // record home move
            if (this.move === 'D') this.homeDynamiteCount++;

            // record away move
            let p1 = rounds[rounds.length-1]['p1']
            let p2 = rounds[rounds.length-1]['p2']
            if (p1 === this.move) {
                if (p2 ==='D') this.awayDynamiteCount++;
            }
            else {
                if (p1 ==='D') this.awayDynamiteCount++;
            }
        }
        
        if (this.homeDynamiteCount >= 100) this.loSelect = 1;
        if (this.awayDynamiteCount >= 100) this.hiSelect = 4;

        this.move = moves[Math.floor(Math.random() * (this.hiSelect - this.loSelect) + this.loSelect)];

        return this.move;
    }
}

export = new Bot();