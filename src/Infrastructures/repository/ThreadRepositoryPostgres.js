const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const RegisteredThread = require('../../Domains/threads/entities/RegisteredThread');
const RegisteredComment = require('../../Domains/threads/entities/RegisteredComment');
const RegisteredCommentReply = require('../../Domains/threads/entities/RegisteredCommentReply');
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
      text: `SELECT c.id, u.username, c.date, 
      CASE 
        WHEN c.is_delete THEN '**komentar telah dihapus**'
        ELSE c.content
      END AS content
      FROM comments as c
      LEFT JOIN users as u
      ON c.user_id = u.id
      WHERE c.thread_id = $1
      ORDER BY c.date ASC`,
      values: [threadId],
    });

    for (let i = 0; i < comments.length; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      const { rows: replies } = await this._pool.query({
        text: `SELECT cr.id, u.username, cr.date, 
        CASE 
          WHEN cr.is_delete THEN '**balasan telah dihapus**'
          ELSE cr.content
        END AS content
        FROM comment_replies as cr
        LEFT JOIN users as u
        ON cr.user_id = u.id
        WHERE cr.comment_id = $1
        ORDER BY cr.date ASC`,
        values: [comments[i].id],
      });

      comments[i].replies = replies;
    }

    return { ...thread, comments };
  }

  async verifyThreadById({ threadId }) {
    const { rows: [thread] } = await this._pool.query({
      text: 'SELECT * FROM threads where id = $1',
      values: [threadId],
    });

    if (!thread) throw new NotFoundError('Thread tidak ditemukan');
  }

  async addComment(registerThread) {
    const { content, threadId, userId } = registerThread;
    await this.verifyThreadById({ threadId });

    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const { rows: [comment] } = await this._pool.query({
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, date, threadId, userId, false],
    });

    return new RegisteredComment({ ...comment });
  }

  async verifyCommentById({ threadId, commentId }) {
    await this.verifyThreadById({ threadId });

    const { rows: [comment] } = await this._pool.query({
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [commentId],
    });

    if (!comment) throw new NotFoundError('Komentar tidak ditemukan');

    return { comment };
  }

  async verifyCommentOwner({ threadId, commentId, userId }) {
    const { comment } = await this.verifyCommentById({ threadId, commentId });

    if (comment.user_id !== userId) throw new AuthorizationError('Anda tidak memiliki hak hapus pada resource ini');
  }

  async deleteComment({ threadId, commentId, userId }) {
    await this.verifyCommentOwner({ threadId, commentId, userId });

    await this._pool.query({
      text: `UPDATE comments
      SET is_delete = $1
      WHERE id = $2`,
      values: [true, commentId],
    });
  }

  async addCommentReply(registerCommentReply) {
    const {
      content, threadId, commentId, userId,
    } = registerCommentReply;
    await this.verifyCommentById({ threadId, commentId });

    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const { rows: [reply] } = await this._pool.query({
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, date, commentId, userId, false],
    });

    return new RegisteredCommentReply({ ...reply });
  }

  async verifyCommentReplyById({ threadId, commentId, replyId }) {
    await this.verifyCommentById({ threadId, commentId });

    const { rows: [comment] } = await this._pool.query({
      text: 'SELECT id FROM comment_replies WHERE id = $1',
      values: [replyId],
    });

    if (!comment) throw new NotFoundError('Komentar balasan tidak ditemukan');
  }

  async verifyCommentReplyOwner({
    threadId, commentId, replyId, userId,
  }) {
    await this.verifyCommentReplyById({ threadId, commentId, replyId });

    const { rows: [reply] } = await this._pool.query({
      text: 'SELECT user_id as id FROM comment_replies where id = $1',
      values: [replyId],
    });
    if (reply.id !== userId) throw new AuthorizationError('Anda tidak memiliki hak hapus pada resource ini');
  }

  async deleteCommentReply({
    threadId, commentId, replyId, userId,
  }) {
    await this.verifyCommentReplyOwner({
      threadId, commentId, replyId, userId,
    });

    await this._pool.query({
      text: `UPDATE comment_replies
        SET is_delete = $1
        WHERE id = $2`,
      values: [true, replyId],
    });
  }
}

module.exports = ThreadRepositoryPostgres;
