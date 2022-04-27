class ReturnedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, username, date, replies, isDelete = false,
    } = payload;

    this.id = id;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.username = username;
    this.date = date;
    this.replies = replies;
  }

  _verifyPayload({
    id, content, username, date, replies,
  }) {
    if (!id
      || !content
      || !username
      || !date
      || replies === undefined) {
      throw new Error('RETURNED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
        || typeof content !== 'string'
        || typeof username !== 'string'
        || typeof date !== 'string'
        || typeof replies !== 'object'
    ) {
      throw new Error('RETURNED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReturnedComment;
