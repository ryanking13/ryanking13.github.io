//from https://www.forsure.dev/-/2019/09/03/add-search-functionality-to-your-hugo-static-site/
document.addEventListener("DOMContentLoaded", function () {
    let searchResults = [];
    const searchWrapper = document.querySelector(".input-wrapper");
    const contentWrapper = document.querySelector(".content-wrapper");
    const searchInput = searchWrapper.querySelector("input");
    const searchResultElement = contentWrapper.querySelector(".search-results");
    var searchResultTemplate = searchResultElement.querySelector("template").innerHTML;

    function toggleSearch(searchWrapper, searchInput) {
        if (searchWrapper.classList.contains("active")) {
            searchWrapper.classList.add("visible");
            contentWrapper.querySelector(".content").style.display = "block";
            contentWrapper.querySelector(".comments").style.display = "block";
            setTimeout(function () {
                searchWrapper.classList.remove("visible");
            }, 300);
            searchWrapper.classList.remove("active");
        } else {
            searchWrapper.classList.add("active");
            contentWrapper.querySelector(".content").style.display = "none";
            contentWrapper.querySelector(".comments").style.display = "none";
            searchInput.focus();
        }
    }

    document.querySelectorAll(".toggle-search").forEach(function (el) {
        el.addEventListener("click", function (e) {
            toggleSearch(searchWrapper, searchInput);
        });
    });

    window.addEventListener("keydown", function (e) {
        // dismiss search on  ESC
        if (e.keyCode == 27 && searchWrapper.classList.contains("active")) {
            e.preventDefault();
            searchInput.value = "";
            searchResultElement.innerHTML = "";
            toggleSearch(searchWrapper, searchInput);
        }
    });


    
    var fuseOptions = {
        includeMatches: true,
        ignoreLocation: true,
        tokenize: true,
        threshold: 0.1,
        minMatchCharLength: 1,
        keys: [
            { name: "title", weight: 1 },
            { name: "category", weight: 0.2 }
        ]
    };

    function mark(content, search) {
        if (search) {
            let re = new RegExp(search, "i");
            content = content.replace(re, function (m) {
                return "<mark>" + m + "</mark>";
            });
        }   
        return content;
    }

    function urlize(string) {
        return string.toLowerCase().replace(" ", "-")
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
                        
                        return searchResultTemplate
                            .replace("{title}", mark(item.title, searchString))
                            .replace("{url}", item.url)
                            .replace("{date}", item.date)
                            .replace("{category}", mark(item.category, searchString))
                            .replace("{categoryUrl}", window.location.origin + "/categories/" + urlize(item.category))
                            .replace("{summary}", item.summary)
                    }).join("");
                } else {
                    searchResultElement.innerHTML = "<p class='no-result'>No results found</p>";
                }
            });
        })
        .catch(function (error) {
            console.error(error);
        });
});

