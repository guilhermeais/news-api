"use strict";

/**
 * Cron config that gives you an opportunity
 * to run scheduled jobs.
 *
 * The cron format consists of:
 * [SECOND (optional)] [MINUTE] [HOUR] [DAY OF MONTH] [MONTH OF YEAR] [DAY OF WEEK]
 *
 * See more details here: https://strapi.io/documentation/developer-docs/latest/setup-deployment-guides/configurations.html#cron-tasks
 */
const NewsAPI = require("newsapi");
const { key } = require("../../api/newspapper/utils/NewsAPIKey");
const newsapi = new NewsAPI(key);
const moment = require("moment");
const Newspapper = require("../../api/newspapper/utils/Newspapper");

module.exports = {
  // segunda forma
  "* */30 * * * *": async () => {
    const knex = strapi.connections.default;
    const newspapperService = strapi.query("newspapper");
    const pageSize = 100;

    console.log("i'm running at every 30 minutes");

    try {
      let lastPublished =
        (await knex("newspappers").max("publishedAt").first()).max ||
        Date.now();

      lastPublished = moment(lastPublished).format("YYYY-MM-DD HH:mm:ss");

      const articles24HoursBefore = await knex("newspappers").where(
        "publishedAt",
        ">=",
        moment(lastPublished).subtract(24, "hour").format("YYYY-MM-DD HH:mm:ss")
      );

      let allNewspappers = [];
      const news = await newsapi.v2.everything({
        q: "bitcoin",
        from: lastPublished,
        language: "pt",
        sortBy: "publishedAt",
        page: 1,
        pageSize,
      });
      allNewspappers.push(...news.articles);
      const totalPages = Math.floor(news.totalResults / pageSize);

      if (totalPages > 1) {
        for (let i = 2; i <= totalPages; i++) {
          const { articles } = await newsapi.v2.everything({
            q: "bitcoin",
            from: lastPublished,
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
};
