const RegisterCommentReply = require('../../../Domains/threads/entities/RegisterCommentReply');
const RegisteredCommentReply = require('../../../Domains/threads/entities/RegisteredCommentReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const AddCommentReplyUseCase = require('../AddCommentReplyUseCase');

describe('AddCommentReplyUseCase', () => {
  it('should orchestrating the add comment reply action correctly', async () => {
    const useCasePayload = {
      content: 'dicoding',
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const expectedRegisteredReply = new RegisteredCommentReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    });

    const mockThreadRepository = new ThreadRepository();

    mockThreadRepository.addCommentReply = jest.fn()
      .mockImplementation(() => Promise.resolve(expectedRegisteredReply));

    const addCommentReplyUseCase = new AddCommentReplyUseCase({
      threadRepository: mockThreadRepository,
    });

    const registeredReply = await addCommentReplyUseCase.execute(useCasePayload);
    expect(registeredReply).toStrictEqual(expectedRegisteredReply);
    expect(mockThreadRepository.addCommentReply)
      .toBeCalledWith(new RegisterCommentReply(useCasePayload));
  });
});
