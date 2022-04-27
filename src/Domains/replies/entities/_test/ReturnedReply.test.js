const ReturnedReply = require('../ReturnedReply');

describe('a ReturnedReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      username: 'mawar',
    };

    expect(() => new ReturnedReply(payload)).toThrowError('RETURNED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'sebuah balasan',
      username: 'mawar',
      date: 1234567890,
    };

    expect(() => new ReturnedReply(payload)).toThrowError('RETURNED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create returnedReply object correctly when reply is not deleted', () => {
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      username: 'mawar',
      date: '2022-04-21T07:45:35.761Z',
    };

    const {
      id, content, username, date, isDelete,
    } = new ReturnedReply(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toEqual(payload.content);
    expect(date).toEqual(payload.date);
    expect(isDelete).not.toBeDefined();
  });

  it('should create returnedReply object correctly when reply is deleted', () => {
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      username: 'mawar',
      date: '2022-04-21T07:45:35.761Z',
      isDelete: true,
    };

    const {
      id, content, username, date, isDelete,
    } = new ReturnedReply(payload);

    expect(id).toEqual(payload.id);
    expect(username).toEqual(payload.username);
    expect(content).toStrictEqual('**balasan telah dihapus**');
    expect(date).toEqual(payload.date);
    expect(isDelete).not.toBeDefined();
  });
});
