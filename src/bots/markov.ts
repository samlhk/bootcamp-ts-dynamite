import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    homeDynamiteCount: number;
    awayDynamiteCount: number;

    awayCount: Record<BotSelection, Record<BotSelection, number>>;
    markov: Record<BotSelection, Record<BotSelection, number>>;
    outcome: Record<BotSelection, Record<BotSelection, number>>;
    
    move: BotSelection;
    prevMove: BotSelection;

    constructor() {
        this.homeDynamiteCount = 0;
        this.awayDynamiteCount = 0;

        this.awayCount = {
            'D': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
            'R': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
            'P': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
            'S': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
            'W': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
        };
        this.markov = {
            'D': {'D': 0.2,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0,},
            'R': {'D': 0,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0,},
            'P': {'D': 0,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0,},
            'S': {'D': 0,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0,},
            'W': {'D': 0,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0.2,}
        };

        this.outcome = {
            'D': {'D': -0.5,'R': 0.05,'P': 0.05, 'S': 0.05,'W': -1,},
            'R': {'D': -1,'R': -0.5,'P': -1,'S': 1,'W': 1,},
            'P': {'D': -1,'R': 1,'P': -0.5,'S': -1,'W': 1,},
            'S': {'D': -1,'R': -1,'P': 1,'S': -0.5,'W': 1,},
            'W': {'D': 0.1,'R': -1,'P': -1,'S': -1,'W': -0.5,},
        };
    }

    makeMove(gamestate: Gamestate): BotSelection {
        const rounds = gamestate.rounds;
        const moves: BotSelection[] = ['D', 'R', 'P', 'S', 'W'];

        if (rounds.length === 1) {
            // set initial previous move
            this.prevMove = this.move;
        }

        if (rounds.length >= 1) {
            // record home D
            if (this.move === 'D') this.homeDynamiteCount++;
            // record away D
            let prevAwayMove: BotSelection = this.getAwayMoves(gamestate)[1];
            if (prevAwayMove ==='D') this.awayDynamiteCount++;
        }

        if (rounds.length >= 2) {
            let [prevprevAwayMove, prevAwayMove] = this.getAwayMoves(gamestate);
            this.awayCount[prevprevAwayMove][prevAwayMove]++;
            this.updateMarkov();
            this.prevMove = this.move;
            this.move = this.computeBestAction(prevAwayMove);
        }
        else {
            this.move = moves[Math.floor(Math.random() * 5)];
        }

        return this.move;
    }

    private getAwayMoves(gamestate: Gamestate): [BotSelection, BotSelection]  {
        const rounds = gamestate.rounds;

        if (rounds.length < 1) {
            throw Error("Code error: there should at least be one round played before the player could be inferred.")
        }

        else if (rounds.length === 1) {
            let p1: BotSelection = rounds[rounds.length-1]['p1']
            let p2: BotSelection = rounds[rounds.length-1]['p2']
            if (p1 === this.move) {
                return ['D', p2];
            }
            else if (p2 === this.move) {
                return ['D', p1];
            }
            else {
                throw Error("Code error: cannot match previous moves");
            }
        }

        else if (rounds.length >= 2) {
            let prevP1Move: BotSelection = rounds[rounds.length-1]['p1']
            let prevP2Move: BotSelection = rounds[rounds.length-1]['p2']
            let prevprevP1Move: BotSelection = rounds[rounds.length-2]['p1']
            let prevprevP2Move: BotSelection = rounds[rounds.length-2]['p2']

            if (this.prevMove === prevprevP1Move && this.move === prevP1Move) {
                return [prevprevP2Move, prevP2Move];
            }
            else if (this.prevMove === prevprevP2Move && this.move === prevP2Move) {
                return [prevprevP1Move, prevP1Move];
            }
            else {
                throw Error("Code error: cannot match previous moves");
            }
        }

    }

    private updateMarkov() {
        for (const prev in this.awayCount) {
            let count: number = 0;
            for (const now in this.awayCount[prev as BotSelection]) {
                count += this.awayCount[prev as BotSelection][now as BotSelection];
            }
            for (const now in this.awayCount[prev as BotSelection]) {
                this.markov[prev as BotSelection][now as BotSelection] = 
                    count === 0 ? this.markov[prev as BotSelection][now as BotSelection] :
                    this.awayCount[prev as BotSelection][now as BotSelection] / count;
            }
        }
    }

    private computeBestAction(prevAwayMove: BotSelection): BotSelection {
        let maxUtility: number = - Infinity;
        let bestAction: BotSelection = 'D';
        for (const action in this.outcome) {
            let utility: number = 0;
            for (const opponent in this.outcome[action as BotSelection]) {
                utility += this.outcome[action as BotSelection][opponent as BotSelection] * this.markov[prevAwayMove][opponent as BotSelection];
            }
            if (utility > maxUtility) {
                if ((action !== 'D' || this.homeDynamiteCount < 100) && (action !== 'W' || this.awayDynamiteCount < 100)) {
                    maxUtility = utility;
                    bestAction = action as BotSelection;
                }
            }
        }
        return bestAction;
    }
}

export = new Bot();