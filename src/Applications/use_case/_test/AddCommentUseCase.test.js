const RegisterComment = require('../../../Domains/threads/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/threads/entities/RegisteredComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentUseCase = require('../AddCommentUseCase');

describe('AddCommentUseCase', () => {
  it('should orchestrating the add comment action correctly', async () => {
    const useCasePayload = {
      content: 'sebuah komentar',
      threadId: 'thread-123',
      userId: 'user-123',
    };

    const expectedRegisteredComment = new RegisteredComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addComment = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedRegisteredComment));

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
    });

    const registeredComment = await addCommentUseCase.execute(useCasePayload);

    expect(registeredComment).toStrictEqual(expectedRegisteredComment);
    expect(mockThreadRepository.addComment).toBeCalledWith(new RegisterComment(useCasePayload));
  });
});
