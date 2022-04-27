const RegisterComment = require('../../../Domains/comments/entities/RegisterComment');
const RegisteredComment = require('../../../Domains/comments/entities/RegisteredComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
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
    const mockCommentRepository = new CommentRepository();

    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve());
    mockCommentRepository.addComment = jest.fn(() => Promise.resolve(new RegisteredComment({
      id: 'comment-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    })));

    const addCommentUseCase = new AddCommentUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const registeredComment = await addCommentUseCase.execute(useCasePayload);

    expect(registeredComment).toStrictEqual(expectedRegisteredComment);
    expect(mockThreadRepository.verifyThreadById).toBeCalledWith({
      threadId: useCasePayload.threadId,
    });
    expect(mockCommentRepository.addComment).toBeCalledWith(new RegisterComment(useCasePayload));
  });
});
