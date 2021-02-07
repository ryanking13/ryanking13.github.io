//from https://www.forsure.dev/-/2019/09/03/add-search-functionality-to-your-hugo-static-site/
document.addEventListener("DOMContentLoaded", function () {
    let searchResults = [];
    const searchWrapper = document.querySelector("aside[role=search]");
    const searchResultElement = searchWrapper.querySelector(".search-results");
    const searchInput = searchWrapper.querySelector("input");
    
    var fuseOptions = {
        shouldSort: true,
        includeMatches: true,
        threshold: 0.0,
        tokenize: true,
        location: 0,
        distance: 100,
        maxPatternLength: 32,
        minMatchCharLength: 1,
        keys: [
            { name: "title", weight: 0.8 },
            { name: "contents", weight: 0.5 },
            { name: "tags", weight: 0.3 },
            { name: "categories", weight: 0.3 }
        ]
    };

    function categories(categories, searchString) {
        let tagHTML = (categories.split(" ; ") || [])
            .filter(function (i) {
                return i && i.length > 0;
            })
            .map(function (i) {
                return "<span class='tag'>" + mark(i, searchString) + "</span>";
            })
        return tagHTML.join("");
    }

    function mark(content, search) {
        if (search) {
            let pattern = /^[a-zA-Z0-9]*:/i;
            search.split(" ").forEach(function (s) {
                if (pattern.test(s)) {
                    s = s.replace(pattern, "");
                }
                if (s && s.startsWith("+")) {
                    s = s.substring(1);
                }
                if (s && s.indexOf("~") > 0 && s.length > s.indexOf("~") && parseInt(s.substring(s.indexOf("~") + 1)) == s.substring(s.indexOf("~") + 1)) {
                    s = s.substring(0, s.indexOf("~"));
                }
                if (!s || s.startsWith("-")) {
                    return;
                }
                let re = new RegExp(s, "i");
                content = content.replace(re, function (m) {
                    return "<mark>" + m + "</mark>";
                });
            });
        }

        return content;
    }

    axios.get("/search-data")
        .then(function (result) {
            const searchContent = result.data;
            var fuse = new Fuse(searchContent, fuseOptions);
            searchInput.removeAttribute("disabled");
            searchInput.addEventListener("keyup", function (e) {
                let searchString = e.target.value;
                if (searchString && searchString.length >= 2) {
                    searchResults = fuse.search(searchString);
                } else {
                    searchResults = [];
                }

                if (searchResults.length > 0) {
                    searchResultElement.innerHTML = searchResults.map(function (match) {
                        let item = searchContent.find(function (e) {
                            return e.id == parseInt(match.item.id);
                        });
                        
                        return "<li>" +
                            "<h4 title='field: title'><a href='" + item.url + "'>" + mark(item.title, searchString) + "</a></h4>" +
                            "<p class='summary' title='field: content'>" +
                            mark((item.content.length > 200 ? (item.content.substring(0, 200) + "...") : item.content), searchString) +
                            "</p>" +
                            "<p class='tags' title='field: tag'>" + categories(item.categories, searchString) + "</p>" +
                            "<a href='" + item.url + "' title='field: url'>" + item.url + "</a>" +
                            "</li>";
                    }).join("");
                } else {
                    searchResultElement.innerHTML = "<li><p class='no-result'>No results found</p></li>";
                }
            });
        })
        .catch(function (error) {
            console.error(error);
        });
});

