const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const GetThreadUseCase = require('../GetThreadUseCase');

describe('GetThreadUseCase', () => {
  it('should orchestrating the get thread action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectedReturnedThread = {
      id: 'thread-123',
      title: 'sebuah thread',
      bodu: 'sebuah body thread',
      date: 'placeholder',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-QgQEQ_pXXa3l3M7j5D_LU',
          username: 'dicoding',
          date: '2022-04-16T07:46:58.542Z',
          content: 'sebuah comment',
          replies: [
            {
              id: 'reply-oXX1V5f_R_pk8Z9w8D0Hv',
              username: 'johndoe',
              date: '2022-04-16T07:47:17.514Z',
              content: '**balasan telah dihapus**',
            },
            {
              id: 'reply-nYB-PmZ8IiNYyLHRotOS-',
              username: 'dicoding',
              date: '2022-04-16T07:47:20.004Z',
              content: 'sebuah balasan',
            },
          ],
        },
      ],
    };

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.getThreadById = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedReturnedThread));

    const getThreadUseCase = new GetThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    const returnedThread = await getThreadUseCase.execute(useCasePayload);

    expect(returnedThread).toStrictEqual(expectedReturnedThread);
    expect(mockThreadRepository.getThreadById).toBeCalledWith(useCasePayload);
  });
});
