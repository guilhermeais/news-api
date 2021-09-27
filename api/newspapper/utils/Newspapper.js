module.exports = function Newspapper({
  title,
  description,
  url,
  urlToImage,
  publishedAt,
}) {
  const titleFormated = title.split(" ").join("");
  const hash = `${titleFormated}_${publishedAt}`;
  return { title, description, url, urlToImage, publishedAt, hash };
};
