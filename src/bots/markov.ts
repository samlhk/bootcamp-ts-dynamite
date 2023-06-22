import { Gamestate, BotSelection } from '../models/gamestate';

class Bot {
    homeDynamiteCount: number;
    awayDynamiteCount: number;

    round: number;

    awayCount: Record<BotSelection, Record<BotSelection, number>>;
    markov: Record<BotSelection, Record<BotSelection, number>>;
    outcome: Record<BotSelection, Record<BotSelection, number>>;
    
    move: BotSelection;
    pmove: BotSelection;


    constructor() {
        this.homeDynamiteCount = 0;
        this.awayDynamiteCount = 0;
        
        this.round = 0;

        this.awayCount = {
            'D': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
            'R': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
            'P': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
            'S': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
            'W': {'D': 0,'R': 0,'P': 0,'S': 0,'W': 0,},
        };
        this.markov = {
            'D': {'D': 0.2,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0.2,},
            'R': {'D': 0.2,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0.2,},
            'P': {'D': 0.2,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0.2,},
            'S': {'D': 0.2,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0.2,},
            'W': {'D': 0.2,'R': 0.2,'P': 0.2,'S': 0.2,'W': 0.2,}
        };

        this.outcome = {
            'D': {'D': 0,'R': 0.5,'P': 0.5,'S': 0.5,'W': -1,},
            'R': {'D': -1,'R': 0,'P': -1,'S': 1,'W': 1,},
            'P': {'D': -1,'R': 1,'P': 0,'S': -1,'W': 1,},
            'S': {'D': -1,'R': -1,'P': 1,'S': 0,'W': 1,},
            'W': {'D': 1,'R': -1,'P': -1,'S': -1,'W': 0,},
        };
    }

    makeMove(gamestate: Gamestate): BotSelection {
        const rounds = gamestate.rounds;
        const moves: BotSelection[] = ['D', 'R', 'P', 'S', 'W'];

        if (rounds.length === 1) {
            this.pmove = this.move;
        }

        if (rounds.length >= 1) {
            // record home move
            if (this.move === 'D') this.homeDynamiteCount++;

            // record away move
            let p1: BotSelection = rounds[rounds.length-1]['p1']
            let p2: BotSelection = rounds[rounds.length-1]['p2']
            if (p1 === this.move) {
                if (p2 ==='D') this.awayDynamiteCount++;
            }
            else {
                if (p1 ==='D') this.awayDynamiteCount++;
            }

        }

        if (rounds.length >= 2) {
            let prevP1Move: BotSelection = rounds[rounds.length-1]['p1']
            let prevP2Move: BotSelection = rounds[rounds.length-1]['p2']
            let prevprevP1Move: BotSelection = rounds[rounds.length-2]['p1']
            let prevprevP2Move: BotSelection = rounds[rounds.length-2]['p2']
            let prevOppMove: BotSelection;
            let prevprevOppMove: BotSelection;

            if (this.pmove === prevprevP1Move && this.move === prevP1Move) {
                prevOppMove = prevP2Move;
                prevprevOppMove = prevprevP2Move;
            }
            else if (this.pmove === prevprevP2Move && this.move === prevP2Move) {
                prevOppMove = prevP1Move;
                prevprevOppMove = prevprevP1Move;
            }
            else {
                throw Error("Code error: cannot match previous moves");
            }

            this.awayCount[prevprevOppMove][prevOppMove]++;

            // update markov model
            
            // Loop over the record
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

            this.pmove = this.move

            let maxUtility: number = - Infinity;
            let bestAction: BotSelection = 'D';
            for (const action  in this.outcome) {
                let utility: number = 0;
                for (const opponent in this.outcome[action as BotSelection]) {
                    utility += this.outcome[action as BotSelection][opponent as BotSelection] * this.markov[prevOppMove][opponent as BotSelection];
                }
                if (utility > maxUtility) {
                    if ((action !== 'D' || this.homeDynamiteCount < 100) && (action !== 'W' || this.awayDynamiteCount < 100)) {
                        maxUtility = utility;
                        bestAction = action as BotSelection;
                    }
                    
                }
                
            }
            this.move = bestAction;

        }
        else {
            this.move = moves[Math.floor(Math.random() * 5)];
        }
        
        

        
        this.round++;
        if (this.round === 1000) {
            console.log(this.awayCount)
            console.log(this.markov)
        }
        return this.move;
    }
}

export = new Bot();