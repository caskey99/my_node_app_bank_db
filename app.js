const http = require('http');
const fs = require('fs');
const qs = require('querystring');
const Mysql = require('sync-mysql');

const connection = new Mysql({
    host: 'localhost',
    user: 'root',
    password: 'admin',
    database: 'BankDB',
    charset: 'utf8mb4'
});

function reqPost(request, response) {
    if (request.method === 'POST') {
        let body = '';

        request.on('data', (data) => {
            body += data;
        });

        request.on('end', () => {
            const post = qs.parse(body);
            if (post.id && post.action === 'edit') {
                const sUpdate = `UPDATE Borrowers SET inn="${post.inn}", type=${post.type ? 1 : 0}, address="${post.address}", total_amount="${post.total_amount}", conditions="${post.conditions}", legal_notes="${post.legal_notes}", contracts_list="${post.contracts_list}" WHERE id=${post.id}`;
                try {
                    connection.query(sUpdate);
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end('Запись успешно обновлена');
                } catch (err) {
                    response.writeHead(500, {'Content-Type': 'text/html'});
                    response.end('Ошибка при обновлении записи');
                }
            } else if (post.id && post.action === 'delete') {
                const sDelete = `DELETE FROM Borrowers WHERE id=${post.id}`;
                try {
                    connection.query(sDelete);
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end('Запись успешно удалена');
                } catch (err) {
                    response.writeHead(500, {'Content-Type': 'text/html'});
                    response.end('Ошибка при удалении записи');
                }
            } else if (post.action === 'add') {
                const sInsert = `INSERT INTO Borrowers (inn, type, address, total_amount, conditions, legal_notes, contracts_list) VALUES ("${post.inn}", ${post.type ? 1 : 0}, "${post.address}", "${post.total_amount}", "${post.conditions}", "${post.legal_notes}", "${post.contracts_list}")`;
                try {
                    connection.query(sInsert);
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end('Запись успешно добавлена');
                } catch (err) {
                    response.writeHead(500, {'Content-Type': 'text/html'});
                    response.end('Ошибка при добавлении записи');
                }
            }
        });
    }
}

function ViewSelect(res) {
    try {
        const results = connection.query('SHOW COLUMNS FROM Borrowers');
        res.write('<tr>');
        results.forEach(result => {
            res.write('<th>' + result.Field + '</th>');
        });
        res.write('<th>Действия</th>');
        res.write('</tr>');

        const rows = connection.query('SELECT * FROM Borrowers ORDER BY id DESC');
        rows.forEach(row => {
            res.write(`<tr>
                <td>${row.id}</td>
                <td>${row.inn}</td>
                <td>${row.type}</td>
                <td>${row.address}</td>
                <td>${row.total_amount}</td>
                <td>${row.conditions}</td>
                <td>${row.legal_notes}</td>
                <td>${row.contracts_list}</td>
                <td>
                    <button onclick="editRecord(${row.id}, '${row.inn}', ${row.type}, '${row.address}', ${row.total_amount}, '${row.conditions}', '${row.legal_notes}', '${row.contracts_list}')">Изменить</button>
                    <button onclick="deleteRecord(${row.id})">Удалить</button>
                </td>
            </tr>`);
        });
    } catch (err) {
        res.write('<tr><td colspan="9">Ошибка при запросе к базе данных: ' + err.message + '</td></tr>');
    }
}

function ViewVer(res) {
    try {
        const results = connection.query('SELECT VERSION() AS ver');
        res.write(results[0].ver);
    } catch (err) {
        res.write('Ошибка при запросе к базе данных: ' + err.message);
    }
}

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        reqPost(req, res);
    } else {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html');

        const array = fs.readFileSync(__dirname + '\\select.html').toString().split('\n');
        array.forEach(line => {
            if (line.trim() !== '@tr' && line.trim() !== '@ver') res.write(line);
            if (line.trim() === '@tr') ViewSelect(res);
            if (line.trim() === '@ver') ViewVer(res);
        });
        res.end();
    }
});

const hostname = '127.0.0.1';
const port = 3000;
server.listen(port, hostname, () => {
});
