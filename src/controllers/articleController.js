/* eslint-disable max-len */
/* eslint-disable no-unused-expressions */
/* eslint-disable require-jsdoc */
import model from '../models';
import searchUserHelper from './helpers/searchUserHelper';
import searchArticlesHelper from './helpers/searchArticlesHelper';
import eventEmitter from '../template/notifications/EventEmitter';
import findUser from '../helpers/FindUser';
import readTime from './helpers/read_time';
import createSlug from './helpers/createSluge';
import { getHightlights, updateHightlights } from './helpers/highlightHelper';
import { getAllArticles, articlePagination } from './helpers/getAllArticlesHelper';
import ReadingStatsHelper from './helpers/readingStatsHelper';


const { Articles, User } = model;

class articleContoller {
  static async createArticle(req, res) {
    const {
      title,
      body,
      description,
      image,
      tags
    } = req.body;
    const ReadTime = readTime(req.body.body);
    const tagList = tags ? tags.split(',') : [];
    const slug = createSlug(title);
    const user = await User.findOne({ where: { email: req.user.email } });
    const userInfo = await findUser(req.user.username);
    let article;
    user
      ? article = await Articles.create({ slug,
        title,
        description,
        body,
        image,
        tagList,
        readtime: ReadTime,
        authorId: user.id, })
      : res.status(401).json({ status: 401, message: "User not allowed to create an article, login or signin if you don't have an account" });
    eventEmitter.emit('publishArticle', userInfo.id, slug);
    article && res.status(201).json({ status: 201, message: 'The article successfully created!' });
  }

  static async updateArticle(req, res) {
    const {
      title,
      body,
      description,
      image,
      tags
    } = req.body;
    if (req.body.body) {
      const tagList = tags ? tags.split(',') : [];
      const slug = createSlug(title || req.article.title);
      const newReadTime = readTime(req.body.body);
      const updatedArticle = await Articles.update({ id: req.article.id,
        slug,
        title: title || req.article.title,
        description: description || req.article.description,
        body: body || req.article.body,
        image: image || req.article.image,
        readtime: newReadTime,
        tagList,
        authorId: req.user.id }, { where: { id: req.params.id } });
      updatedArticle && res.status(200).json({ status: 200, message: 'The article successfully updated!' });
    } else {
      res.status(404).json({ status: 404, message: 'article doenot have either title, description or body' });
    }
  }

  static async getArticle(req, res) {
    try {
      const articleId = req.params.id;
      const article = await Articles.findOne({ where: { id: articleId } });
      const highlight = await getHightlights(articleId);
      const author = await User.findOne({ where: { id: article.authorId } });
      if (article) {
        await ReadingStatsHelper.updateStatistic(req.params.id);
        if (highlight) {
          await updateHightlights(req.params.id);
          //    return res.status(200).json({ article, highlight });
        }
        return res.status(200).json({ status: 200,
          article: { slug: article.slug,
            title: article.title,
            description: article.description,
            body: article.body,
            tagList: article.tagList,
            createdAt: article.createdAt,
            updatedAt: article.updatedAt,
            author: { username: author.username,
              bio: author.bio,
              image: author.image,
              following: author.following },
            highlight } });
      }
    } catch (error) {
      return res.status(404).json({ status: 404, message: error.message });
    }
  }

  static async getArticleSlug(req, res) {
    try {
      const article = await Articles.findOne({ where: { slug: req.params.slug } });
      if (article) return res.status(200).json({ status: 200, article });
      res.status(404).json({ status: 404, message: 'No article found!' });
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'Internal Server error', });
    }
  }

  static async deleteArticle(req, res) {
    try {
      const article = await Articles.findOne({ where: { id: req.params.id } });

      let deletedArticle;
      article && (deletedArticle = await Articles.destroy({ where: { id: req.params.id }, returning: true }));
      if (deletedArticle) return res.status(200).json({ status: 200, message: 'Article Succesfully deleted!' });

      return res.status(404).json({ status: 404, message: 'Article not found!', });
    } catch (error) {
      return res.status(500).json({ status: 500, message: 'The parameter should be a number!', });
    }
  }

  static async share(req, res) {
    return res.status(200).json({ message: 'Thanks for sharing!',
      article: req.article });
  }

  static async searchArticles(req, res) {
    Object.keys(req.query).length === 0 && res.status(400).json({ status: 400, message: req.query });
    const { authorName, tag, keyword, title } = req.query;

    if (!authorName && !tag && !keyword && !title) return res.status(400).json({ status: 400, message: 'Bad request' });

    let user = [];
    if (authorName) user = await searchUserHelper(authorName);
    const data = await searchArticlesHelper(tag, keyword, title, user);

    return data.length ? res.status(200).json({ status: 200, data }) : res.status(404).json({ status: 404, message: 'No data found' });
  }


  static async getArticles(req, res) {
    (req.query.offset && req.query.limit)
      ? await articlePagination(req, res)
      : await getAllArticles(req, res);
  }
}
export default articleContoller;
