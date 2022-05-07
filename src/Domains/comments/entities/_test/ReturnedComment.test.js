const ReturnedComment = require('../ReturnedComment');

describe('a ReturnedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      username: 'mawar',
    };

    expect(() => new ReturnedComment(payload)).toThrowError('RETURNED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'sebuah komentar',
      username: 'mawar',
      date: 1234567890,
    };

    expect(() => new ReturnedComment(payload)).toThrowError('RETURNED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create returnedComment object correctly when comment is not deleted', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      username: 'mawar',
      date: '2022-04-21T07:45:35.761Z',
    };

    const {
      id, content, username, date, isDelete,
    } = new ReturnedComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(isDelete).toBeUndefined();
  });

  it('should create returnedComment object correctly when comment is deleted', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      username: 'mawar',
      date: '2022-04-21T07:45:35.761Z',
      isDelete: true,
    };

    const {
      id, content, username, date, isDelete,
    } = new ReturnedComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toStrictEqual('**komentar telah dihapus**');
    expect(date).toEqual(payload.date);
    expect(isDelete).toBeUndefined();
  });

  it('should create returnedComment object correctly when has replies', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      username: 'mawar',
      date: '2022-04-21T07:45:35.761Z',
      isDelete: false,
      replies: [
        {
          id: 'reply-123',
          content: 'sebuah balasan',
          username: 'melati',
          date: '2022-04-21T07:45:37.761Z',
          isDelete: false,
        },
      ],
    };

    const {
      id, content, username, date, isDelete, replies,
    } = new ReturnedComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toStrictEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(isDelete).toBeUndefined();
    expect(replies).toStrictEqual(payload.replies);
  });
});
