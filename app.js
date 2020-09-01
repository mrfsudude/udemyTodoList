//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/todolistDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);


// Create some default items (for first time todolist use)
const item1 = new Item({
  name: "welcome to your to do list!"
});

const item2 = new Item({
  name: "Click the '+' to add a new item"
});

const item3 = new Item({
  name: "<- Click this button to remove"
});

const defaultArr = [item1, item2, item3];


// Create a way of making new lists and a main list
const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);


// handle requests
app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {

    if (foundItems.length === 0) {
      Item.insertMany(defaultArr, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log('added items');
        }
      });
      res.redirect("/");
    }

    res.render("list", {
      listTitle: "today",
      newListItems: foundItems
    });
  })
});

app.get("/:paramName", function(req, res) {
  const paramName = req.params.paramName

  List.findOne({
    name: paramName
  }, function(err, foundList) {
    if (!err) {
      if (!foundList) {

        const list = new List({
          name: paramName,
          items: defaultArr
        });

        list.save();

        res.redirect("/" + paramName);

      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items
        })
      }
    }
  })
})

app.post("/", function(req, res) {

  const newItem = req.body.newItem;
  const listName = req.body.list;

  const newToDo = new Item({
    name: newItem
  })

  if (listName === "today") {
    newToDo.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(newToDo);
      foundList.save();
      res.redirect("/" + listName)
    })
  }
});

app.post("/delete", function(req, res) {
  const checkedItem = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === 'today') {
    Item.findByIdAndRemove(checkedItem, function(err) {
      if (!err) {
        console.log('successfully deleted item');
        res.redirect("/");
      };
    });
  } else {
    List.findOneAndUpdate({
      name: listName
    }, {
      $pull: {
        items: {
          _id: checkedItem
        }
      }
    }, function(err) {
      if (!err) {
        console.log('successfully deleted ' + checkedItem);
      }
    });
    res.redirect("/" + listName);
  }
});


app.post("/:paramName", function(req, res) {
  const paramName = req.params.paramName;

})

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
