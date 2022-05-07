const AuthorizationError = require('../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../Commons/exceptions/NotFoundError');
const ReturnedReply = require('../../Domains/replies/entities/ReturnedReply');
const RegisteredReply = require('../../Domains/replies/entities/RegisteredReply');
const ReplyRepository = require('../../Domains/replies/ReplyRepository');

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(registerReply) {
    const {
      content, commentId, userId,
    } = registerReply;

    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();

    const { rows: [reply] } = await this._pool.query({
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, date, commentId, userId, false],
    });

    return new RegisteredReply({ ...reply });
  }

  async getRepliesByCommentId({ commentId }) {
    const { rows: replies } = await this._pool.query({
      text: `SELECT r.id, r.content, u.username, r.date, r.is_delete AS "isDelete"
      FROM comments AS c
      LEFT JOIN replies AS r
      ON c.id = r.comment_id
      LEFT JOIN users as u
      ON r.user_id = u.id
      WHERE c.id = $1
      ORDER BY r.date ASC`,
      values: [commentId],
    });

    return replies.map((reply) => new ReturnedReply(reply));
  }

  async deleteReply({ replyId }) {
    await this._pool.query({
      text: `UPDATE replies
        SET is_delete = $1
        WHERE id = $2`,
      values: [true, replyId],
    });
  }

  async verifyReplyById({ replyId }) {
    const { rows: [reply] } = await this._pool.query({
      text: 'SELECT id, comment_id, user_id FROM replies WHERE id = $1',
      values: [replyId],
    });

    if (!reply) throw new NotFoundError('Balasan tidak ditemukan');
    return reply;
  }

  async verifyReplyOwner({ replyId, userId }) {
    const reply = await this.verifyReplyById({ replyId });

    if (reply.user_id !== userId) throw new AuthorizationError('Anda tidak memiliki hak hapus pada resource ini');
  }
}

module.exports = ReplyRepositoryPostgres;
