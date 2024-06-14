const mysql = require('mysql2/promise');

async function createDatabaseAndTables() {
    const connection = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'admin'
    });

    await connection.query('DROP DATABASE IF EXISTS BankDB');
    await connection.query('CREATE DATABASE BankDB');
    await connection.changeUser({ database: 'BankDB' });

    try {
        await connection.query(`
            CREATE TABLE Borrowers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                inn VARCHAR(20) NOT NULL,
                type BOOLEAN NOT NULL,
                address VARCHAR(255) NOT NULL,
                total_amount DECIMAL(15, 2) NOT NULL,
                conditions TEXT,
                legal_notes TEXT,
                contracts_list TEXT
            );

            CREATE TABLE Individuals (
                id INT AUTO_INCREMENT PRIMARY KEY,
                first_name VARCHAR(255) NOT NULL,
                last_name VARCHAR(255) NOT NULL,
                middle_name VARCHAR(255),
                passport VARCHAR(20) NOT NULL,
                inn VARCHAR(20) NOT NULL,
                snils VARCHAR(20),
                driver_license VARCHAR(20),
                additional_documents TEXT,
                notes TEXT
            );

            CREATE TABLE Loans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                individual_id INT,
                amount DECIMAL(15, 2) NOT NULL,
                interest_rate DECIMAL(5, 2) NOT NULL,
                term INT NOT NULL,
                conditions TEXT,
                notes TEXT,
                borrower_id INT,
                FOREIGN KEY (individual_id) REFERENCES Individuals(id) ON DELETE CASCADE,
                FOREIGN KEY (borrower_id) REFERENCES Borrowers(id) ON DELETE CASCADE
            );

            CREATE TABLE OrganizationLoans (
                id INT AUTO_INCREMENT PRIMARY KEY,
                organization_id INT NOT NULL,
                individual_id INT,
                amount DECIMAL(15, 2) NOT NULL,
                term INT NOT NULL,
                interest_rate DECIMAL(5, 2) NOT NULL,
                conditions TEXT,
                notes TEXT,
                borrower_id INT,
                FOREIGN KEY (individual_id) REFERENCES Individuals(id) ON DELETE CASCADE,
                FOREIGN KEY (borrower_id) REFERENCES Borrowers(id) ON DELETE CASCADE
            );
        `);
        console.log("БД и таблицы успешно созданы!");
    } catch (error) {
        console.error("Ошибка при создании БД и таблиц:", error);
    }

    await connection.end();
}

createDatabaseAndTables().catch(err => {
    console.error('Ошибка создания БД', err);
});
