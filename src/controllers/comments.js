import models from '../models';
import eventEmitter from '../template/notifications/EventEmitter';

const { Comments, Articles, User, CommentsHistories } = models;

const commentHistoryCreate = async (req, findComent) => {
  CommentsHistories.create({ userId: req.user.id,
    editedComment: findComent.dataValues.body,
    commentId: findComent.dataValues.id });
  return commentHistoryCreate;
};

/**
 * @description CRUD for comments
 * @author: Patrick Ngabonziza
 */
export default class ArticleComment {
  /**
     * @param {Object} req
     * @param {Object} res
     * @returns {Object} Add comment
     */
  static async createComment(req, res) {
    try {
      const { body } = req.body;
      const { articleId } = req.params;
      const createComment = await Comments.create({ body, articleId, userId: req.user.id });
      eventEmitter.emit('commentArticle', createComment.dataValues);
      return res.status(201).json({ message: 'comment created!',
        comment: createComment });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Create threaded comments
   */
  static async createThreadComment(req, res) {
    try {
      const { body } = req.body;
      const { articleId, commentId } = req.params;
      const userId = req.user.id;

      const checkIfArticleExists = await Articles.findByPk(articleId);
      if (!checkIfArticleExists) return res.status(404).json({ error: 'Article does not exist' });
      const checkIfCommentExists = await Comments.findByPk(commentId);
      if (!checkIfCommentExists) return res.status(404).json({ error: 'Comment does not exist' });
      const checkUser = await User.findByPk(userId);
      if (!checkUser) return res.status().json({ error: 'User not found' });

      const newThreadedComment = await Comments.create({ userId,
        articleId,
        body,
        parentId: commentId });
      return res.status(201).json({ message: 'Commented under this thread!',
        newThreadedComment });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  /**
     * @param {Object} req
     * @param {Object} res
     * @returns {Object} Edit comment
     */
  static async updateComment(req, res) {
    try {
      const { articleId, commentId } = req.params;
      const findComent = await Comments.findOne({ where: { id: commentId, articleId } });
      return findComent
        ? await Comments.update({ body: req.body.body, edited: true },
          { where: { id: commentId, articleId, userId: req.user.id } })
           && await commentHistoryCreate(req, findComent)
           && res.status(200).json({ message: 'Comment modified!' })
        : res.status(404).json({ message: 'Comment not found!' });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  /**
 * @param {Object} req
 * @param {Object} res
 * @returns {Object} Delete a comment
 */
  static async deleteComment(req, res) {
    try {
      const userId = req.user.id;
      const { articleId, commentId } = req.params;
      const deleteComment = await Comments.destroy({ where: { id: commentId, articleId, userId } });
      return deleteComment
        ? res.status(204).json({ message: 'comment deleted' })
        : res.status(404).json({ message: 'comment not found!' });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }

  /**
   *
   * @param {Object} req
   * @param {Object} res
   * @returns {Object} Get all comments
   */
  static async getAllcomments(req, res) {
    try {
      const allComments = await Comments.findAll({ where: { articleId: req.params.articleId } });
      return allComments.length ? res.status(200).json({ message: 'All Comments', allComments })
        : res.status(404).json({ error: 'No comments found!' });
    } catch (error) {
      return res.status(500).json(error.message);
    }
  }


  /**
   * @description - Users should be able to track edit history
   * @param {Object} req - Request Object
   * @param {Object} res  - Response Object
   * @returns {Object} - Response object
   */
  static async commentHistory(req, res) {
    const { commentId } = req.params;
    const { id } = req.user;
    const findHistory = await CommentsHistories.findAll({ where: { commentId } });
    return findHistory.length
      ? (findHistory[0].dataValues.userId === id) && res.status(200).json({ data: { findHistory } })
      : res.status(404).json({ message: 'No edit history for this comment!' });
  }
}
