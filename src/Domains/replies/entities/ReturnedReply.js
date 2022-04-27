class ReturnedReply {
  constructor(payload) {
    this._verifyPayload(payload);

    const {
      id, content, username, date, isDelete = false,
    } = payload;

    this.id = id;
    this.content = isDelete ? '**balasan telah dihapus**' : content;
    this.username = username;
    this.date = date;
  }

  _verifyPayload({
    id, content, username, date,
  }) {
    if (!id || !content || !username || !date) {
      throw new Error('RETURNED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (
      typeof id !== 'string'
      || typeof content !== 'string'
      || typeof username !== 'string'
      || typeof date !== 'string'
    ) {
      throw new Error('RETURNED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReturnedReply;
