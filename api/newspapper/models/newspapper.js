"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#lifecycle-hooks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    afterCreate(data) {
      // console.log(io.rooms);
      // console.log("STRAPI IO", strapi.io);
      strapi.io.to(`room-news`).emit("newNews", {
        ...data,
      });
      // console.log("before creste a newspapper", data);
    },
  },
};
