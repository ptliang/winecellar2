// Models
var Wine = Backbone.Model.extend({
    urlRoot:"api/wines",
    defaults:{
        "id":null,
        "name":"",
        "grapes":"",
        "country":"USA",
        "region":"California",
        "year":"",
        "description":"",
        "picture":""
    }
});

var WineCollection = Backbone.Collection.extend({
    model:Wine,
    url:"api/wines"
});


// Views
var WineListView = Backbone.View.extend({

    tagName:'ul',

    initialize:function () {
        this.listenTo(this.collection, "reset", this.render);
        this.listenTo(this.collection, "add", this.addWineItem);
    },

    render:function (eventName) {
        this.collection.each(this.addWineItem, this);
        return this;
    },

    addWineItem: function(wine) {
        this.$el.append(new WineListItemView({model: wine}).render().el);
    }
});

var WineListItemView = Backbone.View.extend({

    tagName:"li",

    template:_.template($('#tpl-wine-list-item').html()),

    initialize:function () {
        this.listenTo(this.model, "change", this.render);
        this.listenTo(this.model, "destroy", this.close);
    },

    render:function (eventName) {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    close:function () {
        this.remove();
    }
});

var WineView = Backbone.View.extend({

    template:_.template($('#tpl-wine-details').html()),

    initialize:function () {
        this.listenTo(this.model, "change", this.render);
    },

    render:function () {
        this.$el.html(this.template(this.model.toJSON()));
        return this;
    },

    events:{
        "change input":"change",
        "click .save":"saveWine",
        "click .delete":"deleteWine"
    },

    change:function (event) {
        var target = event.target;
        console.log('changing ' + target.id + ' from: ' + target.defaultValue + ' to: ' + target.value);
        // You could change your model on the spot, like this:
        // var change = {};
        // change[target.name] = target.value;
        // this.model.set(change);
    },

    saveWine:function () {
        this.model.set({
            name:$('#name').val(),
            grapes:$('#grapes').val(),
            country:$('#country').val(),
            region:$('#region').val(),
            year:$('#year').val(),
            description:$('#description').val()
        });
        if (this.model.isNew()) {
            var self = this;
            app.wineList.create(this.model, {
                success: function() {
                    app.navigate('wines/'+self.model.id, false);
                }
            });
        } else {
            this.model.save();
        }
        return false;
    },

    deleteWine:function () {
        this.model.destroy({
            success:function () {
                alert('Wine deleted successfully');
                window.history.back();
            }
        });
        return false;
    },

    close:function () {
        this.remove();
    }
});

var HeaderView = Backbone.View.extend({

    template:_.template($('#tpl-header').html()),

    initialize:function () {
        this.render();
    },

    render:function (eventName) {
        $(this.el).html(this.template());
        return this;
    },

    events:{
        "click .new":"newWine"
    },

    newWine:function (event) {
        app.navigate("wines/new", true);
        //if (app.wineView) app.wineView.close();
        //app.wineView = new WineView({model:new Wine()});
       // $('#content').html(app.wineView.render().el);
        return false;
    }
});


// Router
var AppRouter = Backbone.Router.extend({

    routes:{
        "": "list",
        "wines/new": "newWine",
        "wines/:id": "wineDetails"
    },

    initialize: function () {
        $('#header').html(new HeaderView().render().el);
    },

    list: function () {
        this.wineList = new WineCollection();
        this.wineListView = new WineListView({collection:this.wineList});
        var self = this;
        this.wineList.fetch({
            success: function() {
                if (self.requestedId) self.wineDetails(self.requestedId);
            }
        });
        $('#sidebar').html(this.wineListView.render().el);
    },

    newWine: function() {
        if (app.wineView) app.wineView.close();
        app.wineView = new WineView({model: new Wine()});
        $('#content').html(app.wineView.render().el);
    },

    wineDetails: function (id) {
        if (this.wineList) {
            this.wine = this.wineList.get(id);
            if (app.wineView) app.wineView.close();
            this.wineView = new WineView({model:this.wine});
            $('#content').html(this.wineView.render().el);
        } else {
            this.requestedId = id;
            this.list();
        }
    }

});

var app = new AppRouter();
Backbone.history.start();