export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/images");

  return {
    dir: { input: "src", includes: "_includes", output: "_site" },
    templateFormats: ["md"],
    markdownTemplateEngine: false,
  };
}
