class ReturnedThread {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, title, body, date, username, comments,
    } = payload;

    this.id = id;
    this.title = title;
    this.body = body;
    this.date = date;
    this.username = username;
    this.comments = comments;
  }

  _verifyPayload({
    id, title, body, date, username, comments,
  }) {
    if (!id || !title || !body || !date || !username || comments === undefined) {
      throw new Error('RETURNED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
        || typeof title !== 'string'
        || typeof body !== 'string'
        || typeof username !== 'string'
        || typeof date !== 'string'
        || typeof comments !== 'object'
    ) {
      throw new Error('RETURNED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReturnedThread;
