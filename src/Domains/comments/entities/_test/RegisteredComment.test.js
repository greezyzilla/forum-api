const RegisteredComment = require('../RegisteredComment');

describe('a RegisteredComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'sebuah komentar',
      owner: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    expect(() => new RegisteredComment(payload)).toThrowError('REGISTERED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'sebuah komentar',
      owner: {},
    };

    expect(() => new RegisteredComment(payload)).toThrowError('REGISTERED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registeredComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'sebuah komentar',
      owner: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    const registeredComment = new RegisteredComment(payload);

    expect(registeredComment.id).toEqual(payload.id);
    expect(registeredComment.content).toEqual(payload.content);
    expect(registeredComment.owner).toEqual(payload.owner);
  });
});
