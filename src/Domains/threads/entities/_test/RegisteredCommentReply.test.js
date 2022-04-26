const RegisteredCommentReply = require('../RegisteredCommentReply');

describe('a RegisteredCommentReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'sebuah balasan',
      owner: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    expect(() => new RegisteredCommentReply(payload)).toThrowError('REGISTERED_COMMENT_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'sebuah balasan',
      owner: {},
    };

    expect(() => new RegisteredCommentReply(payload)).toThrowError('REGISTERED_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registeredCommentReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    const registeredCommentReply = new RegisteredCommentReply(payload);

    expect(registeredCommentReply.id).toEqual(payload.id);
    expect(registeredCommentReply.content).toEqual(payload.content);
    expect(registeredCommentReply.owner).toEqual(payload.owner);
  });
});
