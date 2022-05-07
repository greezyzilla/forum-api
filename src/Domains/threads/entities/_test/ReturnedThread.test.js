const ReturnedThread = require('../ReturnedThread');

describe('a ReturnedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2022-04-21T07:45:35.761Z',
    };

    expect(() => new ReturnedThread(payload)).toThrowError('RETURNED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: true,
      username: 'mawar',
    };

    expect(() => new ReturnedThread(payload)).toThrowError('RETURNED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create returnedThread object correctly without comment', () => {
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2022-04-21T07:45:35.761Z',
      username: 'mawar',
    };

    const {
      id, title, body, date, username, comments,
    } = new ReturnedThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toBeUndefined();
  });

  it('should create returnedThread object correctly with comment', () => {
    const payload = {
      id: 'thread-123',
      title: 'sebuah thread',
      body: 'sebuah body thread',
      date: '2022-04-21T07:45:35.761Z',
      username: 'mawar',
      comments: [
        {
          id: 'comment-123',
          content: 'sebuah komentar',
          username: 'melati',
          date: '2022-04-21T07:45:37.761Z',
        },
      ],
    };

    const {
      id, title, body, date, username, comments,
    } = new ReturnedThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(date).toEqual(payload.date);
    expect(username).toEqual(payload.username);
    expect(comments).toStrictEqual(payload.comments);
  });
});
