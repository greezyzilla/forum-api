const RegisterComment = require('../RegisterComment');

describe('a RegisterComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      threadId: 'thread-Vlzv2qVRPnoPIMrohbYMF',
      userId: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    expect(() => new RegisterComment(payload)).toThrowError('REGISTER_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      threadId: 'thread-Vlzv2qVRPnoPIMrohbYMF',
      userId: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    expect(() => new RegisterComment(payload)).toThrowError('REGISTER_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registerComment object correctly', () => {
    const payload = {
      content: 'sebuah komentar',
      threadId: 'thread-Vlzv2qVRPnoPIMrohbYMF',
      userId: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    const { content, threadId, userId } = new RegisterComment(payload);

    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.threadId);
    expect(userId).toEqual(payload.userId);
  });
});
