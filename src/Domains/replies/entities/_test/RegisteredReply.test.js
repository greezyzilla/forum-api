const RegisteredReply = require('../RegisteredReply');

describe('a RegisteredReply entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'sebuah balasan',
      owner: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    expect(() => new RegisteredReply(payload)).toThrowError('REGISTERED_REPLY.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      content: 'sebuah balasan',
      owner: {},
    };

    expect(() => new RegisteredReply(payload)).toThrowError('REGISTERED_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registeredReply object correctly', () => {
    const payload = {
      id: 'reply-123',
      content: 'sebuah balasan',
      owner: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    const registeredReply = new RegisteredReply(payload);

    expect(registeredReply.id).toEqual(payload.id);
    expect(registeredReply.content).toEqual(payload.content);
    expect(registeredReply.owner).toEqual(payload.owner);
  });
});
