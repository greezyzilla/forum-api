const RegisterThread = require('../RegisterThread');

describe('a RegisterThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'sebuah thread',
      owner: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    expect(() => new RegisterThread(payload)).toThrowError('REGISTER_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: 'sebuah body thread',
      owner: true,
    };

    expect(() => new RegisterThread(payload)).toThrowError('REGISTER_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create registerThread object correctly', () => {
    const payload = {
      title: 'sebuah thread',
      body: 'sebuah body thread',
      owner: 'user-DWrT3pXe1hccYkV1eIAxS',
    };

    const { title, body, owner } = new RegisterThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
