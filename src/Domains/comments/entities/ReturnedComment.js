class ReturnedComment {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, username, date, replies = [], isDelete = false, likeCount = 0,
    } = payload;

    this.id = id;
    this.content = isDelete ? '**komentar telah dihapus**' : content;
    this.username = username;
    this.date = date;
    this.likeCount = likeCount;

    if (replies.length > 0) this.replies = replies;
  }

  _verifyPayload({
    id, content, username, date,
  }) {
    if (!id
      || !content
      || !username
      || !date) {
      throw new Error('RETURNED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
        || typeof content !== 'string'
        || typeof username !== 'string'
        || typeof date !== 'string'
    ) {
      throw new Error('RETURNED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReturnedComment;
