const ReturnedComment = require('../../Domains/comments/entities/ReturnedComment');
const ReturnedThread = require('../../Domains/threads/entities/ReturnedThread');

/* eslint-disable no-await-in-loop */
class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadById(useCasePayload);

    const comments = [];
    for (let i = 0; i < thread.comments.length; i += 1) {
      const comment = await this._commentRepository.getCommentById({
        commentId: thread.comments[i].commentId,
      });

      const replies = [];
      for (let j = 0; j < comment.replies.length; j += 1) {
        const reply = await this._replyRepository.getReplyById({
          replyId: comment.replies[j].replyId,
        });

        replies.push(reply);
      }

      comments.push(new ReturnedComment({ ...comment, replies }));
    }

    return new ReturnedThread({ ...thread, comments });
  }
}

module.exports = GetThreadUseCase;
