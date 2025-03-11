const fs = require("fs");

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
);

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: "success",
    reqTime: req.requestTime,
    results: users.length,
    data: {
      users: users,
    },
  });
};

exports.getUser = (req, res) => {
  const { id } = req.params;
  if (id > users.length) {
    res.status(400).json({
      status: "fail",
      message: `Tour with id ${id} not found`,
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      tours: users[id],
    },
  });
};

exports.createUser = (req, res) => {
  const newId = users[users.length - 1].id + 1;
  const newUser = Object.assign(
    {
      id: newId,
    },
    req.body
  );
  users.push(newUser);
  fs.writeFile(
    `${__dirname}/dev-data/data/users.json`,
    JSON.stringify(users),
    (err) => {
      res.status(201).json({
        status: "success",
        data: {
          user: newUser,
        },
      });
    }
  );

  // res.send("Done")
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  if (id > tours.length) {
    return res.status(400).json({
      status: "fail",
      message: `Tour with id ${id} not found`,
    });
  }
  res.status(200).json({
    status: "success",
    data: {
      tour: "<Updated tour here...>",
    },
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;
  if (id > tours.length) {
    return res.status(400).json({
      status: "fail",
      message: `Tour with id ${id} not found`,
    });
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
};
