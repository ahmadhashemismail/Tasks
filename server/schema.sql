CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    note TEXT,
    date DATE,
    enddate DATE,
    done BOOLEAN DEFAULT FALSE
);

CREATE TABLE customer (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    debts NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (debts >= 0),
    cost NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (cost >= 0),
    balance NUMERIC(12, 2) NOT NULL DEFAULT 0
);
