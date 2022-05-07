const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const CommentRepository = require('../../Domains/comments/CommentRepository');
const RegisteredComment = require('../../Domains/comments/entities/RegisteredComment');
const ReturnedComment = require('../../Domains/comments/entities/ReturnedComment');

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(registerThread) {
    const { content, threadId, userId } = registerThread;

    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const { rows: [comment] } = await this._pool.query({
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, date, threadId, userId, false],
    });

    return new RegisteredComment({ ...comment });
  }

  async getCommentsByThreadId({ threadId }) {
    const { rows: comments } = await this._pool.query({
      text: `SELECT c.id, c.content, u.username, c.date, c.is_delete AS "isDelete"
      FROM threads AS t
      LEFT JOIN comments AS c
      ON t.id = c.thread_id
      LEFT JOIN users as u
      ON c.user_id = u.id
      WHERE t.id = $1
      ORDER BY c.date ASC`,
      values: [threadId],
    });

    return comments.map((comment) => new ReturnedComment(comment));
  }

  async verifyCommentById({ commentId }) {
    const { rows: [comment] } = await this._pool.query({
      text: 'SELECT id, thread_id, user_id FROM comments WHERE id = $1',
      values: [commentId],
    });
    if (!comment) throw new NotFoundError('Komentar tidak ditemukan');

    return comment;
  }

  async verifyCommentOwner({ commentId, userId }) {
    const commentIds = await this.verifyCommentById({ commentId });

    if (commentIds.user_id !== userId) throw new AuthorizationError('Anda tidak memiliki hak hapus pada resource ini');
  }

  async deleteComment({ commentId }) {
    await this._pool.query({
      text: `UPDATE comments
      SET is_delete = $1
      WHERE id = $2`,
      values: [true, commentId],
    });
  }
}

module.exports = CommentRepositoryPostgres;
