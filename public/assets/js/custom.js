jQuery(window).on("load", function () {
    $("#preloader").fadeOut(500);
    $("#main-wrapper").addClass("show");
    $("body").attr("data-sidebar-style") === "mini" ? $(".hamburger").addClass("is-active") : $(".hamburger").removeClass("is-active");
});
