mambas = {
    colors: ["#63CAC6", "#88D597", "#84D8BA", "#B4E69E", "#93D8E4"],

    createProject: function() {
        swal({
            title: "Create a new Project",
            html: "<div class='form-group has-info'>" +
                "<input id='input-create-project' type='text' class='form-control' placeholder='Enter a project name' />" +
                "</div>",
            showCancelButton: true,
            confirmButtonClass: "btn btn-info",
            cancelButtonClass: "btn",
            confirmButtonText: "Create",
            buttonsStyling: false
        }).then((result) => {
            if (result.value) {
                var projectName = $("#input-create-project").val()
                var json = JSON.stringify({"name": projectName});
                $.post("/api/projects", json).done((data) => {
                    swal({
                        title: "Created",
                        html: "The Project <b>" + projectName + "</b> was created.",
                        type: "success",
                        confirmButtonClass: "btn",
                        buttonsStyling: false
                    }).then(() => {
                        var url = "/projects/" + data.id.toString() + "/dashboard";
                        window.location.href = url;
                    });
                }).fail(() => {
                    swal({
                        title: "Error",
                        html: "The Project <b>" + projectName + "</b> could not be created.",
                        type: "error",
                        confirmButtonClass: "btn",
                        buttonsStyling: false
                    });
                });
            }
        });
    },

    displayToken: function(token) {
        swal({
            title: "Token",
            html: "<div class='form-group'>" +
                "<input type='text' class='form-control text-center' value='" + token + "' readonly /><br>" +
                "<a class='btn btn-link btn-github' href='https://github.com/misterkevinski/mambas' target='_blank'>" +
                "<i class='fa fa-github'></i> Need help?</a>" +
                "</div>",
            type: "info",
            confirmButtonClass: "btn",
            buttonsStyling: false
        });
    },

    deleteProject: function(projectName, idProject, urlSuccess = null) {
        swal({
            title: "Are you sure?",
            html: "The Project <b>" + projectName + "</b> will be deleted permanently. You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn btn-warning",
            cancelButtonClass: "btn",
            confirmButtonText: "Delete",
            buttonsStyling: false
        }).then((result) => {
            if(result.value) {
                var url = "/api/projects/" + idProject;
                $.ajax({
                    url: url,
                    type: "DELETE"
                }).done(() => {
                    swal({
                        title: "Deleted",
                        html: "The Project <b>" + projectName + "</b> was deleted.",
                        type: "success",
                        confirmButtonClass: "btn",
                        buttonsStyling: false
                    }).then(() => {
                        if(urlSuccess != null) {
                            window.location.href = urlSuccess;
                        } else {
                            window.location.href = window.location.reload();
                        }
                    });
                }).fail(() => {
                    swal({
                        title: "Error",
                        html: "The Project <b>" + projectName + "</b> could not be deleted.",
                        type: "error",
                        confirmButtonClass: "btn",
                        buttonsStyling: false
                    });
                });
            }
        });
    },

    deleteSession: function(sessionName, idProject, idSession, urlSuccess = null) {
        swal({
            title: "Are you sure?",
            html: "The Session <b>" + sessionName + "</b> will be deleted permanently. You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonClass: "btn btn-warning",
            cancelButtonClass: "btn",
            confirmButtonText: "Delete",
            buttonsStyling: false
        }).then((result) => {
            if(result.value) {
                var url = "/api/projects/" + idProject + "/sessions/" + idSession;
                $.ajax({
                    url: url,
                    type: "DELETE"
                }).done(() => {
                    swal({
                        title: "Deleted",
                        html: "The session <b>" + sessionName + "</b> was deleted.",
                        type: "success",
                        confirmButtonClass: "btn",
                        buttonsStyling: false
                    }).then(() => {
                        if(urlSuccess != null) {
                            window.location.href = urlSuccess;
                        } else {
                            window.location.reload();
                        }
                    });
                }).fail(() => {
                    swal({
                        title: "Error",
                        html: "The session <b>" + sessionName + "</b> could not be deleted.",
                        type: "error",
                        confirmButtonClass: "btn",
                        buttonsStyling: false
                    });
                });
            }
        });
    },

    changeSessionFavorite: async function(idProject, idSession, isFavorite) {
        var url = "/api/projects/" + idProject + "/sessions/" + idSession;
        var json = JSON.stringify({"is_favorite": isFavorite ? 1 : 0});
        var success = false;
        await $.ajax({
            url: url,
            type: "PUT",
            contentType: "application/json",
            data: json
        }).done(() => {
            success = true;
        }).fail((data) => {
            var verb = isFavorite ? "mark" : "unmark";
            swal({
                title: "Error",
                html: "Could not " + verb + " this Session as favorite.",
                type: "error",
                confirmButtonClass: "btn",
                buttonsStyling: false
            });
        }).catch(() => {});
        return success;
    },

    showChart: function(elem, mode = "epoch") {
        elem.empty();
        var id = elem.attr("id");
        var data = JSON.parse(elem.data("data").replace(new RegExp("'", "g"), '"'));
        var keys = [], labels = [];
        for(key in data[0]) {
            if(key != "epoch" && key != "time") {
                keys.push(key);
            }
        }
        for(var i = 0; i < keys.length; i++) {
            var key = keys[i]; 
            if(key == "loss") {
                labels.push("Loss");
            } else if(key == "val_loss") {
                labels.push("Validation loss");
            } else if(key == "acc") {
                labels.push("Accuracy");
            } else if(key == "val_acc") {
                labels.push("Validation accuracy");
            } else {
                labels.push(key);
            }
        }
        var parseTime = mode == "time";
        Morris.Area({
            element: id,
            data: data,
            xkey: mode,
            ykeys: keys,
            labels: labels,
            parseTime: parseTime,
            pointSize: 0,
            fillOpacity: 0,
            behaveLikeLine: true,
            gridLineColor: "#e0e0e0",
            lineWidth: 4,
            hideHover: "auto",
            lineColors: mambas.colors,
            resize: true,
            hoverCallback: function (index, options, content, row) {
                var result = "";
                result += "<span style='font-weight: bold'>Epoch " + data[index].epoch;
                result += "<br>" + data[index].time + "</span>";
                for(var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    var label = labels[i];
                    var color = mambas.colors[i];
                    result += "<br>" + "<span style='color: " + color + "'>&#x25cf;</span> ";
                    result += label + ": ";
                    result += data[index][key].toPrecision(5);
                }
                return result;
            }
        });
    }
};

