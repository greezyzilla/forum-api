const ReturnedComment = require('../../Domains/comments/entities/ReturnedComment');
const ReturnedThread = require('../../Domains/threads/entities/ReturnedThread');

class GetThreadUseCase {
  constructor({ threadRepository, commentRepository, replyRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadById(useCasePayload);
    const comments = await this._commentRepository.getCommentsByThreadId(useCasePayload);

    const commentsWithRepliesPromises = comments.map(async (comment) => {
      const replies = await this._replyRepository.getRepliesByCommentId({
        commentId: comment.id,
      });

      return new ReturnedComment({ ...comment, replies });
    });

    const commentsWithReplies = await Promise.all(commentsWithRepliesPromises);

    return new ReturnedThread({ ...thread, comments: commentsWithReplies });
  }
}

module.exports = GetThreadUseCase;
