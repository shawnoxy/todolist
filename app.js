//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const date = require(__dirname + "/date.js");

const app = express();

mongoose.connect("mongodb+srv://admin-shawn:passmore@cluster0-hqjap.mongodb.net/itemsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.set("view engine", "pug");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);

app.listen(port, function() {
  console.log("Server started successfully");
});

const itemSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please insert name for the item"]
  }
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = mongoose.Schema({
  name: String,
  items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
  const day = date.getDate();

  Item.find({}, (err, items) => {
    if (err) {
      console.log(err);
    } else {
      if (items.length === 0) {
        Item.insertMany(
          [{ name: "Shawn" }, { name: "Kumbirai" }, { name: "Dhave" }],
          err => {
            if (err) {
              console.log(err);
            } else {
              console.log("Documents added successfully");
            }
          }
        );
        res.redirect("/");
      } else {
        res.render("list", { listTitle: "Today", items});
      }
    }
  });
});

app.get("/:listName", (req, res) => {
  const listName = _.capitalize(req.params.listName);
  
  List.findOne({name: listName}, (err, foundList) => {
    if(!err) {
      if(!foundList){
        //Create a new list
        const list = new List({
          name: listName,
          items: [{ name: "Shawn" }, { name: "Kumbirai" }, { name: "Dhave" }]
        });

        list.save();
        res.redirect("/" + listName);
      } else {
        //Show existing list
        res.render("list", {listTitle: foundList.name, items: foundList.items});
      }
    }
  });
});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listTitle =req.body.listTitle;
  console.log(listTitle);

  const item = new Item({name: itemName});

  if(listTitle == "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listTitle}, (err, foundList) => {
      foundList.items.push(item);
      foundList.save();
      res.redirect(`/${listTitle}`);
    });
  }
  
});

app.post("/delete", (req, res) => {
  const itemDel = req.body.delItem;
  const listTitle = req.body.listTitle;

  if(listTitle === "Today") {
    Item.findByIdAndDelete(itemDel, (err) => {
      if(err) {
        console.log("Failed to delete item " + err);
      } else {
        console.log("Deleted Item");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: itemDel}}}, (err, foundList) => {
      if(!err) {
        res.redirect(`/${listTitle}`);
      }
    });
  }  
});

app.get("/about", function(req, res) {
  res.render("about");
});




