const RegisterReply = require('../../../Domains/replies/entities/RegisterReply');
const RegisteredReply = require('../../../Domains/replies/entities/RegisteredReply');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const ReplyRepository = require('../../../Domains/replies/ReplyRepository');
const AddReplyUseCase = require('../AddReplyUseCase');

describe('AddReplyUseCase', () => {
  it('should orchestrating the add reply action correctly', async () => {
    const useCasePayload = {
      content: 'dicoding',
      threadId: 'thread-123',
      commentId: 'comment-123',
      userId: 'user-123',
    };

    const expectedRegisteredReply = new RegisteredReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockReplyRepository = new ReplyRepository();

    mockThreadRepository.verifyThreadById = jest.fn(() => Promise.resolve);
    mockCommentRepository.verifyCommentById = jest.fn(() => Promise.resolve);
    mockReplyRepository.addReply = jest.fn(() => Promise.resolve(new RegisteredReply({
      id: 'reply-123',
      content: useCasePayload.content,
      owner: useCasePayload.userId,
    })));

    const addReplyUseCase = new AddReplyUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      replyRepository: mockReplyRepository,
    });

    const registeredReply = await addReplyUseCase.execute(useCasePayload);
    expect(registeredReply).toStrictEqual(expectedRegisteredReply);
    expect(mockThreadRepository.verifyThreadById)
      .toBeCalledWith({ threadId: useCasePayload.threadId });
    expect(mockCommentRepository.verifyCommentById)
      .toBeCalledWith({ commentId: useCasePayload.commentId });
    expect(mockReplyRepository.addReply)
      .toBeCalledWith(new RegisterReply(useCasePayload));
  });
});
