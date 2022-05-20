const ReturnedComment = require('../../Domains/comments/entities/ReturnedComment');
const ReturnedThread = require('../../Domains/threads/entities/ReturnedThread');

class GetThreadUseCase {
  constructor({
    threadRepository, commentRepository, replyRepository, likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    const thread = await this._threadRepository.getThreadById(useCasePayload);
    const comments = await this._commentRepository.getCommentsByThreadId(useCasePayload);

    const commentsWithRepliesPromises = comments.map(async (comment) => {
      const replies = await this._replyRepository.getRepliesByCommentId({
        commentId: comment.id,
      });

      const likeCount = await this._likeRepository.getLikeCountByCommentId({
        commentId: comment.id,
      });

      if (replies.length > 0) return new ReturnedComment({ ...comment, replies, likeCount });
      return new ReturnedComment({ ...comment, likeCount });
    });

    const commentsWithReplies = await Promise.all(commentsWithRepliesPromises);

    return new ReturnedThread({ ...thread, comments: commentsWithReplies });
  }
}

module.exports = GetThreadUseCase;
