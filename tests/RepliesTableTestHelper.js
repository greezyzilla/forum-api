/* istanbul ignore file */

const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReply({
    id = 'reply-123',
    content = 'sebuah balasan',
    date = new Date().toISOString(),
    commentId = 'comment-123',
    userId = 'user-123',
  }) {
    await pool.query({
      text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, date, commentId, userId, false],
    });
  },

  async findReplyById(id) {
    const { rows: replies } = await pool.query({
      text: 'SELECT * FROM replies WHERE id = $1',
      values: [id],
    });

    return { replies };
  },

  async deleteReply(id) {
    await pool.query({
      text: 'UPDATE replies SET is_delete = $1 WHERE id = $2',
      values: [true, id],
    });
  },

  async cleanTable() {
    await pool.query('DELETE FROM replies');
  },
};
module.exports = RepliesTableTestHelper;
