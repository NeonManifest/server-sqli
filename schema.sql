CREATE DATABASE sqli_lab;
USE sqli_lab;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    flag VARCHAR(100) NOT NULL
);

INSERT INTO users (username, password, flag) VALUES 
('test', 'testpass', 'FLAG{FLAG_FAKE}')
('admin', 'poodle', 'FLAG{beagle}'),
('user', 'senha', 'FLAG{FLAG_FALSA}');

CREATE TABLE logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45),
    attempt_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username_attempt VARCHAR(50),
    success BOOLEAN
);