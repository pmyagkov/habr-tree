




;(function ($) {

    "use strict";
/*
    var Semaphor = function () {
        this._number = 10;
        this._queue = [];
    };

    Semaphor.prototype = {
        enter: function (f) {



            if (this._number > 0) {

            }
            else {
                var def = $.Deferred();
                def.done(f);
                this._queue.push(def);
            }
        }
    }


    var sem = {
        _number: 10,
        down: function () {

        }
    };
    */
    var connectionsNumber = 10;

    User.users = [];
    function User(id, link, invitedBy) {
        var user;
        if (user = User.users[id]) {
            return user;
        }
        else {
            this.id = id;
            this.link = link;
            this.children = [];
            if (invitedBy) {
                this.parent = invitedBy;
            }
            User.users.push(this);
        }
    }

    User.prototype.process = function () {
        var self = this;
        var def = $.Deferred();



        $.get(self.link).done(function (html) {
            var $html = $(html);
            var $invited = $html.find("#invited-by");
            if ($invited.length) {
                self.parent = new User($invited.text(), $invited.attr("href"));
            }

            if (!self.children.length) {
                $html.find("#invited_data_items li:not(.no_icon)").each(function (i, e) {
                    var $l = $(e).find("a");
                    self.children.push(new User($l.text(), $l.attr("href"), self));
                });
            }

            self.processed = true;

            def.resolve(self);

        }).fail(function () {
            console.warn("Trying to fetch '" + self.id + "' again!");
/*            debugger;*/
            def = self.process();
        });

        return def;
    };

    User.prototype.render = function (sut) {
        this.$root.children(".id").text(this.id);
        for (var i = 0; i < this.children.length; i++) {
            var child = this.children[i];
            child.$root = $("<li>").append($("<span>", {class: "id " + (child.id == sut.id ? "red" : "")}).text(child.id)).appendTo(this.$root);
        }
    }

    /* TREE BUILDER */
    function TreeBuilder(user) {
        this.originalUser = user;
        this._temp = user;
    }
    TreeBuilder.prototype._traverseUpHelper = function (u) {
        if (u.parent) {
            this._temp = u.parent;
            this.traverseUp();
        }
        else {
            this.root = this._temp;
            this._def.resolve(this.root);
        }

    }
    TreeBuilder.prototype.traverseUp = function() {
        var self = this;

        if (!self._def) {
            self._def = $.Deferred();
        }

        if (!self._temp.processed) {
            self._temp.process().done(function () {
                self._traverseUpHelper.apply(self, arguments);
            });
        }
        else {
            self._traverseUpHelper(self._temp);
        }

        return self._def;
    }

    TreeBuilder.prototype.buildTree = function(child) {
        var self = this;
        if (child == null) {
            self.root.$root = $("<ul>").appendTo($("<div class='column'>").append($("<span>").addClass("id " + (self.root.id == self.originalUser.id ? "red" : "")).text(self.root.id)).appendTo($body));
            child = self.root;
        }

        console.log("Processing user:");
        console.log(child);

        child.process().done(function (user){
            user.render(self.originalUser);
            for (var i = 0; i < user.children.length; i++) {
                self.buildTree(user.children[i]);
            }

        });
    }

    var $body = $("body");

    $("body > *").hide();

    $body.append($("<style>").text(".column {float: left}span.red {color: red} ul li:before {content: '├—'} li {padding: 0 0 0 5px} li, div {text-align:left}"));


    var users = [];

    var depth = 5;

    $(".users.peoples > .user").each(function (i, e) {
        var $e = $(e);
        var $link = $e.find(".username a");
        users.push(new User($link.text(), $link.attr("href")));
    });

    var processingUsers = users.slice(0, 20);

    for (var i = 1; i < processingUsers.length; i++) {
        (function () {
            var builder = new TreeBuilder(processingUsers[i]);
            builder.traverseUp().done(function(root) {
                builder.buildTree();
            });


        })();

    }
}) (jQuery);
