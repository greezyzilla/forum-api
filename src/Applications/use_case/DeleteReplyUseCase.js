class DeleteCommentReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute({
    threadId, commentId, replyId, userId,
  }) {
    await this._threadRepository.verifyThreadById({ threadId });
    await this._commentRepository.verifyCommentById({ commentId });
    return this._replyRepository.deleteReply({ replyId, userId });
  }
}

module.exports = DeleteCommentReplyUseCase;
