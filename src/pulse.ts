export class Pulse {
    xps: Map < string, number > ;

    constructor() {
        console.log("Creating Pulse");
        this.xps = new Map < string, number > ();
    }

    public getXP(language: string): number {
        let xp: number = this.xps.get(language);

        if (xp === null || xp === undefined) {
            return 0;
        } else {
            return xp;
        }
    }

    public addXP(language: string, amount: number): void {
        let xp: number = this.getXP(language);

        xp += amount;

        this.xps.set(language, xp);

        // console.log(`Added ${amount} of XP to ${language}, total is now ${xp}`);
    }
}