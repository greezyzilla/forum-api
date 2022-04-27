const ReturnedComment = require('../ReturnedComment');

describe('a ReturnedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      username: 'mawar',
      date: '2022-04-21T07:45:35.761Z',
    };

    expect(() => new ReturnedComment(payload)).toThrowError('RETURNED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'sebuah komentar',
      username: 'mawar',
      date: 1234567890,
      replies: 'sebuah balasan',
    };

    expect(() => new ReturnedComment(payload)).toThrowError('RETURNED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create returnedComment object correctly when comment is not deleted', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      username: 'mawar',
      date: '2022-04-21T07:45:35.761Z',
      replies: [],
    };

    const {
      id, content, username, date, replies, isDelete,
    } = new ReturnedComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(replies).toEqual(payload.replies);
    expect(isDelete).not.toBeDefined();
  });

  it('should create returnedComment object correctly when comment is deleted', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      username: 'mawar',
      date: '2022-04-21T07:45:35.761Z',
      replies: [],
      isDelete: true,
    };

    const {
      id, content, username, date, replies, isDelete,
    } = new ReturnedComment(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toStrictEqual('**komentar telah dihapus**');
    expect(date).toEqual(payload.date);
    expect(replies).toEqual(payload.replies);
    expect(isDelete).not.toBeDefined();
  });
});
