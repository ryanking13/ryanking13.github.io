## Type-on-Strap on Gem :gem: [![Build Status](https://travis-ci.org/Sylhare/Type-on-Strap.svg?branch=gem-demo)](https://travis-ci.org/Sylhare/Type-on-Strap)


Here is a simple example on how to use the template as a gem. 

### Pre-requisite

Make sure you have Jekyll installed
```
gem install jekyll bundler
```
If you have any trouble, check [#1](https://github.com/Sylhare/Type-on-Strap/issues/1)

You need to add your content:
  - Pictures in `assets\img`
  - Posts in `_posts` with the correct Jeyll format
  - Your project pages in `_portfolio`
  - Any other page and feature pages (using the layout) in `pages`
  - The `_config.yml` file with all of the right configuration in it.
  - The `index.html` page that will be the home of your website
  
All the rest is already within the Gem and you don't need to tale care of it.
  
### Start your website  

To use type-on-strap as a gem, you first need to install the gem:
  
  - Directly with `gem install type-on-trap`
  - Using gemfile `Bundle install` 
  
Then you can start your website using:
```
jekyll serve
```

### Warning

> **:warning: Does not work in Github page as a Gem.**
>
> For a **Github page**, please [fork the master branch](https://github.com/Sylhare/Type-on-Strap) and follow the instructions

