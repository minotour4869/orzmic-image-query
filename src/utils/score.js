import Decimal from "decimal.js"
import { argv0 } from "process"

export function rate(chartConstant, noteCount, score, exScore) {
    function baseRating() {
        // new formula, shoutout to Sixi
        // https://mzh.moegirl.org.cn/Orzmic#Rating.E8.AE.A1.E7.AE.97.E6.9C.BA.E5.88.B6
        // using external library because i'm tired of dealing with precision error
        let mod = 2.2
        if (score < 1_000_000 + noteCount)
            mod = 2.1
        if (score === 1_000_000)
            mod = 2.0
        if (score < 1_000_000)
            mod = 1.0 + ((score - 980_000)/20_000)
        if (score < 980_000)
            mod = 0.4 + ((score - 950_000)/50_000)
        if (score < 950_000)
            mod = (score - 900_000)/125_000
        if (score < 900_000) 
            mod = 2.0*((score - 900_000)/200_000)
        if (score < 700_000)
            return 0

        return Math.max(chartConstant + mod, 0)
    }

    let modifier = 0.0

    if (exScore == 0)
        modifier = 0.05 * (1 + (score >= 1_000_000))
    if (exScore == 1) 
        modifier = 0.02 * (1 + (score >= 1_000_000))
    
    return baseRating() + modifier
}

export function rank(noteCount, score) {
    if (score < 800_000) return 'F'
    if (score < 850_000) return 'D'
    if (score < 900_000) return 'C'
    if (score < 950_000) return 'B'
    if (score < 980_000) return 'A'
    if (score < 1_000_000) return 'S'
    if (score === 1_000_000) return 'O'
    if (score < 1_000_000 + noteCount*0.8) return 'R'
    if (score < 1_000_000 + noteCount) return 'Z'
    return 'Orz'
}
