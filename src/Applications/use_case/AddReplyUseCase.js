const RegisterReply = require('../../Domains/replies/entities/RegisterReply');

class AddCommentReplyUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadById({ threadId: useCasePayload.threadId });
    await this._commentRepository.verifyCommentById({ commentId: useCasePayload.commentId });
    const registerReply = new RegisterReply(useCasePayload);

    return this._replyRepository.addReply(registerReply);
  }
}

module.exports = AddCommentReplyUseCase;
