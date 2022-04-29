/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addComment({
    id = 'comment-123',
    content = 'sebuah komentar',
    date = new Date().toISOString(),
    threadId = 'thread-123',
    userId = 'user-123',
  }) {
    await pool.query({
      text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, date, threadId, userId, false],
    });
  },

  async findCommentById(id) {
    const { rows: comments } = await pool.query({
      text: 'SELECT * FROM comments WHERE id = $1',
      values: [id],
    });
    return { comments };
  },

  async deleteComment(id) {
    await pool.query({
      text: 'UPDATE comments SET is_delete = $1 WHERE id = $2',
      values: [true, id],
    });
  },

  async cleanTable() {
    await pool.query('DELETE FROM comments');
  },
};

module.exports = CommentsTableTestHelper;
