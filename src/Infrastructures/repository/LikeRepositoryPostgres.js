const InvariantError = require('../../Commons/exceptions/InvariantError');
const LikeRepository = require('../../Domains/likes/LikeRepository');

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async verifyLikeByCommentId({ commentId, userId }) {
    const result = await this._pool.query({
      text: 'SELECT id FROM likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    });

    return !!result.rowCount;
  }

  async addLike({ commentId, userId }) {
    const id = `like-${this._idGenerator()}`;

    const result = await this._pool.query({
      text: 'INSERT INTO likes VALUES($1, $2, $3) RETURNING id',
      values: [id, commentId, userId],
    });

    if (!result.rowCount) throw new InvariantError('Gagal menambahkan like');
  }

  async removeLike({ commentId, userId }) {
    await this._pool.query({
      text: 'DELETE from likes WHERE comment_id = $1 AND user_id = $2',
      values: [commentId, userId],
    });
  }

  async getLikeCountByCommentId({ commentId }) {
    const { rows: [{ count }] } = await this._pool.query({
      text: 'SELECT COUNT(id) FROM likes WHERE comment_id = $1',
      values: [commentId],
    });

    return +count || 0;
  }
}

module.exports = LikeRepositoryPostgres;
