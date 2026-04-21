import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'prd_llm.db');

class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
    this.init();
  }

  private init() {
    const schema = `
      CREATE TABLE IF NOT EXISTS qa_pairs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT UNIQUE,
        answer TEXT,
        source TEXT,
        confidence REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS knowledge_base (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fact_text TEXT,
        source TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversation_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        user_message TEXT,
        ai_response TEXT,
        curvature REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS curriculum_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        domain TEXT,
        topic TEXT,
        level INTEGER,
        priority INTEGER,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS learning_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic TEXT,
        topic_type TEXT,
        priority REAL,
        status TEXT DEFAULT 'pending',
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS document_chunks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_filename TEXT,
        chunk_text TEXT,
        embedding_json TEXT,
        learned INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS domain_progress (
        domain TEXT PRIMARY KEY,
        current_level INTEGER DEFAULT 1,
        topics_completed TEXT DEFAULT '[]',
        last_learned DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS episodic_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        snippet TEXT,
        importance_score REAL,
        tensor_json TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS knowledge_gaps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS causal_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_concept TEXT,
        target_concept TEXT,
        relation_type TEXT,
        strength REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS paccaya_weights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        weights_json TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS image_embeddings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT,
        caption TEXT,
        tensor_json TEXT
      );

      CREATE TABLE IF NOT EXISTS audio_transcripts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_path TEXT,
        transcript TEXT,
        tensor_json TEXT
      );
    `;
    this.db.exec(schema);
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastId: this.lastID, changes: this.changes });
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }
}

export const db = new Database();
