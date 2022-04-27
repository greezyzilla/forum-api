const RegisterComment = require('../../Domains/comments/entities/RegisterComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    await this._threadRepository.verifyThreadById({ threadId: useCasePayload.threadId });
    const registerComment = new RegisterComment(useCasePayload);

    return this._commentRepository.addComment(registerComment);
  }
}

module.exports = AddCommentUseCase;
