import express from "express";
import {getDate} from "./date.js";
import mongoose from "mongoose";
import _ from "lodash";

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://srdjanmaljukan:test123@cluster0.thidtkz.mongodb.net/todolistDB");

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Do the dishes."
});

const item2 = new Item({
  name: "Buy food."
});

const item3 = new Item({
  name: "Do laundry."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

const day = getDate();

Item.find({}).then(function(foundItems, err){
  if (foundItems.length === 0) {
    Item.insertMany(defaultItems).then(function(data) {
      console.log(data);
    });
    res.redirect("/");
  } else {
  res.render("list", {listTitle: day, newListItems: foundItems});
  }}
);

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });

  if (listName === getDate()) {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}).then(function(foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    })
  }


});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === getDate()) {
    Item.findByIdAndRemove(checkedItemId).then(function (data) {
      console.log(data);
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function(foundList) {
      res.redirect("/" + listName);
    })
  }

  
})

app.get("/:listName", function(req, res) {
  const customListName = _.capitalize(req.params.listName);

  List.findOne({name: customListName}).then(function(foundList, err) {
    if (!err) {
      if (!foundList) {
        //Create new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });

  

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
