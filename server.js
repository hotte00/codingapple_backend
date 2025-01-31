const express = require('express')
const app = express()

app.use(express.static(__dirname + '/public'))

const { MongoClient } = require('mongodb');

let db;
const url = 'mongodb+srv://junpio0812:gundam11@cluster0.pp3pb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
new MongoClient(url).connect().then((client) => {
    console.log('DB연결성공')
    db = client.db('forum');
}).catch((err) => {
    console.log(err)
})

app.listen(8080, () => {
    console.log('http://localhost:8080 에서 서버 실행중')
})

app.get('/', (요청, 응답) => {
    응답.sendFile(__dirname + '/index.html')
})

app.get('/news', (요청, 응답) => {
    응답.send('비올듯ㅋㅋ')
})

app.get('/shop', (요청, 응답) => {
    응답.send('쇼핑페이지임')
})

app.get('/about', (요청, 응답) => {
    응답.sendFile(__dirname + '/about.html')
})