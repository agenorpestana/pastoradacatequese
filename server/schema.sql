
-- Database creation is handled by the deployment script. 
-- Do not include CREATE DATABASE or USE statements here to avoid overriding user configuration.

CREATE TABLE IF NOT EXISTS parish_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_json JSON
);

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    permissions JSON,
    linked_catequista_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS turmas (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    nivel VARCHAR(100),
    catequista VARCHAR(255),
    dia_semana VARCHAR(50),
    horario VARCHAR(20),
    ano VARCHAR(4),
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS catequistas (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'Ativo',
    sexo CHAR(1),
    data_nascimento DATE,
    rg_cpf VARCHAR(50),
    comunidade VARCHAR(255),
    telefone VARCHAR(50),
    whatsapp VARCHAR(50),
    email VARCHAR(255),
    full_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    matricula VARCHAR(50),
    nome_completo VARCHAR(255) NOT NULL,
    turma_id VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Ativo',
    data_nascimento DATE,
    sexo CHAR(1),
    telefone VARCHAR(50),
    nome_mae VARCHAR(255),
    nome_pai VARCHAR(255),
    batizado BOOLEAN DEFAULT FALSE,
    fez_primeira_eucaristia BOOLEAN DEFAULT FALSE,
    full_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_sessions (
    id VARCHAR(100) PRIMARY KEY,
    turma_id VARCHAR(50),
    date DATE,
    tema VARCHAR(255),
    entries JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(255),
    data_inicio DATETIME,
    data_fim DATETIME,
    tipo VARCHAR(50),
    full_data JSON
);

CREATE TABLE IF NOT EXISTS formations (
    id VARCHAR(50) PRIMARY KEY,
    tema VARCHAR(255),
    inicio DATETIME,
    fim DATETIME,
    presentes JSON,
    full_data JSON
);

CREATE TABLE IF NOT EXISTS gallery (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255),
    url LONGTEXT,
    date DATETIME,
    turma_id VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS niveis_etapas (
    id VARCHAR(50) PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255),
    category VARCHAR(100),
    url LONGTEXT,
    type VARCHAR(50),
    upload_date DATETIME
);

-- Inserir SUPER USUÁRIO DA UNITY AUTOMACÕES
INSERT IGNORE INTO users (id, nome, email, senha, role, permissions) VALUES 
('adm-unity', 'Suporte Unity', 'suporte@unityautomacoes.com.br', '200616', 'coordenador_paroquial', '{"dashboard": true, "students_view": true, "students_create": true, "students_edit": true, "students_delete": true, "students_print": true, "students_confirmed_view": true, "students_confirmed_manage": true, "classes": true, "catequistas": true, "formations": true, "reports": true, "attendance_report": true, "certificates": true, "attendance": true, "users_management": true, "library_view": true, "library_upload": true, "library_delete": true, "gallery_view": true, "gallery_upload": true, "gallery_delete": true}');
