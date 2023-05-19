var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");

const postFilePath = path.join(__dirname, "../dataJson/posts.json");

const readPostFile = (callback) => {
  fs.readFile(postFilePath, "utf-8", (err, data) => {
    if (err) {
      callback(err);
    } else {
      const dataPosts = JSON.parse(data);
      callback(null, dataPosts);
    }
  });
};

const writeUsersFile = (dataPosts, callback) => {
  fs.writeFile(postFilePath, JSON.stringify(dataPosts), (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};
//Lấy toàn bộ post
router.get("/", (req, res) => {
  readPostFile((error, dataPosts) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      res.status(200).json(dataPosts);
    }
  });
});

//Lấy 1 post theo id
router.get("/:id", (req, res) => {
  readPostFile((error, dataPosts) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const user = dataPosts.find(
        (user) => user.id === parseInt(req.params.id)
      );
      if (!user) {
        return res.status(404).json({
          err: "ID không tồn tại",
        });
      }
      return res.status(200).json(user);
    }
  });
});

//Thêm mới post
router.post("/", (req, res) => {
  readPostFile((error, dataPosts) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const existingUser = dataPosts.find(
        (user) => user.userId === req.body.userId
      );
      if (existingUser) {
        return res.status(409).json({
          messenger: "userId đã tồn tại",
        });
      }
      const newPost = req.body;

      newPost.id = dataPosts.length + 1;
      const checkedUser = {
        userId: newPost.userId,
        title: newPost.title,
        id: newPost.id,
        body: newPost.body,
      };
      dataPosts.push(checkedUser);
      writeUsersFile(dataPosts, (err) => {
        if (err) {
          return res.status(500).json({ error: "Lỗi khi ghi file" });
        } else {
          return res.status(200).json({ message: "Đã thêm mới" });
        }
      });
    }
  });
});

//Sửa post
router.put("/:id", (req, res) => {
  readPostFile((error, dataPosts) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const postIndex = dataPosts.findIndex(
        (post) => post.id === parseInt(req.params.id)
      );
      if (postIndex === -1) {
        return res.status(404).json({ message: "post not found" });
      }
      const updatedUser = {
        ...dataPosts[postIndex],
        ...req.body,
      };
      dataPosts[postIndex] = updatedUser;
      writeUsersFile(dataPosts, (err) => {
        if (err) {
          return res.status(500).json({ error: "Lỗi khi ghi file" });
        } else {
          return res.status(200).json({ message: "Đã sửa" });
        }
      });
    }
  });
});

//Xóa post
router.delete("/:id", (req, res) => {
  readPostFile((error, dataPosts) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const postIndex = dataPosts.findIndex(
        (user) => user.id === parseInt(req.params.id)
      );
      if (postIndex === -1) {
        return res.status(404).json({ message: "user not found" });
      }
      dataPosts.splice(postIndex, 1);
      writeUsersFile(dataPosts, (err) => {
        if (err) {
          return res.status(500).json({ error: "Lỗi khi ghi file" });
        } else {
          return res.status(200).json({ message: "Đã sửa" });
        }
      });
    }
  });
});
module.exports = router;
