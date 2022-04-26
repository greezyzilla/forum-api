const pool = require('../src/Infrastructures/database/postgres/pool');

const ThreadsTableTestHelper = {
  async addThread({
    id = 'thread-123',
    title = 'sebuah thread',
    body = 'sebuah body thread',
    date = new Date().toISOString(),
    owner = 'user-123',
  }) {
    const query = {
      text: 'INSERT INTO threads VALUES($1, $2, $3, $4, $5)',
      values: [id, title, body, date, owner],
    };

    await pool.query(query);
  },

  async findThreadById(id) {
    const { rows: threads } = await pool.query({
      text: 'SELECT * FROM threads WHERE id = $1',
      values: [id],
    });

    return { threads };
  },

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

  async addReply({
    id = 'reply-123',
    content = 'sebuah balasan',
    date = new Date().toISOString(),
    commentId = 'comment-123',
    userId = 'user-123',
  }) {
    await pool.query({
      text: 'INSERT INTO comment_replies VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, user_id as owner',
      values: [id, content, date, commentId, userId, false],
    });
  },

  async findReplyById(id) {
    const { rows: replies } = await pool.query({
      text: 'SELECT * FROM comment_replies WHERE id = $1',
      values: [id],
    });

    return { replies };
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE threads, comments, comment_replies');
  },
};

module.exports = ThreadsTableTestHelper;
