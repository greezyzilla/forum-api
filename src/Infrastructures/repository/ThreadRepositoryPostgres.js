const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const RegisteredThread = require('../../Domains/threads/entities/RegisteredThread');
const ReturnedThread = require('../../Domains/threads/entities/ReturnedThread');
const ThreadRepository = require('../../Domains/threads/ThreadRepository');

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addThread(registerThread) {
    const { title, body, owner } = registerThread;
    const id = `thread-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const { rows: [thread] } = await this._pool.query({
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner',
      values: [id, title, body, date, owner],
    });

    return new RegisteredThread({ ...thread });
  }

  async getThreadById({ threadId }) {
    await this.verifyThreadById({ threadId });

    const { rows: [thread] } = await this._pool.query({
      text: `SELECT t.id, t.title, t.body, t.date, u.username
      FROM threads as t
      LEFT JOIN users as u
      ON t.owner = u.id
      WHERE t.id = $1`,
      values: [threadId],
    });

    const { rows: comments } = await this._pool.query({
      text: 'SELECT id as "commentId" FROM comments WHERE thread_id = $1 ORDER BY date ASC',
      values: [threadId],
    });
    return new ReturnedThread({ ...thread, comments });
  }

  async verifyThreadById({ threadId }) {
    const { rows: [thread] } = await this._pool.query({
      text: 'SELECT * FROM threads where id = $1',
      values: [threadId],
    });

    if (!thread) throw new NotFoundError('Thread tidak ditemukan');
  }
}

module.exports = ThreadRepositoryPostgres;
