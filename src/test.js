import * as fs from 'fs'

const musicDatas = JSON.parse(fs.readFileSync('miscs/MusicDatas.json', 'utf-8'))
const queries = musicDatas.filter(song => song.Difficulties[0].Rating > 0).map(song => [song.Title, song.FileName])
console.log(queries.length)
for (const query of queries) console.log(query[1])
