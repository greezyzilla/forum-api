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

  async cleanTable() {
    await pool.query('DELETE FROM threads');
  },
};

module.exports = ThreadsTableTestHelper;
