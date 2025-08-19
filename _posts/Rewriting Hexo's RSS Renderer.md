---
title: Rewriting Hexo's RSS Renderer
author: Will Kelly
date: 2025-05-03
tags: Web
---

### Background

I have a blog on the side which is anonymous, which I host using Hexo. I recently downloaded an RSS reader to read all the Substacks I like, and added my own site's; but I noticed that my RSS was buggy, with still-encoded HTML text, and without header images. Clearly the default Hexo RSS renderer package was buggy and not rubust, so it was time for me to take a personal look at it.

The default Hexo RSS renderer is an npm package called [hexo-feed](https://github.com/sergeyzwezdin/hexo-feed), inside of which most of the leg work is done by a file called base.js, given here: 

```JS
const { magenta } = require('chalk');

const path = require('path');

const generateFeed = (render, type, posts, tags, categories, config, renderOptions, context, output, order_by, limit, helpers, log) => {
    log.debug(`Generating ${type}: %s`, magenta(output));

    const publishedPosts = posts
        .filter((post) => post.draft !== true)
        .filter((post) => post.published === undefined || post.published === true);

    const lastPublishedPost = publishedPosts.sort('-date').first();
    const lastPublishedPostDate = lastPublishedPost ? lastPublishedPost.date : helpers.moment();

    let postsToRender = publishedPosts.sort(order_by || config.feed.order_by || '-date');

    if (limit) {
        postsToRender = postsToRender.limit(limit);
    }

    return render
        .render(renderOptions, {
            ...helpers,
            ...{
                tag: undefined,
                category: undefined,
                ...context
            },
            lastBuildDate: lastPublishedPostDate,
            posts: postsToRender.toArray(),
            tags: tags.toArray(),
            categories: categories.toArray(),
            config: config
        })
        .then((content) => {
            log.debug(`${type} generated: %s`, magenta(output));

            return [
                {
                    path: output,
                    data: content
                }
            ];
        });
};

const baseGenerator = (type, hexo, generatorConfig, packageTemplateName, { posts, tags, categories }) => {
    const { config, render, log } = hexo;
    const { template, output, order_by, limit } = config.feed[generatorConfig];
    const { tag_dir, category_dir } = config.feed;

    const isTagGeneratingEnabled = Boolean(tag_dir);
    const isCategoryGeneratingEnabled = Boolean(category_dir);

    const helpers = Object.keys(hexo.extend.helper.store).reduce((result, name) => {
        result[name] = hexo.extend.helper.get(name).bind({ ...hexo, page: {} });
        return result;
    }, {});

    const itemCount = limit || config.feed.limit;

    const renderOptions = template ? { path: template } : { path: path.resolve(__dirname, '../templates', packageTemplateName) };

    const postsByTag = isTagGeneratingEnabled
        ? tags
              .toArray()
              .map(({ name }) =>
                  String(name || '')
                      .trim()
                      .toLowerCase()
              )
              .map((tagName) => ({
                  type: `${type} (tag: ${tagName})`,
                  context: {
                      tag: tagName
                  },
                  posts: posts.filter(
                      (post) =>
                          post.tags
                              .toArray()
                              .map(({ name }) =>
                                  String(name || '')
                                      .trim()
                                      .toLowerCase()
                              )
                              .indexOf(tagName) !== -1
                  ),
                  output: path.join(tag_dir, tagName, output)
              }))
        : [];

    const postsByCategory = isCategoryGeneratingEnabled
        ? categories
              .toArray()
              .map(({ name }) =>
                  String(name || '')
                      .trim()
                      .toLowerCase()
              )
              .map((categoryName) => ({
                  type: `${type} (category: ${categoryName})`,
                  context: {
                      category: categoryName
                  },
                  posts: posts.filter(
                      (post) =>
                          post.categories
                              .toArray()
                              .map(({ name }) =>
                                  String(name || '')
                                      .trim()
                                      .toLowerCase()
                              )
                              .indexOf(categoryName) !== -1
                  ),
                  output: path.join(category_dir, categoryName, output)
              }))
        : [];

    return Promise.all([
        generateFeed(render, type, posts, tags, categories, config, renderOptions, {}, output, order_by, itemCount, helpers, log),
        ...postsByTag.map(({ type, context, posts, output }) =>
            generateFeed(render, type, posts, tags, categories, config, renderOptions, context, output, order_by, itemCount, helpers, log)
        ),
        ...postsByCategory.map(({ type, context, posts, output }) =>
            generateFeed(render, type, posts, tags, categories, config, renderOptions, context, output, order_by, itemCount, helpers, log)
        )
    ]).then((results) => results.reduce((result, current) => [...result, ...current], []));
};

module.exports = { baseGenerator };
```

### Problem 1: Escaped HTML

The first problem was HTML-escaped text. In the body of the text, I would see lines like this at the beginning of the file:

>&lt;link rel=&#34;stylesheet&#34; class=&#34;aplayer-secondary-style-marker&#34; href=&#34;/assets/css/APlayer.min.css&#34;&gt;&lt;script src=&#34;/assets/js/APlayer.min.js&#34; class=&#34;aplayer-secondary-script-marker&#34;&gt;&lt;/script&gt;&lt;p&gt;&lt;img src=&#34;/image-url.jpg&#34; alt=&#34;Image title&#34;&gt;&lt;/p&gt; &lt;p&gt; Article content article content article content ...

Obviously "&lt;" is an encoded version of the Less Than symbol, and "&gt;" is a Greater Than, showing the \<brackets\> surrounding HTML tags. "&#34;" is obviously either a single or double quotation mark. There were HTML-escaped characters left in the output, which is often done by browsers when transferring HTML characters for reasons of code safety to prevent XSS attacks, but which for my purposes was ruining the output of my article. What's worse is that the entire article content was escaped like this, which a smart reader app would be able to parse, but which might confuse a dumb one.

The solution was annoyingly simple, even though I first spent time tracing the HTML escaping process through the code of base.js: all RSS data was eventually fitted into a template that was hardcoded.

```rss.ejs
<?xml version="1.0"?>
<rss version="2.0">
    <channel>
        <title><%= config.title %><%= tag ? ` • Posts by "${tag}" tag` : '' %><%= category ? ` • Posts by "${category}" category` : '' %></title>
        <description><%= config.description %></description>
        <language><%= config.language %></language>
        <pubDate><%= moment(lastBuildDate).locale('en').format('ddd, DD MMM YYYY HH:mm:ss ZZ') %></pubDate>
        <lastBuildDate><%= moment(lastBuildDate).locale('en').format('ddd, DD MMM YYYY HH:mm:ss ZZ') %></lastBuildDate>
        <%_ for (const { name } of (tags || [])) { _%>
        <category><%= name %></category>
        <%_ } _%>
        <%_ for (const post of posts) { _%>
        <item>
            <guid isPermalink="true"><%= post.permalink %></guid>
            <title><%= post.title %></title>
            <link><%= post.permalink %></link>
            <%_ for (const tag of (post.tags ? post.tags.toArray() : [])) { _%>
            <category><%= tag.name %></category>
            <%_ } _%>
            <pubDate><%= moment(post.date).locale('en').format('ddd, DD MMM YYYY HH:mm:ss ZZ') %></pubDate>
            <description><![CDATA[ <%= post.content %> ]]></description>
        </item>
        <%_ } _%>
    </channel>
</rss>
```

You'll notice this isn't regular XML—it's EJS, a form of XML but where anything inside of a <% %> tag pair is run as Javascript. My solution was found at the fifth-to-last line, where it says <%= post.content %>. In EJS, you have three ways to begin a line: with <%, <%-, or <%=.

<%     runs the JS inside, with no output.
<%-   runs the JS, tells EJS to render the output as **unescaped** HTML.
<%=   runs the JS, tells EJS to render the output as **escaped** HTML.

My lines of **escaped** HTML could be solved by **unescaping** them, i.e. changing the equals sign in that one line to a dash.

><%= post.content %>    --->    <%- post.content %>

### Problem 2: HTML in my Article

Why was there HTML in my article to begin with? One tag was for the header image that I wanted to keep there anyway, but there was also a tag for the stylesheet and for a script? Where did those come from?

I could've found a very involved solution, but instead I chose to put in a quick fix. I would manually remove any HTML tags I found using a RegEx, based on a list of tags I would provide. So the \<img ... \> tag would stay in, but the \<link ... \> tag would be removed. I wrote this snippet:

```JS
postsToRender.forEach(post => {
	// This is a filter to remove stray HTML tags that made their way into the post content.
	const blockedTags = ['script', 'link'];
	const tagPattern = new RegExp(
	`<(?:${blockedTags.join('|')})\\b[^>]*>(?:[^]*?<\\/\\s*(?:${blockedTags.join('|')})\\s*>|)`,
	'gi'
	);
	post.content = post.content.replace(tagPattern, '');
	});
```

I put this code in the "preprocessing" section of base.js, after the if (limit) statement. This deleted every \<script\> and \<\link\> tag in the article body. If I ever want to have a script in the middle of my article, or put in an XML link tag, then I'll have another problem to solve later, but for now this works to my satisfaction.

### Problem 3: I Want a Header Image

Many RSS readers show a header image, not based on any image located in the article body, but based on an XML \<enclosure\> tag which specifies the location of a piece of media associated with the article. My default Hexo reader didn't account for this. I also didn't want to manually specify an image in the post's metadata. I wanted to fetch the first image that appears in the article body and use that as my enclosure image.

I could do this by adding a new metadata element called *enclosure* to the JS *post* object, which is a JSON. First I fetch the post content, then I scan it with a regex until I find a \<img\> tag, and if found, I take the image's URL and store it in the post's metadata along with the image's type.

```JS
postsToRender.forEach(post => {
	// This section will extract the first image found in the post and add it as an <enclosure> tag to the RSS item.
	const content = post.content || '';
	
	// Extract first image
	const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
	const imageURL = imgMatch ? imgMatch[1] : null;
	
	if (imageURL) {
		const imageType = imageURL.endsWith('.png') ? 'image/png' : 'image/jpeg';
		post.enclosure = {
			url: config.url + imageURL,
			type: imageType
		};
	}

	// HTML Filter from Problem 2 here
});
```

Then I had to return to **rss.ejs**, the template, and add this under the \<item\> tag:

```XML
<% if (post.enclosure) { %>
<enclosure url="<%= post.enclosure.url %>" length="0" type="<%= post.enclosure.type %>" />
<% } %>
```

This will first check if we have enclosure metadata, and if so, create an enclosure tag using the URL we have. (Note that the image length is irrelevant, but the "length" field is specified as *required* in the [RSS 2.0 standard](https://www.rssboard.org/rss-specification#ltenclosuregtSubelementOfLtitemgt), so I left it in).

### Problem 4: What is Going On with the RSS Tags?

Since I wanted to look up the [RSS Standard](https://www.rssboard.org/rss-specification) to solve Problem 3, I looked up the tags that are supposed to be used for an RSS feed, and realized that my entire article was being stored in the \<description\> tag, obviously not the place for the entire work's content. But RSS 2.0 specifies no location for the content to go, like a \<content\> tag. How strange! In RSS 1.0, there was a [Content Module](https://web.resource.org/rss/1.0/modules/content/) that specified a common tag to place your content under, \<content\:encoded\>. Everybody still uses this RSS 1.0 standard I guess.

I'll also note that this Content Module standard requires that all content either be HTML character-escaped, or CDATA-escaped (i.e. wrapped with a \<!\[CDATA\[ ... \]\] prefix), and the HTML-escaping issue of Problem 1 was seemingly caused by this RSS renderer ***escaping it both ways at once***. I removed the HTML-escaping and left the CDATA.

My RSS XML was also missing an \<image\> tag at the channel level, which takes this format:

```XML
<image>
    <url>https://mywebsite.com/assets/favicon.png</url>
    <title>Site Title</title>
    <link>https://mywebsite.com</link>
</image>
```

Now that the \<description\> tag was freed up, I could also pull a description value from each post's metadata if it was there. These I would have to enter manually with each new post. So in all, this was my final rss.ejs file (note the image tag under *channel*, and that post.content is now under content\:encoded):

```rss.ejs
<?xml version="1.0"?>
<rss version="2.0">
    <channel>
        <title><%= config.title %><%= tag ? ` • Posts by "${tag}" tag` : '' %><%= category ? ` • Posts by "${category}" category` : '' %></title>
        <link><%- config.url %></link>
        <description><%= config.description %></description>
        <image>
            <url><%= config.url + config.favicon %></url>
            <title><%= config.title %></title>
            <link><%- config.url %></link>
        </image>
        <language><%= config.language %></language>
        <pubDate><%= moment(lastBuildDate).locale('en').format('ddd, DD MMM YYYY HH:mm:ss ZZ') %></pubDate>
        <lastBuildDate><%= moment(lastBuildDate).locale('en').format('ddd, DD MMM YYYY HH:mm:ss ZZ') %></lastBuildDate>
        <%_ for (const { name } of (tags || [])) { _%>
        <category><%= name %></category>
        <%_ } _%>
        <%_ for (const post of posts) { _%>
        <item>
            <guid isPermalink="true"><%= post.permalink %></guid>
            <title><%= post.title %></title>
            <description><%= post.description %></description>
            <creator><%= post.author %></description>
            <link><%= post.permalink %></link>
            <%_ for (const tag of (post.tags ? post.tags.toArray() : [])) { _%>
            <category><%= tag.name %></category>
            <%_ } _%>
            <pubDate><%= moment(post.date).locale('en').format('ddd, DD MMM YYYY HH:mm:ss ZZ') %></pubDate>
            <% if (post.enclosure) { %>
            <enclosure url="<%= post.enclosure.url %>" length="0" type="<%= post.enclosure.type %>" />
            <% } %>
            <content:encoded><![CDATA[ <%- post.content %> ]]></content:encoded>
        </item>
        <%_ } _%>
    </channel>
</rss>
```

### Problems Solved

It does what I want, for now, and i can control my RSS content more closely. I don't use Atom or a JSON reader, so I hope those feeds aren't in too bad a shape either.