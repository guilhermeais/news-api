"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */
const NewsAPI = require("newsapi");
const { key } = require("../utils/NewsAPIKey");
const newsapi = new NewsAPI(key);
const moment = require("moment");
const Newspapper = require("../utils/Newspapper");

module.exports = {
  async find({ request }) {
    const { id } = request.query;
    const newspapperService = strapi.query("newspapper");
    return newspapperService.find({
      id: id || null,
      _sort: "publishedAt:desc",
    });
  },
  async fetch({ request }) {
    let { to, from } = request.query;
    console.log(to, from);
    const knex = strapi.connections.default;
    const newspapperService = strapi.query("newspapper");
    const pageSize = 100;

    console.log("i'm running at every 25 minutes");
    try {
      // let lastPublishedAt =
      //   (await knex("newspappers").max("publishedAt").first()).max ||
      //   Date.now();

      // lastPublishedAt = moment(lastPublishedAt)
      //   .add(1, "second")
      //   .format("YYYY-MM-DD HH:mm:ss");

      // console.log(lastPublishedAt);
      // console.log(moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"));
      let allNewspappers = [];
      const news = await newsapi.v2.everything({
        q: "bitcoin",
        to,
        from,
        language: "pt",
        sortBy: "publishedAt",

        page: 1,
        pageSize,
      });
      allNewspappers.push(...news.articles);
      const totalPages = Math.floor(news.totalResults / pageSize);
      console.log(totalPages);
      if (totalPages > 1) {
        for (let i = 2; i <= totalPages; i++) {
          const { articles } = await newsapi.v2.everything({
            q: "bitcoin",
            from: lastPublishedAt,
            to,
            from,
            language: "pt",
            sortBy: "publishedAt",
            page: i,
            pageSize,
          });

          allNewspappers.push(...articles);
        }
      }
      allNewspappers = allNewspappers.filter(
        (x, i) => allNewspappers.findIndex((y) => y.title == x.title) === i
      );

      for (const news of allNewspappers) {
        const newspapper = Newspapper(news);
        await newspapperService.create(newspapper);
      }
    } catch (error) {
      console.log("some error ocurred", error);
    }
  },

  async fetch2({ request }) {
    let { to, from } = request.query;
    const knex = strapi.connections.default;
    const newspapperService = strapi.query("newspapper");
    const pageSize = 100;

    console.log("i'm running at every 30 minutes");

    try {
      let lastPublished =
        (await knex("newspappers").max("publishedAt").first()).max ||
        Date.now();

      lastPublished = moment(lastPublished).format("YYYY-MM-DD HH:mm:ss");

      // console.log(lastPublished);
      const articles24HoursBefore = await knex("newspappers").where(
        "publishedAt",
        ">=",
        moment(lastPublished).subtract(24, "hour").format("YYYY-MM-DD HH:mm:ss")
      );
      // console.log("article24HoursBefore", articles24HoursBefore);

      let allNewspappers = [];
      const news = await newsapi.v2.everything({
        q: "bitcoin",
        from: from ? from : lastPublished,
        to,
        language: "pt",
        sortBy: "publishedAt",
        page: 1,
        pageSize,
      });
      allNewspappers.push(...news.articles);
      const totalPages = Math.floor(news.totalResults / pageSize);
      // console.log(totalPages);
      if (totalPages > 1) {
        for (let i = 2; i <= totalPages; i++) {
          const { articles } = await newsapi.v2.everything({
            q: "bitcoin",
            from: from ? from : lastPublished,
            to,
            language: "pt",
            sortBy: "publishedAt",
            page: i,
            pageSize,
          });

          allNewspappers.push(...articles);
        }
      }
      allNewspappers = allNewspappers.filter(
        (x, i) => allNewspappers.findIndex((y) => y.title == x.title) === i
      );
      // console.log(allNewspappers);
      for (const news of allNewspappers) {
        const newspapper = Newspapper(news);
        if (
          !articles24HoursBefore.some(
            (article) => article.hash == newspapper.hash
          )
        ) {
          await newspapperService.create(newspapper);
        }
      }
    } catch (error) {
      console.log("some error ocurred", error);
    }
  },
  async testNotification() {
    const newspapperService = strapi.query("newspapper");
    const newspapper = Newspapper({
      title: "teste socketio notification",
      description: "lorem ipsum",
      url: "https://livecoins.com.br/empresas-listadas-na-bolsa-apostam-no-mercado-de-nft/",
      urlToImage:
        "https://livecoins.com.br/wp-content/uploads/2021/09/Plataformas-NFT-e-Ethereum-empresas.jpg",
      publishedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
    });
    await newspapperService.create(newspapper);
  },
};
