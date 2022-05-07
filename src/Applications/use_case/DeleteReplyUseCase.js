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
    await this._replyRepository.verifyReplyOwner({ replyId, userId });
    await this._replyRepository.deleteReply({ replyId });
  }
}

module.exports = DeleteCommentReplyUseCase;
