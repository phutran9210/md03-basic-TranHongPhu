const { error } = require("console");
var express = require("express");
var router = express.Router();
const fs = require("fs");
const path = require("path");

const usersFilePath = path.join(__dirname, "../dataJson/users.json");

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
const readUsersFile = (callback) => {
  fs.readFile(usersFilePath, "utf-8", (err, data) => {
    if (err) {
      callback(err);
    } else {
      const dataUsers = JSON.parse(data);
      callback(null, dataUsers);
    }
  });
};

const writeUsersFile = (dataUsers, callback) => {
  fs.writeFile(usersFilePath, JSON.stringify(dataUsers), (err) => {
    if (err) {
      callback(err);
    } else {
      callback(null);
    }
  });
};
//Lấy toàn bộ User
router.get("/", (req, res) => {
  readUsersFile((error, dataUsers) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      res.status(200).json(dataUsers);
    }
  });
});

//Lấy 1 User theo id
router.get("/:id", (req, res) => {
  readUsersFile((error, dataUsers) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const user = dataUsers.find(
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

//Thêm mới user
router.post("/", (req, res) => {
  readUsersFile((error, dataUsers) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const existingUser = dataUsers.find(
        (user) => user.username === req.body.username
      );
      if (existingUser) {
        return res.status(409).json({
          messenger: "username đã tồn tại",
        });
      }
      const newUser = req.body;

      newUser.id = dataUsers.length + 1;
      const checkedUser = {
        username: newUser.username,
        name: newUser.name,
        id: newUser.id,
        email: newUser.email,
      };
      dataUsers.push(checkedUser);
      writeUsersFile(dataUsers, (err) => {
        if (err) {
          return res.status(500).json({ error: "Lỗi khi ghi file" });
        } else {
          return res.status(200).json({ message: "Đã thêm mới" });
        }
      });
    }
  });
});

//Sửa user
router.put("/:id", (req, res) => {
  readUsersFile((error, dataUsers) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const userIndex = dataUsers.findIndex(
        (user) => user.id === parseInt(req.params.id)
      );
      if (userIndex === -1) {
        return res.status(404).json({ message: "user not found" });
      }
      const updatedUser = {
        ...dataUsers[userIndex],
        ...req.body,
      };
      dataUsers[userIndex] = updatedUser;
      writeUsersFile(dataUsers, (err) => {
        if (err) {
          return res.status(500).json({ error: "Lỗi khi ghi file" });
        } else {
          return res.status(200).json({ message: "Đã sửa" });
        }
      });
    }
  });
});

//Xóa user
router.delete("/:id", (req, res) => {
  readUsersFile((error, dataUsers) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const userIndex = dataUsers.findIndex(
        (user) => user.id === parseInt(req.params.id)
      );
      if (userIndex === -1) {
        return res.status(404).json({ message: "user not found" });
      }
      dataUsers.splice(userIndex, 1);
      writeUsersFile(dataUsers, (err) => {
        if (err) {
          return res.status(500).json({ error: "Lỗi khi ghi file" });
        } else {
          return res.status(200).json({ message: "Đã sửa" });
        }
      });
    }
  });
});
// Lấy toàn bộ post của User theo id
router.get("/:id/posts", (req, res) => {
  readPostFile((error, dataPosts) => {
    if (error) {
      res.status(500).json({
        error: error.message,
      });
    } else {
      const posts = dataPosts.filter(
        (post) => post.userId === parseInt(req.params.id)
      );
      if (posts.length === 0) {
        return res.status(404).json({
          message: "Không tìm thấy post nào cho user này",
        });
      }
      return res.status(200).json(posts);
    }
  });
});

module.exports = router;