$(function() {
    "use strict";

    // NAVIGATION -----------------------------------------------------------------------

    // Add 'active' and 'show' classes to current activated navigation items
    $(function() {
        var path = window.location.pathname;
        path = path.replace(/\/$/, "");
        path = decodeURIComponent(path);
        $(".nav li a").each(function() {
            var href = $(this).attr("href");
            if(path.substring(0, href.length) === href) {
                $(this).parent("li").addClass("active");
                $(this).parents(".collapse").addClass("show");
            }
        })
    });

    // TABLE ----------------------------------------------------------------------------

    $(".clickable-row").click(function(event) {
        var elem = $(event.target);
        if(elem.parents("button").length < 1 && !elem.is("button") &&
           elem.parents("a").length < 1 && !elem.is("a")) {
            window.location = $(this).data("href");
        }
    });

    // TOGGLE BUTTON --------------------------------------------------------------------

    // Add 'checked' class to icons on loading when checkbox is initial checked
    $(".btn-toggle").each(function() {
        var cb = $(this).find("input:checkbox");
        var state = cb.is(":checked");
        var icons = $(this).find(".icons");
        icons.removeClass("animated");
        if(state) {
            icons.addClass("checked");
        }
    });

    // Trigger checkbox to handle click event and change icons
    $(".btn-toggle").click(function(event) {
        var cb = $(this).find("input:checkbox");
        cb.click();
        var state = cb.is(":checked");
        var icons = $(this).find(".icons");
        icons.addClass("animated");
        if(state) {
            icons.addClass("checked");
        } else {
            icons.removeClass("checked");
        }
    });

    // CHART ----------------------------------------------------------------------------

    $(".chart").each(function() {
        var chart = $(this);
        var idToggle = chart.data("toggle-id");
        var toggle = $("#" + idToggle);
        if(toggle.is(":checked")) {
            mambas.showChart(chart, "time");
        } else {
            mambas.showChart(chart);
        }
        toggle.on("click", function(event) {
            if($(this).is(":checked")) {
                mambas.showChart(chart, "time");
            } else {
                mambas.showChart(chart);
            }
        });
    });

    $(".chart").hideShow().on("visibilityChanged", function(event, visibility) {
        if(visibility == "shown") {
            var chart = $(this);
            var idToggle = chart.data("toggle-id");
            var toggle = $("#" + idToggle);
            if(toggle.is(":checked")) {
                mambas.showChart(chart, "time");
            } else {
                mambas.showChart(chart);
            }
        }
    });

    // MARK SESSION BUTTON --------------------------------------------------------------

    $(".mark-session").on("click", async function() {
        var idProject = $(this).data("id-project");
        var idSession = $(this).data("id-session");
        var isFavorite = $(this).is(":checked");
        var successful = await mambas.changeSessionFavorite(idProject, idSession, isFavorite);
        if(!successful) {
            $(this).prop("checked", !isFavorite);
            var button = $(this).parent(".btn-toggle");
            var state = $(this).is(":checked");
            var icons = button.find(".icons");
            icons.removeClass("animated");
            if(state) {
                icons.addClass("checked");
            } else {
                icons.removeClass("checked");
            }
        }
    });
});