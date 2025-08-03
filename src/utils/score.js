export function rate(chartConstant, noteCount, score, exScore) {
    function baseRating() {
        // new formula, shoutout to Sixi
        // https://mzh.moegirl.org.cn/Orzmic#Rating.E8.AE.A1.E7.AE.97.E6.9C.BA.E5.88.B6
        if (score < 700_000) return 0
        if (score < 900_000) 
            return (chartConstant < 2 ? 
                chartConstant*((score - 700_000)/200_000) :
                chartConstant - 2.0 + ((score - 700_000)/100_000)
            )
        if (score < 950_000)
            return chartConstant + ((score - 900_000)/125_000)
        if (score < 980_000)
            return chartConstant + 0.4 + ((score - 950_000)/50_000)
        if (score < 1_000_000)
            return chartConstant + 1.0 + ((score - 980_000)/20_000)
        if (score === 1_000_000)
            return chartConstant + 2.0
        if (score < 1_000_000 + noteCount)
            return chartConstant + 2.1
        return chartConstant + 2.2
    }

    // dealing with floating point error issue
    let modifier = 0
    let anti_modifier = 1

    if (exScore == 0)
        modifier = score < 1_000_000 ? 0.05 : 0.10
        anti_modifier = 20
    if (exScore == 1) 
        modifier = score < 1_000_000 ? 0.02 : 0.04
        anti_modifier = 50
    
    return Math.ceil((baseRating() + modifier)*anti_modifier)/anti_modifier
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
