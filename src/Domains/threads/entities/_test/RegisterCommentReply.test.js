const RegisterCommentReply = require('../RegisterCommentReply');

describe('a RegisterCommentReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      threadId: 'thread-Vlzv2qVRPnoPIMrohbYMF',
      commentId: 'comment-lBogR5lNV3EXGyRZxIa7g',
      userId: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    expect(() => new RegisterCommentReply(payload)).toThrowError('REGISTER_COMMENT_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      content: 123,
      threadId: 'thread-Vlzv2qVRPnoPIMrohbYMF',
      commentId: 'comment-lBogR5lNV3EXGyRZxIa7g',
      userId: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    expect(() => new RegisterCommentReply(payload)).toThrowError('REGISTER_COMMENT_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registerCommentReply object correctly', () => {
    const payload = {
      content: 'sebuah komentar balasan',
      threadId: 'thread-Vlzv2qVRPnoPIMrohbYMF',
      commentId: 'comment-lBogR5lNV3EXGyRZxIa7g',
      userId: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    const {
      content, threadId, commentId, userId,
    } = new RegisterCommentReply(payload);

    expect(content).toEqual(payload.content);
    expect(threadId).toEqual(payload.threadId);
    expect(commentId).toEqual(payload.commentId);
    expect(userId).toEqual(payload.userId);
  });
});
